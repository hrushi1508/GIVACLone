import os
import logging
import cloudinary

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException

from routes import admin_bp, products_bp, auth_bp, cart_bp, wishlist_bp, orders_bp, promo_bp, media_bp
from routes.utils import limiter

load_dotenv()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)

app = Flask(__name__)
limiter.init_app(app)

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

app.register_blueprint(admin_bp)
app.register_blueprint(products_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(promo_bp)
app.register_blueprint(media_bp)


@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    # HSTS only in production (HTTPS). Omit on localhost to avoid breaking dev.
    if not os.environ.get('FLASK_DEBUG', 'false').lower() == 'true':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    if request.path == '/api/products':
        response.cache_control.max_age = 3600
    return response


@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(405)
def handle_405(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(Exception)
def handle_exception(e):
    # Pass HTTP exceptions (including 429 rate-limit) through with their proper status code
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), e.code
    logging.error(f"Unhandled Server Error: {str(e)}", exc_info=True)
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    if not os.path.exists('data'):
        os.makedirs('data')
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(port=5000, debug=debug_mode)
