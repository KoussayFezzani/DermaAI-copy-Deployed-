from dotenv import load_dotenv
load_dotenv() # Load environment variables first

from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from flask_jwt_extended import JWTManager
from api.limiter import limiter
from api.routes import api_bp
from api.auth import auth_bp
from api.db import init_db

def create_app():
    app = Flask(__name__)
    jwt_secret = os.environ.get('JWT_SECRET_KEY')
    if not jwt_secret:
        raise RuntimeError("CRITICAL SECURITY ERROR: JWT_SECRET_KEY environment variable is not set. Please define it in .env before running.")
    app.config['JWT_SECRET_KEY'] = jwt_secret
    
    # Configure CORS: Restrict to allowed origins (frontend origin or env override)
    allowed_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
    CORS(app, origins=[o.strip() for o in allowed_origins if o.strip()], supports_credentials=True)
    JWTManager(app)

    # Security: File upload size limit (10MB)
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

    # Security: Rate Limiting to prevent resource exhaustion from heavy models
    limiter.init_app(app)

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from api.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    from api.news import news_bp
    app.register_blueprint(news_bp, url_prefix='/api/news')
    
    from api.user import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/user')
    
    from api.stats import stats_bp
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    
    from api.diseases import diseases_bp
    app.register_blueprint(diseases_bp, url_prefix='/api/diseases')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        db_status = "connected" if db is not None else "disconnected"
        return {"status": "ok", "database": db_status}, 200

    @app.route('/api/readiness', methods=['GET'])
    def readiness_check():
        db_status = "connected" if db is not None else "disconnected"
        
        # Verify model artifact is ready
        model_ready = False
        try:
            from ml_integration.prediction_service import PredictionService
            m = PredictionService.load_model()
            model_ready = m is not None
        except Exception:
            model_ready = False

        is_ready = (db_status == "connected") and model_ready
        status_code = 200 if is_ready else 503
        return {
            "status": "ready" if is_ready else "not_ready",
            "database": db_status,
            "classifier_model": "loaded" if model_ready else "failed"
        }, status_code


    # Protected image serving endpoint is moved to api_bp /api/images/<filename> with ownership checks
    # Legacy /uploads route kept strictly for backward compatibility with authenticated user checks
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        # Redirect or forward to safe serving logic
        from api.routes import serve_secure_upload
        return serve_secure_upload(filename)

    # Global Error Handlers (Sanitize internal exceptions so stack traces/raw errors are never leaked)
    from werkzeug.exceptions import HTTPException
    from pydantic import ValidationError

    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            return {"error": e.name, "message": e.description}, e.code
        if isinstance(e, ValidationError):
            return {"error": "ValidationFailed", "details": e.errors()}, 400
            
        import logging
        logging.getLogger('dermaai').error(f"Internal Error: {e}", exc_info=True)
        # Production-safe generic error response
        return {"error": "InternalServerError", "message": "An unexpected error occurred. Please try again later."}, 500

    # Initialize DB
    db = init_db(app)

    return app

if __name__ == '__main__':
    is_debug = os.environ.get('FLASK_DEBUG', 'false').lower() in ('true', '1')
    port = int(os.environ.get('PORT', 5000))
    app = create_app()
    app.run(debug=is_debug, host='0.0.0.0', port=port)

