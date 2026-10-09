from api.db import init_db
from api.auth import get_users_collection
import bcrypt
from flask import Flask
from dotenv import load_dotenv
import os

# Load env vars
load_dotenv(os.path.join('backend', '.env'))

app = Flask(__name__)
# Mock config for init_db if needed, but init_db uses os.getenv directly usually
# checking db.py... yes it uses os.getenv('MONGO_URI')

def create_admin():
    print("Creating / Updating Admin User...")
    with app.app_context():
        db = init_db(app)
        if db is None:
            print("Error: Could not connect to database.")
            return

        users_col = db['users']
        
        email = os.environ.get('INITIAL_ADMIN_EMAIL') or input("Enter admin email [admin@dermaai.com]: ").strip() or "admin@dermaai.com"
        password = os.environ.get('INITIAL_ADMIN_PASSWORD')
        if not password:
            import getpass
            password = getpass.getpass("Enter secure admin password: ").strip()
        
        if not password or len(password) < 8:
            print("Error: Admin password must be at least 8 characters.")
            return

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        if users_col.find_one({'email': email}):
            print(f"User {email} already exists. Updating role to admin and resetting password.")
            users_col.update_one({'email': email}, {'$set': {'role': 'admin', 'password': hashed_pw.decode('utf-8')}})
        else:
            user = {
                'email': email,
                'password': hashed_pw.decode('utf-8'),
                'role': 'admin'
            }
            users_col.insert_one(user)
            print(f"Successfully created admin user: {email}")


if __name__ == "__main__":
    create_admin()
