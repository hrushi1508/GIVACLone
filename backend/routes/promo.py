import logging
from flask import Blueprint, jsonify, request
from .utils import get_db_file, token_required, db, get_next_order_id, product_cache
from services.validators import validate_order

promo_bp = Blueprint('promo', __name__)


@promo_bp.route('/api/validate-promo', methods=['POST'])
def validate_promo():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request must be valid JSON"}), 400

        user_code = (data.get('code') or '').upper().strip()
        cart_total = data.get('total', 0)

        if not user_code:
            return jsonify({"error": "Promo code is required"}), 400
        if not isinstance(cart_total, (int, float)) or cart_total <= 0:
            return jsonify({"error": "Invalid cart total"}), 400

        promos = get_db_file('promos.json')
        promo = next((p for p in promos if p['code'] == user_code and p.get('active', True)), None)

        if not promo:
            return jsonify({"error": "Invalid or expired promo code"}), 404

        min_purchase = promo.get('min_purchase', 0)
        if cart_total < min_purchase:
            return jsonify({"error": f"Minimum purchase of ₹{min_purchase} required"}), 400

        discount_type = promo.get('discount_type', 'percentage')
        if discount_type == 'percentage':
            discount = cart_total * promo['value'] / 100
        else:
            discount = float(promo['value'])

        if 'max_discount' in promo and promo['max_discount']:
            discount = min(discount, promo['max_discount'])

        discount = round(discount, 2)
        return jsonify({
            "code": user_code,
            "discount": discount,
            "new_total": round(cart_total - discount, 2)
        })

    except Exception as e:
        logging.error(f"Promo validation error: {str(e)}", exc_info=True)
        return jsonify({"error": "Promo validation failed"}), 500


@promo_bp.route('/api/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    try:
        order_data = request.get_json(silent=True)
        if not order_data:
            return jsonify({"error": "Request must be valid JSON"}), 400

        order_data['user_id'] = current_user['id']

        is_valid, error_msg = validate_order(order_data)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        orders = get_db_file('orders.json')
        order_data['order_id'] = get_next_order_id()
        order_data['status'] = "Placed"
        orders.append(order_data)
        db.write('orders.json', orders)

        # Clear user's cart after successful order
        carts = get_db_file('carts.json')
        for c in carts:
            if c.get('user_id') == current_user['id']:
                c['items'] = []
                break
        db.write('carts.json', carts)

        # Decrement product stock for each ordered item
        products_data = get_db_file('products.json')
        stock_changed = False
        for item in order_data.get('items', []):
            pid = str(item.get('product_id') or item.get('id') or '')
            qty = int(item.get('quantity', 1))
            for p in products_data:
                if str(p.get('id')) == pid:
                    p['stock'] = max(0, int(p.get('stock', 0)) - qty)
                    stock_changed = True
                    break
        if stock_changed:
            db.write('products.json', products_data)
            product_cache.invalidate()

        logging.info(f"User {current_user['id']} placed order {order_data['order_id']}")
        return jsonify({"status": "success", "order_id": order_data['order_id']}), 201

    except Exception as e:
        logging.error(f"Checkout error: {str(e)}", exc_info=True)
        return jsonify({"error": "Checkout failed"}), 500
