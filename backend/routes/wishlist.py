from flask import Blueprint, jsonify, request
from .utils import get_db_file, token_required, db

wishlist_bp = Blueprint('wishlist', __name__)


@wishlist_bp.route('/api/wishlist/<user_id>', methods=['GET'])
@token_required
def get_wishlist(current_user, user_id):
    if current_user['id'] != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    wishlists = get_db_file('wishlist.json')
    products_master = get_db_file('products.json')
    user_entry = next((w for w in wishlists if w['user_id'] == user_id), None)
    if not user_entry:
        return jsonify([])
    wishlist_details = [p for p in products_master if p['id'] in user_entry['products']]
    return jsonify(wishlist_details)


@wishlist_bp.route('/api/wishlist/toggle', methods=['POST'])
@token_required
def toggle_wishlist(current_user):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request must be valid JSON"}), 400

    uid = data.get('user_id')
    if current_user['id'] != uid:
        return jsonify({"error": "Unauthorized"}), 403

    pid = data.get('product_id')
    if not pid:
        return jsonify({"error": "product_id is required"}), 400

    wishlists = get_db_file('wishlist.json')
    user_entry = next((w for w in wishlists if w['user_id'] == uid), None)

    if user_entry:
        if pid in user_entry['products']:
            user_entry['products'].remove(pid)
        else:
            user_entry['products'].append(pid)
    else:
        wishlists.append({"user_id": uid, "products": [pid]})

    db.write('wishlist.json', wishlists)
    return jsonify({"status": "success"})
