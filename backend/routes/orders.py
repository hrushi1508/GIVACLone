from flask import Blueprint, jsonify
from .utils import get_db_file, token_required

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/api/my-orders/<user_id>', methods=['GET'])
@token_required
def get_user_orders(current_user, user_id):
    if current_user['id'] != user_id: return jsonify({"error": "Unauthorized"}), 403
    all_orders = get_db_file('orders.json')
    user_orders = [o for o in all_orders if o.get('user_id') == user_id]
    user_orders.sort(key=lambda x: x.get('date', ''), reverse=True)
    return jsonify(user_orders), 200