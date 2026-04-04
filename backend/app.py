import os
import json
import logging
import jwt # pip install pyjwt
import datetime
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS

from services.data_manager import DataManager
from services.validators import validate_order
from services.cache import SimpleCache

# --- CONFIGURATION ---
SECRET_KEY = "GIVA_SECRET_SPARKLE_KEY" 
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

db = DataManager()
product_cache = SimpleCache(expiry_seconds=60)

# --- SECURITY: JWT Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization') 
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            # Format: "Bearer <token>"
            token = token.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            users = db.read('users.json')
            current_user = next((u for u in users if u['id'] == data['user_id']), None)
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
        except:
            return jsonify({'error': 'Token is invalid!'}), 401
        
        # We pass current_user to the route, but keep existing URL params in kwargs
        return f(current_user, *args, **kwargs)
    return decorated

def get_db_file(filename):
    try:
        return db.read(filename) or []
    except Exception as e:
        logging.error(f"Failed to read {filename}: {str(e)}")
        return []

# --- 1. LAYOUT & PRODUCT ROUTES ---

@app.route('/api/layout', methods=['GET'])
def get_layout():
    layouts = get_db_file('layout.json')
    if isinstance(layouts, list):
        active_layout = next((l for l in layouts if l.get('active')), layouts[0])
    else:
        active_layout = layouts
    return jsonify(active_layout)

@app.route('/api/products', methods=['GET'])
def get_products():
    products = product_cache.get()
    if not products:
        products = get_db_file('products.json')
        product_cache.set(products)

    category = request.args.get('category')
    q = request.args.get('q', '').lower()
    filtered = products
    if category:
        filtered = [p for p in filtered if p.get('category', '').lower() == category.lower()]
    if q:
        filtered = [p for p in filtered if q in p.get('name', '').lower() or q in p.get('description', '').lower()]
    return jsonify(filtered)

# --- 2. PROMO & CHECKOUT ---

@app.route('/api/validate-promo', methods=['POST'])
def validate_promo():
    data = request.json
    user_code = data.get('code', '').upper()
    cart_total = data.get('total', 0)
    promos = get_db_file('promos.json')
    promo = next((p for p in promos if p['code'] == user_code and p.get('active', True)), None)
    
    if not promo:
        return jsonify({"error": "Invalid or expired promo code"}), 404
    if cart_total < promo.get('min_purchase', 0):
        return jsonify({"error": f"Minimum purchase of ₹{promo['min_purchase']} required"}), 400

    discount = (cart_total * promo['value'] / 100) if promo['discount_type'] == 'percentage' else promo['value']
    if 'max_discount' in promo:
        discount = min(discount, promo['max_discount'])

    return jsonify({"code": user_code, "discount": discount, "new_total": cart_total - discount})

@app.route('/api/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    order_data = request.json
    # Security: Ensure the order is tied to the TOKEN owner, not just the body data
    order_data['user_id'] = current_user['id']
    
    is_valid, error_msg = validate_order(order_data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    orders = get_db_file('orders.json')
    order_data['order_id'] = f"GIVA-{len(orders) + 1001}"
    order_data['status'] = "Placed"
    orders.append(order_data)
    db.write('orders.json', orders)
    return jsonify({"status": "success", "order_id": order_data['order_id']}), 201

# --- 3. CART ROUTES (SECURED & ISOLATED) ---

@app.route('/api/cart/<user_id>', methods=['GET'])
@token_required
def get_user_cart(current_user, user_id):
    # Security check: Does the URL ID match the Token ID?
    if current_user['id'] != user_id:
        return jsonify({"error": "Unauthorized access to this cart"}), 403

    all_carts = get_db_file('carts.json')
    user_cart = next((c for c in all_carts if c['user_id'] == user_id), None)
    return jsonify(user_cart['items'] if user_cart else []), 200

@app.route('/api/cart/update', methods=['POST'])
@token_required
def update_cart_quantity(current_user):
    data = request.json
    uid = data.get('user_id')
    
    # Security check
    if current_user['id'] != uid:
        return jsonify({"error": "Unauthorized"}), 403

    pid = data.get('product_id')
    action = data.get('action') 
    carts = get_db_file('carts.json')
    user_cart = next((c for c in carts if c['user_id'] == uid), None)

    if not user_cart: return jsonify({"error": "Cart not found"}), 404

    product_entry = next((item for item in user_cart['items'] if item['id'] == pid), None)
    if product_entry:
        if action == 'increment': product_entry['quantity'] += 1
        elif action == 'decrement' and product_entry['quantity'] > 1: product_entry['quantity'] -= 1
        db.write('carts.json', carts)
        return jsonify({"status": "success", "new_quantity": product_entry['quantity']}), 200
    return jsonify({"error": "Product not in cart"}), 404

@app.route('/api/cart/remove', methods=['POST'])
@token_required
def remove_from_cart(current_user):
    data = request.json
    uid = data.get('user_id')
    
    if current_user['id'] != uid: return jsonify({"error": "Unauthorized"}), 403

    pid = data.get('product_id')
    carts = get_db_file('carts.json')
    user_cart = next((c for c in carts if c['user_id'] == uid), None)

    if user_cart:
        user_cart['items'] = [item for item in user_cart['items'] if item['id'] != pid]
        db.write('carts.json', carts)
        return jsonify({"status": "success", "message": "Item removed"}), 200
    return jsonify({"error": "Cart not found"}), 404

# --- 4. AUTHENTICATION ---

@app.route('/api/login', methods=['POST'])
def login():
    try:
        credentials = request.json
        email = credentials.get('email')
        password = credentials.get('password')
        users = db.read('users.json') 
        user = next((u for u in users if u['email'] == email and u['password'] == password), None)

        if user:
            # Generate JWT Token
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm="HS256")
            
            user_profile = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({"status": "success", "token": token, "user": user_profile}), 200
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    new_user = request.json
    users = get_db_file('users.json')
    if any(u['email'] == new_user.get('email') for u in users):
        return jsonify({"error": "User exists"}), 400

    user_id = f"user_{len(users) + 101}"
    new_user['id'] = user_id
    new_user['joined_date'] = str(datetime.date.today())
    users.append(new_user)
    db.write('users.json', users)

    # Initialize private spaces
    carts = get_db_file('carts.json')
    carts.append({"user_id": user_id, "items": []})
    db.write('carts.json', carts)

    wishlists = get_db_file('wishlist.json')
    wishlists.append({"user_id": user_id, "products": []})
    db.write('wishlist.json', wishlists)
    return jsonify({"status": "success", "user_id": user_id}), 201

# --- 5. WISHLIST, COLLECTIONS, ORDERS ---

@app.route('/api/wishlist/<user_id>', methods=['GET'])
@token_required
def get_wishlist(current_user, user_id):
    if current_user['id'] != user_id: return jsonify({"error": "Unauthorized"}), 403
    
    wishlists = get_db_file('wishlist.json')
    products_master = get_db_file('products.json')
    user_entry = next((w for w in wishlists if w['user_id'] == user_id), None)
    if not user_entry: return jsonify([])
    wishlist_details = [p for p in products_master if p['id'] in user_entry['products']]
    return jsonify(wishlist_details)

@app.route('/api/wishlist/toggle', methods=['POST'])
@token_required
def toggle_wishlist(current_user):
    data = request.json
    uid = data.get('user_id')
    if current_user['id'] != uid: return jsonify({"error": "Unauthorized"}), 403

    pid = data.get('product_id')
    wishlists = get_db_file('wishlist.json')
    user_entry = next((w for w in wishlists if w['user_id'] == uid), None)

    if user_entry:
        if pid in user_entry['products']: user_entry['products'].remove(pid)
        else: user_entry['products'].append(pid)
    else: wishlists.append({"user_id": uid, "products": [pid]})

    db.write('wishlist.json', wishlists)
    return jsonify({"status": "success"})

@app.route('/api/collections', methods=['GET'])
def get_collections():
    return jsonify(get_db_file('collections.json')), 200

@app.route('/api/my-orders/<user_id>', methods=['GET'])
@token_required
def get_user_orders(current_user, user_id):
    if current_user['id'] != user_id: return jsonify({"error": "Unauthorized"}), 403
    all_orders = get_db_file('orders.json')
    user_orders = [o for o in all_orders if o.get('user_id') == user_id]
    user_orders.sort(key=lambda x: x.get('date', ''), reverse=True)
    return jsonify(user_orders), 200
# --- MIDDLEWARE & ERRORS ---

@app.after_request
def add_header(response):
    if request.path == '/api/products':
        response.cache_control.max_age = 3600
    return response

@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f"Unhandled Server Error: {str(e)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Ensure data directory exists
    if not os.path.exists('data'):
        os.makedirs('data')
    app.run(port=5000, debug=True)