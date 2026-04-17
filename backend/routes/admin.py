from flask import Blueprint, jsonify
from utils import get_db_file, token_required
app = Blueprint('admin', __name__)

@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
def admin_dashboard(current_user):
    # Security: Check if the user from the token is actually an admin
    if not current_user.get('is_admin'):
        return jsonify({"error": "Admin access required"}), 403

    return jsonify({
        "stats": {
            "total_users": len(get_db_file('users.json')),
            "total_orders": len(get_db_file('orders.json')),
            "total_products": len(get_db_file('products.json'))
        },
        "all_orders": get_db_file('orders.json'),
        "all_users": [ {k:v for k,v in u.items() if k != 'password'} for u in get_db_file('users.json')]
    })
