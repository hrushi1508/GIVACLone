import re
import time
import datetime
import logging
import uuid
import collections

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from .utils import get_db_file, SECRET_KEY, db, limiter
import jwt

auth_bp = Blueprint('auth', __name__)

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

# In-memory account lockout tracker (5 failures → 15-minute lock)
_failed_attempts: dict = collections.defaultdict(list)
_MAX_FAILURES = 5
_LOCKOUT_SECONDS = 900


def _is_locked(email: str) -> bool:
    now = time.time()
    _failed_attempts[email] = [t for t in _failed_attempts[email] if now - t < _LOCKOUT_SECONDS]
    return len(_failed_attempts[email]) >= _MAX_FAILURES


def _record_failure(email: str) -> None:
    _failed_attempts[email].append(time.time())


def _clear_attempts(email: str) -> None:
    _failed_attempts.pop(email, None)


def _safe_json():
    data = request.get_json(silent=True)
    if data is None:
        return None, jsonify({"error": "Request must be valid JSON"}), 400
    return data, None, None


@auth_bp.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        credentials = request.get_json(silent=True)
        if not credentials:
            return jsonify({"error": "Request must be valid JSON"}), 400

        email = (credentials.get('email') or '').strip().lower()
        password = credentials.get('password') or ''

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        if not EMAIL_RE.match(email):
            return jsonify({"error": "Invalid email format"}), 400

        if _is_locked(email):
            return jsonify({"error": "Account temporarily locked due to too many failed attempts. Try again in 15 minutes."}), 429

        users = db.read('users.json')
        user = next((u for u in users if u.get('email', '').lower() == email), None)

        if not user:
            _record_failure(email)
            return jsonify({"error": "Invalid credentials"}), 401

        stored_pw = user.get('password', '')
        # Only accept hashed passwords — reject plaintext (legacy data migration required)
        if not (stored_pw.startswith('scrypt:') or stored_pw.startswith('pbkdf2:')):
            logging.warning(f"User {email} has unhashed password — blocking login until migrated")
            return jsonify({"error": "Account requires password reset. Please contact support."}), 401

        if not check_password_hash(stored_pw, password):
            _record_failure(email)
            return jsonify({"error": "Invalid credentials"}), 401

        _clear_attempts(email)
        token = jwt.encode({
            'user_id': user['id'],
            'is_admin': user.get('is_admin', False),
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")

        user_profile = {k: v for k, v in user.items() if k != 'password'}
        return jsonify({"status": "success", "token": token, "user": user_profile}), 200

    except Exception as e:
        logging.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({"error": "Login failed"}), 500


@auth_bp.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    try:
        new_user = request.get_json(silent=True)
        if not new_user:
            return jsonify({"error": "Request must be valid JSON"}), 400

        email = (new_user.get('email') or '').strip().lower()
        password = new_user.get('password') or ''
        name = (new_user.get('name') or '').strip()

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        if not EMAIL_RE.match(email):
            return jsonify({"error": "Invalid email format"}), 400
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        if not name:
            return jsonify({"error": "Name is required"}), 400

        users = get_db_file('users.json')
        if any(u.get('email', '').lower() == email for u in users):
            return jsonify({"error": "An account with this email already exists"}), 400

        user_id = f"user_{uuid.uuid4().hex[:12]}"
        safe_user = {
            'id': user_id,
            'email': email,
            'name': name,
            'password': generate_password_hash(password),
            'joined_date': str(datetime.date.today()),
            'is_admin': False,
            'role': 'customer',
        }
        users.append(safe_user)
        db.write('users.json', users)

        carts = get_db_file('carts.json')
        carts.append({"user_id": user_id, "items": []})
        db.write('carts.json', carts)

        wishlists = get_db_file('wishlist.json')
        wishlists.append({"user_id": user_id, "products": []})
        db.write('wishlist.json', wishlists)

        logging.info(f"New user registered: {email} ({user_id})")
        return jsonify({"status": "success", "user_id": user_id}), 201

    except Exception as e:
        logging.error(f"Register error: {str(e)}", exc_info=True)
        return jsonify({"error": "Registration failed"}), 500
