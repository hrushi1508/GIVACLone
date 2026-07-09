import os
import jwt
import datetime
import logging
from functools import wraps
from flask import jsonify, request
import threading

from services.data_manager import DataManager
from services.cache import SimpleCache

try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    limiter = Limiter(get_remote_address, storage_uri="memory://")
except ImportError:
    logging.warning("Flask-Limiter not installed — rate limiting disabled. Run: pip install Flask-Limiter")

    class _NoopLimiter:
        def limit(self, *args, **kwargs):
            return lambda f: f
        def init_app(self, app):
            pass

    limiter = _NoopLimiter()

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    logging.warning("SECRET_KEY not set — using insecure fallback. Set SECRET_KEY in production.")
    SECRET_KEY = "GIVA_SECRET_SPARKLE_KEY"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

db = DataManager()
product_cache = SimpleCache(expiry_seconds=60)

CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', 'demo')
CLOUDINARY_BASE_URL = f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload"

ALLOWED_TRANSFORMATIONS = {
    'thumbnail': 'q_auto,f_auto,w_200,h_200,c_fill',
    'card': 'q_auto,f_auto,w_400,h_400,c_fill',
    'detail': 'q_auto,f_auto,w_800,h_800,c_fill',
    'banner': 'q_auto,f_auto,w_1200,h_600,c_fill',
}
DEFAULT_TRANSFORMATION = ALLOWED_TRANSFORMATIONS['detail']

order_id_lock = threading.Lock()
order_id_counter = 1001


def get_next_order_id():
    global order_id_counter
    with order_id_lock:
        order_id_counter += 1
        return f"GIVA-{order_id_counter}"


def get_cloudinary_url(image_id, transformation=DEFAULT_TRANSFORMATION):
    if not image_id:
        return ''
    if image_id.startswith('http://') or image_id.startswith('https://'):
        return image_id
    safe_transform = transformation if transformation in ALLOWED_TRANSFORMATIONS.values() else DEFAULT_TRANSFORMATION
    return f"{CLOUDINARY_BASE_URL}/{safe_transform}/{image_id}"


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token is missing'}), 401
        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid authorization format'}), 401
        token = parts[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            users = db.read('users.json')
            current_user = next((u for u in users if u['id'] == data.get('user_id')), None)
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


def get_db_file(filename):
    try:
        return db.read(filename) or []
    except Exception as e:
        logging.error(f"Failed to read {filename}: {str(e)}")
        return []


def audit_log(admin_id, action, details=None):
    entry = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "admin_id": admin_id,
        "action": action,
        "details": details or {}
    }
    try:
        logs = db.read('audit_log.json') or []
        logs.append(entry)
        if len(logs) > 1000:
            logs = logs[-1000:]
        db.write('audit_log.json', logs)
    except Exception as e:
        logging.error(f"Audit log write failed: {str(e)}")
