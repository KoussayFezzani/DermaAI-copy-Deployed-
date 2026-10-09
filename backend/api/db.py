from flask import Flask
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

def init_db(app: Flask = None):
    """
    Initializes MongoDB connection.
    """
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        print("Error: MONGO_URI not found in environment.")
        return None
    
    try:
        # Determine if we need certifi (mostly for Atlas)
        if 'localhost' in mongo_uri or '127.0.0.1' in mongo_uri:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
        else:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000, tlsCAFile=certifi.where())
            
        client.admin.command('ping')
        print("Successfully connected to local MongoDB!")
        
        db = client.get_database('skin_lesion_db')
        
        # Create strategic indexes to speed up history lookups and user lookups
        try:
            db['users'].create_index('email', unique=True)
            db['history'].create_index([
                ('user_email', 1), 
                ('timestamp', -1)
            ])
        except Exception as idx_err:
            print(f"Warning: Could not create indexes: {idx_err}")
            
        return db
    except Exception as e:
        print(f"MongoDB Connection Failed: {e}")
        return None

def get_history_collection():
    db = init_db()
    # Standardizing on 'history' as per user feedback
    return db['history'] if db is not None else None

def get_user_collection():
    db = init_db()
    return db['users'] if db is not None else None

def get_db():
    return init_db()
