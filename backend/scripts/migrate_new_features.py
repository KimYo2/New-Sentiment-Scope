"""
Migration script to add user preferences table
"""
import sqlite3
import os

def migrate():
    db_path = 'instance/sentiment.db'
    
    if not os.path.exists('instance'):
        os.makedirs('instance')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create user_preferences table
    try:
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            user_type VARCHAR(20) DEFAULT 'general',
            email_alerts BOOLEAN DEFAULT 0,
            notification_email VARCHAR(255),
            dashboard_widgets TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES user(id)
        )
        ''')
        
        print("✓ user_preferences table created")
        
        # Create products table (for UMKM features)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES user(id)
        )
        ''')
        
        print("✓ products table created")
        
        # Create saved_youtube_analysis table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_youtube_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            label VARCHAR(255),
            video_url TEXT,
            analysis_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES user(id)
        )
        ''')
        
        print("✓ saved_youtube_analysis table created")
        
        # Create tags table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES user(id)
        )
        ''')
        
        print("✓ tags table created")
        
        # Create analysis_tags relationship table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_tags (
            analysis_id INTEGER,
            tag_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (analysis_id, tag_id),
            FOREIGN KEY (analysis_id) REFERENCES analysis(id),
            FOREIGN KEY (tag_id) REFERENCES tags(id)
        )
        ''')
        
        print("✓ analysis_tags table created")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
    except sqlite3.Error as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    print("Running database migration...")
    migrate()
