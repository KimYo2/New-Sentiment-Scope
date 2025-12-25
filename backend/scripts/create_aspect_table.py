from app import app, db
from models import Aspect

with app.app_context():
    try:
        # This will create the Aspect table if it doesn't exist
        db.create_all()
        print("Database tables created successfully (including Aspect if it was missing).")
    except Exception as e:
        print(f"Error creating tables: {e}")
