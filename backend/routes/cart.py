import logging
from flask import Blueprint, jsonify, request
from .utils import get_db_file, token_required, db

cart_bp = Blueprint('cart', __name__)


@cart_bp.route('/api/cart/<user_id>', methods=['GET'])
@token_required
def get_user_cart(current_user, user_id):
    if current_user['id'] != user_id:
        return jsonify({"error": "Unauthorized access to this cart"}), 403
    all_carts = get_db_file('carts.json')
    user_cart = next((c for c in all_carts if c['user_id'] == user_id), None)
    return jsonify(user_cart['items'] if user_cart else []), 200


@cart_bp.route('/api/cart/add', methods=['POST'])
@token_required
def add_to_cart(current_user):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request must be valid JSON"}), 400

    uid = data.get('user_id')
    if current_user['id'] != uid:
        return jsonify({"error": "Unauthorized access to this cart"}), 403

    product = data.get('product')
    if not product or not product.get('id'):
        return jsonify({"error": "Product data is required"}), 400

    carts = get_db_file('carts.json')
    user_cart = next((c for c in carts if c['user_id'] == uid), None)
    if not user_cart:
        user_cart = {"user_id": uid, "items": []}
        carts.append(user_cart)

    product_entry = next((item for item in user_cart['items'] if item['id'] == product['id']), None)
    if product_entry:
        product_entry['quantity'] += 1
    else:
        product['quantity'] = 1
        user_cart['items'].append(product)

    db.write('carts.json', carts)
    return jsonify({"status": "success", "message": "Item added"}), 200


@cart_bp.route('/api/cart/update', methods=['POST'])
@token_required
def update_cart_quantity(current_user):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request must be valid JSON"}), 400

    uid = data.get('user_id')
    if current_user['id'] != uid:
        return jsonify({"error": "Unauthorized"}), 403

    pid = data.get('product_id')
    action = data.get('action')
    if not pid or action not in ('increment', 'decrement'):
        return jsonify({"error": "product_id and valid action required"}), 400

    carts = get_db_file('carts.json')
    user_cart = next((c for c in carts if c['user_id'] == uid), None)
    if not user_cart:
        return jsonify({"error": "Cart not found"}), 404

    product_entry = next((item for item in user_cart['items'] if item['id'] == pid), None)
    if not product_entry:
        return jsonify({"error": "Product not in cart"}), 404

    if action == 'increment':
        product_entry['quantity'] += 1
    elif action == 'decrement' and product_entry['quantity'] > 1:
        product_entry['quantity'] -= 1

    db.write('carts.json', carts)
    return jsonify({"status": "success", "new_quantity": product_entry['quantity']}), 200


@cart_bp.route('/api/cart/remove', methods=['POST'])
@token_required
def remove_from_cart(current_user):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request must be valid JSON"}), 400

    uid = data.get('user_id')
    if current_user['id'] != uid:
        return jsonify({"error": "Unauthorized"}), 403

    pid = data.get('product_id')
    if not pid:
        return jsonify({"error": "product_id is required"}), 400

    carts = get_db_file('carts.json')
    user_cart = next((c for c in carts if c['user_id'] == uid), None)
    if not user_cart:
        return jsonify({"error": "Cart not found"}), 404

    user_cart['items'] = [item for item in user_cart['items'] if item['id'] != pid]
    db.write('carts.json', carts)
    return jsonify({"status": "success", "message": "Item removed"}), 200
