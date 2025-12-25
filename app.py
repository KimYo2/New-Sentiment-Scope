"""
Flask Backend for Sentiment Classification App
Enhanced version with logging, better error handling, and input validation
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import logging
import pandas as pd
from datetime import datetime
from extensions import db, jwt, limiter
from auth import auth_bp
from models import Analysis
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, jwt_required
from model_loader import predict_sentiment_bert, predict_aspect_sentiment, is_model_loaded, reload_model
from scraper import get_youtube_comments
from train import train
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for API access

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sentiment.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this-in-production'

# Global Training Status
TRAINING_STATUS = {
    'is_training': False,
    'message': '',
    'timestamp': None
}

# Initialize Extensions
db.init_app(app)
jwt.init_app(app)
limiter.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp)

# Create Database Tables
with app.app_context():
    db.create_all()

# Configuration constants
MIN_TEXT_LENGTH = 10
MAX_TEXT_LENGTH = 1000

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/api/classify', methods=['POST'])
def classify_sentiment():
    """
    API endpoint to classify sentiment from text input
    {
        "text_input": "Your text here"
    }
    
    Returns JSON format:
    {
        "status": "success",
        "sentiment": "Positif/Negatif/Netral",
        "text_length": 123
    }
    
    Error responses:
    - 400: Invalid input (missing, empty, too short, too long)
    - 500: Server error during processing
    """
    try:
        # Log incoming request
        logger.info(f"Received classification request from {request.remote_addr}")
        
        # Validate Content-Type
        if not request.is_json:
            logger.warning("Request without JSON content-type")
            return jsonify({
                'status': 'error',
                'message': 'Content-Type harus application/json'
            }), 400
        
        # Get JSON data from request
        data = request.get_json()
        
        # Check if data exists
        if data is None:
            logger.warning("Empty JSON body")
            return jsonify({
                'status': 'error',
                'message': 'Request body tidak valid'
            }), 400
        
        # Extract text input
        text_input = data.get('text_input', '')
        
        # Validate input exists
        if not text_input or text_input.strip() == '':
            logger.warning("Empty text input received")
            return jsonify({
                'status': 'error',
                'message': 'Teks tidak boleh kosong'
            }), 400
        
        # Clean and get text length
        text_input = text_input.strip()
        text_length = len(text_input)
        
        # Validate minimum length
        if text_length < MIN_TEXT_LENGTH:
            logger.warning(f"Text too short: {text_length} characters")
            return jsonify({
                'status': 'error',
                'message': f'Teks terlalu pendek (minimal {MIN_TEXT_LENGTH} karakter)'
            }), 400
        
        # Validate maximum length
        if text_length > MAX_TEXT_LENGTH:
            logger.warning(f"Text too long: {text_length} characters")
            return jsonify({
                'status': 'error',
                'message': f'Teks terlalu panjang (maksimal {MAX_TEXT_LENGTH} karakter)'
            }), 400
        
        # Log the analysis
        logger.info(f"Analyzing text ({text_length} characters): {text_input[:100]}...")
        
        # Get sentiment prediction
        sentiment, confidence = predict_sentiment_bert(text_input)
        
        # Get aspect-based sentiment
        aspects = predict_aspect_sentiment(text_input)
        
        # Save to DB if authenticated
        try:
            verify_jwt_in_request(optional=True)
            current_user_id = get_jwt_identity()
            if current_user_id:
                analysis = Analysis(
                    user_id=current_user_id,
                    text=text_input,
                    sentiment=sentiment,
                    confidence=confidence
                )
                db.session.add(analysis)
                db.session.commit()
                logger.info(f"Analysis saved for user {current_user_id}")
        except Exception as e:
            logger.warning(f"Failed to save analysis history: {e}")
            # Don't fail the request just because history saving failed
        
        # Return successful response
        response = {
            'status': 'success',
            'sentiment': sentiment,
            'confidence': confidence,
            'aspects': aspects,
            'text_length': text_length,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Classification successful: {sentiment}, Aspects: {len(aspects)}")
        return jsonify(response), 200
        
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Input tidak valid'
        }), 400
    
    except Exception as e:
        # Handle any unexpected errors
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Terjadi kesalahan pada server. Silakan coba lagi.'
        }), 500


@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    """
    Get analysis history for the current user
    """
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = Analysis.query.filter_by(user_id=current_user_id)\
        .order_by(Analysis.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
        
    history = [item.to_dict() for item in pagination.items]
    
    return jsonify({
        'status': 'success',
        'history': history,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@app.route('/api/stats/trend', methods=['GET'])
@jwt_required()
def get_sentiment_trend():
    """
    Get daily sentiment counts for the last 7 days
    """
    current_user_id = get_jwt_identity()
    from sqlalchemy import func, text
    from datetime import timedelta
    
    # Calculate date 7 days ago
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Query to group by date and sentiment
    # SQLite-specific date formatting
    results = db.session.query(
        func.date(Analysis.created_at).label('date'),
        Analysis.sentiment,
        func.count(Analysis.id)
    ).filter(
        Analysis.user_id == current_user_id,
        Analysis.created_at >= seven_days_ago
    ).group_by(
        func.date(Analysis.created_at),
        Analysis.sentiment
    ).all()
    
    # Process results
    dates = []
    # Create a map for easy lookup
    data_map = {}
    
    # Initialize last 7 days
    for i in range(7):
        d = (seven_days_ago + timedelta(days=i+1)).strftime('%Y-%m-%d')
        dates.append(d)
        data_map[d] = {'Positif': 0, 'Negatif': 0, 'Netral': 0}
        
    for r in results:
        date_str = r[0]
        sentiment = r[1]
        count = r[2]
        if date_str in data_map:
            data_map[date_str][sentiment] = count
            
    # Format for Chart.js
    response = {
        'dates': dates,
        'positive': [data_map[d]['Positif'] for d in dates],
        'negative': [data_map[d]['Negatif'] for d in dates],
        'neutral': [data_map[d]['Netral'] for d in dates]
    }
    
    return jsonify(response), 200


@app.route('/api/stats/summary', methods=['GET'])
@jwt_required()
def get_sentiment_summary():
    """
    Get summary stats (Total, Positive, Negative) for the dashboard
    """
    current_user_id = get_jwt_identity()
    
    # Get all analyses for the user
    total = Analysis.query.filter_by(user_id=current_user_id).count()
    positive = Analysis.query.filter_by(user_id=current_user_id, sentiment='Positif').count()
    negative = Analysis.query.filter_by(user_id=current_user_id, sentiment='Negatif').count()
    neutral = Analysis.query.filter_by(user_id=current_user_id, sentiment='Netral').count()
    
    return jsonify({
        'status': 'success',
        'total': total,
        'positive': positive,
        'negative': negative,
        'neutral': neutral
    }), 200


@app.route('/api/stats/wordcloud', methods=['GET'])
@jwt_required()
def get_wordcloud_data():
    """
    Get word frequency for word cloud
    """
    current_user_id = get_jwt_identity()
    import re
    from collections import Counter
    
    # Get all text from user's history
    analyses = Analysis.query.filter_by(user_id=current_user_id).all()
    
    if not analyses:
        return jsonify([]), 200
        
    all_text = " ".join([a.text.lower() for a in analyses])
    
    # Simple tokenization and cleanup
    # Remove non-alphanumeric characters
    words = re.findall(r'\w+', all_text)
    
    # Indonesian Stopwords (Basic list)
    stopwords = set([
        'yang', 'di', 'dan', 'itu', 'dengan', 'untuk', 'tidak', 'ini', 'dari',
        'dalam', 'akan', 'pada', 'juga', 'saya', 'ke', 'karena', 'tersebut',
        'bisa', 'ada', 'mereka', 'lebih', 'sudah', 'atau', 'saat', 'oleh',
        'sebagai', 'adalah', 'apa', 'kita', 'kamu', 'dia', 'anda', 'aku',
        'sangat', 'tapi', 'namun', 'jika', 'kalau', 'maka', 'sehingga',
        'banyak', 'sedikit', 'kurang', 'cukup', 'paling', 'seperti', 'hanya'
    ])
    
    # Filter words
    filtered_words = [w for w in words if w not in stopwords and len(w) > 3]
    
    # Count frequency
    word_counts = Counter(filtered_words)
    
    # Format for word cloud library (e.g., [{text: 'word', weight: 10}])
    # Return top 50
    result = [
        {'text': word, 'weight': count} 
        for word, count in word_counts.most_common(50)
    ]
    
    return jsonify(result), 200


@app.route('/api/scrape', methods=['POST'])
def scrape_youtube():
    """
    Scrape YouTube comments
    """
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'status': 'error', 'message': 'URL is required'}), 400
            
        logger.info(f"Scraping YouTube URL: {url}")
        
        # Get comments
        comments = get_youtube_comments(url, limit=20)
        
        if not comments:
            return jsonify({'status': 'error', 'message': 'Could not fetch comments. Check if the video has comments enabled.'}), 400
            
        # Analyze each comment
        results = []
        stats = {'Positif': 0, 'Negatif': 0, 'Netral': 0}
        
        for comment in comments:
            if len(comment) < 3:
                continue
                
            sentiment, confidence = predict_sentiment_bert(comment)
            
            results.append({
                'text': comment,
                'sentiment': sentiment,
                'confidence': confidence
            })
            stats[sentiment] += 1
            
        return jsonify({
            'status': 'success',
            'results': results,
            'stats': stats,
            'total': len(results)
        }), 200
        
    except Exception as e:
        logger.error(f"YouTube scraping error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/brand/battle', methods=['POST'])
def brand_battle():
    """
    Compare two YouTube videos (Brand vs Competitor)
    """
    try:
        data = request.get_json()
        url_a = data.get('url_a')
        url_b = data.get('url_b')
        
        if not url_a or not url_b:
            return jsonify({'status': 'error', 'message': 'Both URLs are required'}), 400
            
        # Helper function to analyze a single URL
        def analyze_url(url):
            comments = get_youtube_comments(url, limit=30) # Limit 30 for speed
            if not comments: return None
            
            stats = {'Positif': 0, 'Negatif': 0, 'Netral': 0}
            for comment in comments:
                if len(comment) < 3: continue
                sentiment, _ = predict_sentiment_bert(comment)
                stats[sentiment] += 1
            
            total = sum(stats.values())
            positive_pct = round((stats['Positif'] / total * 100), 1) if total > 0 else 0
            
            return {
                'stats': stats,
                'total': total,
                'positive_pct': positive_pct
            }
            
        # Analyze both
        result_a = analyze_url(url_a)
        result_b = analyze_url(url_b)
        
        if not result_a or not result_b:
            return jsonify({'status': 'error', 'message': 'Failed to fetch comments for one or both videos'}), 400
            
        # Determine Verdict
        gap = result_a['positive_pct'] - result_b['positive_pct']
        if gap > 10:
            verdict = "Dominating! 🏆"
            message = "Brand Anda jauh lebih unggul dalam sentimen positif."
        elif gap > 0:
            verdict = "Leading Narrowly 👍"
            message = "Brand Anda sedikit lebih unggul, namun kompetisi ketat."
        elif gap > -10:
            verdict = "Close Call 🤝"
            message = "Sentimen berimbang. Cek keluhan untuk finding gap."
        else:
            verdict = "Falling Behind ⚠️"
            message = "Kompetitor lebih disukai. Pelajari strategi mereka."
            
        return jsonify({
            'status': 'success',
            'brand_a': result_a,
            'brand_b': result_b,
            'verdict': {
                'title': verdict,
                'message': message,
                'gap': gap
            }
        }), 200

    except Exception as e:
        logger.error(f"Battle error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/youtube/save', methods=['POST'])
def save_youtube_analysis():
    """
    Save YouTube analysis for later comparison (for Creators & Brand Managers)
    """
    try:
        from datetime import datetime
        data = request.get_json()
        label = data.get('label', 'Untitled')
        video_url = data.get('video_url')
        analysis_data = data.get('analysis_data')
        
        if not video_url or not analysis_data:
            return jsonify({'status': 'error', 'message': 'Missing required data'}), 400
        
        # Get current user (if authenticated, otherwise use anonymous)
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except Exception:
            pass  # Not authenticated
        
        # Save to database using raw SQL
        import json
        conn = db.engine.raw_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO saved_youtube_analysis (user_id, label, video_url, analysis_data, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, label, video_url, json.dumps(analysis_data), datetime.now()))
        conn.commit()
        saved_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Analysis saved successfully',
            'saved_id': saved_id
        }), 200
        
    except Exception as e:
        logger.error(f"Save YouTube analysis error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/youtube/saved', methods=['GET'])
def get_saved_youtube():
    """
    Get list of saved YouTube analyses
    """
    try:
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except Exception:
            pass
        
        conn = db.engine.raw_connection()
        cursor = conn.cursor()
        if user_id:
            cursor.execute("""
                SELECT id, label, video_url, created_at
                FROM saved_youtube_analysis
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 10
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT id, label, video_url, created_at
                FROM saved_youtube_analysis
                WHERE user_id IS NULL
                ORDER BY created_at DESC
                LIMIT 10
            """)
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        saved = [{
            'id': row[0],
            'label': row[1],
            'video_url': row[2],
            'created_at': str(row[3])
        } for row in rows]
        
        return jsonify({'status': 'success', 'saved': saved}), 200
        
    except Exception as e:
        logger.error(f"Get saved YouTube error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/batch-classify', methods=['POST'])
def batch_classify():
    """
    Classify sentiment for a batch of texts from CSV/Excel file
    Enhanced with product grouping for UMKM
    """
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No selected file'}), 400
            
        if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
            return jsonify({'status': 'error', 'message': 'File must be CSV or Excel'}), 400
            
        # Read file
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'Error reading file: {str(e)}'}), 400
            
        # Find text column
        text_col = None
        possible_cols = ['text', 'review', 'content', 'komentar', 'ulasan', 'comment']
        
        for col in df.columns:
            if col.lower() in possible_cols:
                text_col = col
                break
                
        if not text_col:
            # If no matching column, take the first string column
            for col in df.columns:
                if df[col].dtype == 'object':
                    text_col = col
                    break
                    
        if not text_col:
             return jsonify({'status': 'error', 'message': 'Could not find a text column in the file'}), 400
        
        # Check for Product column (NEW)
        product_col = None
        possible_product_cols = ['product', 'produk', 'nama produk', 'product name', 'item']
        
        for col in df.columns:
            if col.lower() in possible_product_cols:
                product_col = col
                break
             
        # Limit rows for performance
        if len(df) > 1000:
            df = df.head(1000)
            
        results = []
        stats = {'Positif': 0, 'Negatif': 0, 'Netral': 0}
        product_stats = {}  # NEW: Track stats per product
        product_reviews = {}  # NEW: Store reviews per product for insights
        
        for index, row in df.iterrows():
            text = str(row[text_col])
            if len(text) < 3:
                continue
                
            sentiment, confidence = predict_sentiment_bert(text)
            
            result_item = {
                'text': text,
                'sentiment': sentiment,
                'confidence': confidence,
                'original_row': index
            }
            
            # Add product info if available (NEW)
            if product_col:
                product = str(row[product_col])
                result_item['product'] = product
                
                # Initialize product stats if not exists
                if product not in product_stats:
                    product_stats[product] = {'Positif': 0, 'Negatif': 0, 'Netral': 0, 'total': 0}
                    product_reviews[product] = {'positive': [], 'negative': []}
                
                # Update product stats
                product_stats[product][sentiment] += 1
                product_stats[product]['total'] += 1
                
                # Store reviews for insights generation
                if sentiment == 'Positif':
                    product_reviews[product]['positive'].append(text.lower())
                elif sentiment == 'Negatif':
                    product_reviews[product]['negative'].append(text.lower())
            
            results.append(result_item)
            stats[sentiment] += 1
        
        # Generate Smart Insights (NEW)
        insights = []
        if product_col and product_stats:
            # Calculate percentage for each product
            for product, pstats in product_stats.items():
                total = pstats['total']
                if total > 0:
                    pos_pct = round((pstats['Positif'] / total) * 100)
                    neg_pct = round((pstats['Negatif'] / total) * 100)
                    pstats['positive_pct'] = pos_pct
                    pstats['negative_pct'] = neg_pct
            
            # Find best performing product
            best_product = max(product_stats.items(), key=lambda x: x[1]['positive_pct'])
            insights.append({
                'type': 'success',
                'icon': '🌟',
                'title': 'Produk Terbaik',
                'message': f"{best_product[0]} memiliki {best_product[1]['positive_pct']}% review positif!"
            })
            
            # Find worst performing product
            worst_product = max(product_stats.items(), key=lambda x: x[1]['negative_pct'])
            if worst_product[1]['negative_pct'] > 30:
                insights.append({
                    'type': 'warning',
                    'icon': '⚠️',
                    'title': 'Perlu Perhatian',
                    'message': f"{worst_product[0]} mendapat {worst_product[1]['negative_pct']}% review negatif. Perlu ditingkatkan."
                })
            
            # Extract common keywords from negative reviews
            all_negative_text = ' '.join([rev for reviews in product_reviews.values() for rev in reviews['negative']])
            if all_negative_text:
                # Simple keyword extraction
                import re
                from collections import Counter
                words = re.findall(r'\w+', all_negative_text)
                # Filter stopwords and common words
                stopwords = {'yang', 'dan', 'di', 'tidak', 'ini', 'ke', 'untuk', 'dari', 'dengan', 'saya', 'nya'}
                keywords = [w for w in words if w not in stopwords and len(w) > 3]
                common_issues = Counter(keywords).most_common(3)
                
                if common_issues:
                    issue_keywords = ', '.join([f'"{word}"' for word, count in common_issues])
                    insights.append({
                        'type': 'info',
                        'icon': '💡',
                        'title': 'Keluhan Umum',
                        'message': f'Kata yang sering muncul di review negatif: {issue_keywords}'
                    })
            
        response = {
            'status': 'success',
            'results': results,
            'stats': stats,
            'total': len(results),
            'filename': file.filename
        }
        
        # Add product-specific data if available (NEW)
        if product_col:
            response['has_products'] = True
            response['product_stats'] = product_stats
            response['insights'] = insights
        else:
            response['has_products'] = False
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Batch analysis error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/feedback/<int:analysis_id>', methods=['POST'])
@jwt_required()
def submit_feedback(analysis_id):
    """
    Submit user feedback for an analysis
    """
    try:
        data = request.get_json()
        correction = data.get('correction')
        
        if not correction or correction not in ['Positif', 'Negatif', 'Netral']:
            return jsonify({'status': 'error', 'message': 'Invalid correction label'}), 400
            
        analysis = Analysis.query.get(analysis_id)
        if not analysis:
            return jsonify({'status': 'error', 'message': 'Analysis not found'}), 404
            
        # Ensure user owns this analysis
        current_user_id = get_jwt_identity()
        if analysis.user_id != current_user_id:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
            
        analysis.correction = correction
        db.session.commit()
        
        logger.info(f"Feedback received for analysis {analysis_id}: {correction}")
        
        return jsonify({
            'status': 'success',
            'message': 'Feedback saved',
            'analysis': analysis.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/upload-train-data', methods=['POST'])
def upload_train_data():
    """
    Upload CSV for training and trigger fine-tuning
    """
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No selected file'}), 400
            
        if not file.filename.endswith('.csv'):
            return jsonify({'status': 'error', 'message': 'File must be CSV'}), 400
            
        # Save file
        upload_dir = 'uploads'
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        filepath = os.path.join(upload_dir, 'training_data.csv')
        file.save(filepath)
        
        # Trigger training in background thread to avoid blocking
        # Note: In production, use Celery/Redis
        def run_training():
            global TRAINING_STATUS
            TRAINING_STATUS['is_training'] = True
            TRAINING_STATUS['message'] = 'Training in progress...'
            TRAINING_STATUS['timestamp'] = datetime.now().isoformat()
            
            try:
                logger.info("Starting background training...")
                train(data_path=filepath)
                logger.info("Background training completed.")
                
                # Reload the model to use the new weights
                reload_model()
                
                TRAINING_STATUS['message'] = 'Training completed successfully!'
            except Exception as e:
                logger.error(f"Training failed: {e}")
                TRAINING_STATUS['message'] = f'Training failed: {str(e)}'
            finally:
                TRAINING_STATUS['is_training'] = False

        thread = threading.Thread(target=run_training)
        thread.start()
        
        return jsonify({
            'status': 'success', 
            'message': 'File uploaded. Training started in background.'
        }), 200
        
    except Exception as e:
        logger.error(f"Upload training data error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/training-status', methods=['GET'])
def get_training_status():
    """
    Get current training status
    """
    return jsonify(TRAINING_STATUS), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify server is running
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': is_model_loaded()
    }), 200


# Error handlers
@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {request.url}")
    return jsonify({
        'status': 'error',
        'message': 'Endpoint tidak ditemukan'
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    logger.warning(f"405 error: {request.method} on {request.url}")
    return jsonify({
        'status': 'error',
        'message': 'Method tidak diizinkan'
    }), 405


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {error}")
    return jsonify({
        'status': 'error',
        'message': 'Terjadi kesalahan internal server'
    }), 500


if __name__ == '__main__':
    logger.info("\n" + "="*50)
    logger.info("Starting Sentiment Classification Application")
    logger.info("="*50)
    logger.info("Server running at: http://127.0.0.1:5000")
    logger.info(f"Character limits: {MIN_TEXT_LENGTH}-{MAX_TEXT_LENGTH}")
    logger.info("="*50 + "\n")
    
    app.run(debug=True, host='127.0.0.1', port=5000)
