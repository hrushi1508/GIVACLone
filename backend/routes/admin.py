import logging
from flask import Blueprint, jsonify, request
from .utils import get_db_file, token_required, db, product_cache, get_cloudinary_url, audit_log

admin_bp = Blueprint('admin', __name__)

# --- ADMIN AUTH DECORATOR ---
def admin_required(f):
    """Decorator that checks both JWT token AND admin role."""
    from functools import wraps
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.get('is_admin'):
            return jsonify({"error": "Admin access required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated


# =============================================
#  DASHBOARD & ANALYTICS
# =============================================

@admin_bp.route('/api/admin/dashboard', methods=['GET'])
@admin_required
def admin_dashboard(current_user):
    users = get_db_file('users.json')
    orders = get_db_file('orders.json')
    products = get_db_file('products.json')
    promos = get_db_file('promos.json')

    # Revenue calculation
    total_revenue = 0
    status_counts = {"Placed": 0, "Processing": 0, "Shipped": 0, "Delivered": 0, "Cancelled": 0}
    for order in orders:
        # Handle both order formats (old has 'total' at root, new has 'billing.total')
        if isinstance(order.get('billing'), dict):
            total_revenue += order['billing'].get('total', 0)
        else:
            total_revenue += order.get('total', 0)
        status = order.get('status', 'Placed')
        if status in status_counts:
            status_counts[status] += 1

    # Low stock products (stock < 5)
    low_stock = [{"id": p["id"], "name": p["name"], "stock": p.get("stock", 0)} 
                 for p in products if p.get("stock", 0) < 5]

    # Recent orders (last 10)
    sorted_orders = sorted(orders, key=lambda x: x.get('date', ''), reverse=True)[:10]

    # Top selling products (by order frequency)
    product_sales = {}
    for order in orders:
        for item in order.get('items', []):
            pid = item.get('product_id') or item.get('id')
            if pid:
                product_sales[pid] = product_sales.get(pid, 0) + item.get('quantity', 1)
    top_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    top_product_details = []
    for pid, qty in top_products:
        prod = next((p for p in products if p['id'] == pid), None)
        if prod:
            top_product_details.append({"id": pid, "name": prod["name"], "total_sold": qty})

    return jsonify({
        "stats": {
            "total_users": len(users),
            "total_orders": len(orders),
            "total_products": len(products),
            "total_revenue": total_revenue,
            "active_promos": len([p for p in promos if p.get('active')]),
        },
        "status_counts": status_counts,
        "low_stock": low_stock,
        "recent_orders": sorted_orders,
        "top_products": top_product_details,
    })


# =============================================
#  PRODUCT MANAGEMENT
# =============================================

@admin_bp.route('/api/admin/products', methods=['GET'])
@admin_required
def get_all_products(current_user):
    products = get_db_file('products.json')
    # Resolve image URLs
    for p in products:
        p['image'] = get_cloudinary_url(p.get('image'))
    return jsonify(products)

@admin_bp.route('/api/admin/products', methods=['POST'])
@admin_required
def create_product(current_user):
    try:
        data = request.json
        if not data.get('name') or not data.get('price'):
            return jsonify({"error": "Name and price are required"}), 400
        
        products = get_db_file('products.json')
        new_id = max([p['id'] for p in products], default=0) + 1
        
        new_product = {
            "id": new_id,
            "name": data['name'],
            "price": data['price'],
            "category": data.get('category', 'Uncategorized'),
            "image": data.get('image', ''),
            "rating": data.get('rating', 0),
            "description": data.get('description', ''),
            "isTrending": data.get('isTrending', False),
            "isNew": data.get('isNew', True),
            "stock": data.get('stock', 0),
            "relations": data.get('relations', []),
        }
        products.append(new_product)
        db.write('products.json', products)
        product_cache.invalidate()

        logging.info(f"Admin {current_user['id']} created product {new_id}")
        audit_log(current_user['id'], 'create_product', {'product_id': new_id, 'name': data['name']})
        return jsonify({"status": "success", "product": new_product}), 201
    except Exception as e:
        logging.error(f"Create product error: {str(e)}")
        return jsonify({"error": "Failed to create product"}), 500

@admin_bp.route('/api/admin/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(current_user, product_id):
    try:
        data = request.json
        products = get_db_file('products.json')
        product = next((p for p in products if p['id'] == product_id), None)
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        # Update fields
        for key in ['name', 'price', 'category', 'image', 'rating', 'description', 
                     'isTrending', 'isNew', 'stock', 'relations']:
            if key in data:
                product[key] = data[key]
        
        db.write('products.json', products)
        product_cache.invalidate()
        
        logging.info(f"Admin {current_user['id']} updated product {product_id}")
        return jsonify({"status": "success", "product": product})
    except Exception as e:
        logging.error(f"Update product error: {str(e)}")
        return jsonify({"error": "Failed to update product"}), 500

@admin_bp.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(current_user, product_id):
    try:
        products = get_db_file('products.json')
        products = [p for p in products if p['id'] != product_id]
        db.write('products.json', products)
        product_cache.invalidate()

        logging.info(f"Admin {current_user['id']} deleted product {product_id}")
        audit_log(current_user['id'], 'delete_product', {'product_id': product_id})
        return jsonify({"status": "success", "message": "Product deleted"})
    except Exception as e:
        logging.error(f"Delete product error: {str(e)}")
        return jsonify({"error": "Failed to delete product"}), 500


# =============================================
#  ORDER MANAGEMENT
# =============================================

@admin_bp.route('/api/admin/orders', methods=['GET'])
@admin_required
def get_all_orders(current_user):
    orders = get_db_file('orders.json')
    users = get_db_file('users.json')
    
    # Enrich orders with user info
    user_map = {u['id']: u.get('name', u.get('email', 'Unknown')) for u in users}
    for order in orders:
        order['user_name'] = user_map.get(order.get('user_id'), 'Unknown User')
    
    # Sort by date descending
    orders.sort(key=lambda x: x.get('date', ''), reverse=True)
    return jsonify(orders)

@admin_bp.route('/api/admin/orders/<order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(current_user, order_id):
    try:
        data = request.json
        new_status = data.get('status')
        valid_statuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
        
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {valid_statuses}"}), 400
        
        orders = get_db_file('orders.json')
        order = next((o for o in orders if o.get('order_id') == order_id), None)
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        order['status'] = new_status
        db.write('orders.json', orders)
        
        logging.info(f"Admin {current_user['id']} updated order {order_id} to {new_status}")
        return jsonify({"status": "success", "order_id": order_id, "new_status": new_status})
    except Exception as e:
        logging.error(f"Update order status error: {str(e)}")
        return jsonify({"error": "Failed to update order status"}), 500


# =============================================
#  USER MANAGEMENT
# =============================================

@admin_bp.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    users = get_db_file('users.json')
    orders = get_db_file('orders.json')
    
    # Count orders per user
    order_counts = {}
    for order in orders:
        uid = order.get('user_id')
        order_counts[uid] = order_counts.get(uid, 0) + 1
    
    # Strip passwords, add order count
    safe_users = []
    for u in users:
        safe_user = {k: v for k, v in u.items() if k != 'password'}
        safe_user['order_count'] = order_counts.get(u['id'], 0)
        safe_users.append(safe_user)
    
    return jsonify(safe_users)

@admin_bp.route('/api/admin/users/<user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(current_user, user_id):
    try:
        data = request.json
        is_admin = data.get('is_admin', False)
        
        users = get_db_file('users.json')
        user = next((u for u in users if u['id'] == user_id), None)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Prevent removing own admin access
        if user_id == current_user['id'] and not is_admin:
            return jsonify({"error": "Cannot remove your own admin access"}), 400
        
        user['is_admin'] = is_admin
        user['role'] = 'admin' if is_admin else 'customer'
        db.write('users.json', users)

        logging.info(f"Admin {current_user['id']} set user {user_id} is_admin={is_admin}")
        audit_log(current_user['id'], 'update_user_role', {'target_user_id': user_id, 'is_admin': is_admin})
        return jsonify({"status": "success"})
    except Exception as e:
        logging.error(f"Update user role error: {str(e)}")
        return jsonify({"error": "Failed to update user role"}), 500

@admin_bp.route('/api/admin/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    try:
        if user_id == current_user['id']:
            return jsonify({"error": "Cannot delete your own account"}), 400
        
        users = get_db_file('users.json')
        users = [u for u in users if u['id'] != user_id]
        db.write('users.json', users)
        
        # Also clean up cart and wishlist
        carts = get_db_file('carts.json')
        carts = [c for c in carts if c.get('user_id') != user_id]
        db.write('carts.json', carts)
        
        wishlists = get_db_file('wishlist.json')
        wishlists = [w for w in wishlists if w.get('user_id') != user_id]
        db.write('wishlist.json', wishlists)
        
        logging.info(f"Admin {current_user['id']} deleted user {user_id}")
        audit_log(current_user['id'], 'delete_user', {'deleted_user_id': user_id})
        return jsonify({"status": "success", "message": "User deleted"})
    except Exception as e:
        logging.error(f"Delete user error: {str(e)}")
        return jsonify({"error": "Failed to delete user"}), 500


# =============================================
#  PROMO CODE MANAGEMENT
# =============================================

@admin_bp.route('/api/admin/promos', methods=['GET'])
@admin_required
def get_all_promos(current_user):
    promos = get_db_file('promos.json')
    return jsonify(promos)

@admin_bp.route('/api/admin/promos', methods=['POST'])
@admin_required
def create_promo(current_user):
    try:
        data = request.json
        if not data.get('code') or not data.get('value'):
            return jsonify({"error": "Code and value are required"}), 400
        
        promos = get_db_file('promos.json')
        
        # Check duplicate code
        if any(p['code'] == data['code'].upper() for p in promos):
            return jsonify({"error": "Promo code already exists"}), 400
        
        new_id = f"promo_{len(promos) + 1:03d}"
        new_promo = {
            "id": new_id,
            "code": data['code'].upper().strip(),
            "description": data.get('description', ''),
            "discount_type": data.get('discount_type', 'percentage'),
            "value": data['value'],
            "min_purchase": data.get('min_purchase', 0),
            "max_discount": data.get('max_discount'),
            "active": data.get('active', True),
        }
        # Remove None values
        new_promo = {k: v for k, v in new_promo.items() if v is not None}
        
        promos.append(new_promo)
        db.write('promos.json', promos)
        
        logging.info(f"Admin {current_user['id']} created promo {new_promo['code']}")
        return jsonify({"status": "success", "promo": new_promo}), 201
    except Exception as e:
        logging.error(f"Create promo error: {str(e)}")
        return jsonify({"error": "Failed to create promo"}), 500

@admin_bp.route('/api/admin/promos/<promo_id>', methods=['PUT'])
@admin_required
def update_promo(current_user, promo_id):
    try:
        data = request.json
        promos = get_db_file('promos.json')
        promo = next((p for p in promos if p['id'] == promo_id), None)
        
        if not promo:
            return jsonify({"error": "Promo not found"}), 404
        
        for key in ['code', 'description', 'discount_type', 'value', 'min_purchase', 'max_discount', 'active']:
            if key in data:
                promo[key] = data[key]
        
        db.write('promos.json', promos)
        logging.info(f"Admin {current_user['id']} updated promo {promo_id}")
        return jsonify({"status": "success", "promo": promo})
    except Exception as e:
        logging.error(f"Update promo error: {str(e)}")
        return jsonify({"error": "Failed to update promo"}), 500

@admin_bp.route('/api/admin/promos/<promo_id>', methods=['DELETE'])
@admin_required
def delete_promo(current_user, promo_id):
    try:
        promos = get_db_file('promos.json')
        promos = [p for p in promos if p['id'] != promo_id]
        db.write('promos.json', promos)
        
        logging.info(f"Admin {current_user['id']} deleted promo {promo_id}")
        return jsonify({"status": "success", "message": "Promo deleted"})
    except Exception as e:
        logging.error(f"Delete promo error: {str(e)}")
        return jsonify({"error": "Failed to delete promo"}), 500

@admin_bp.route('/api/admin/promos/<promo_id>/toggle', methods=['PATCH'])
@admin_required
def toggle_promo(current_user, promo_id):
    try:
        promos = get_db_file('promos.json')
        promo = next((p for p in promos if p['id'] == promo_id), None)
        
        if not promo:
            return jsonify({"error": "Promo not found"}), 404
        
        promo['active'] = not promo.get('active', False)
        db.write('promos.json', promos)
        
        logging.info(f"Admin {current_user['id']} toggled promo {promo_id} to {promo['active']}")
        return jsonify({"status": "success", "active": promo['active']})
    except Exception as e:
        logging.error(f"Toggle promo error: {str(e)}")
        return jsonify({"error": "Failed to toggle promo"}), 500


# =============================================
#  REVENUE ANALYTICS
# =============================================

@admin_bp.route('/api/admin/revenue', methods=['GET'])
@admin_required
def get_revenue(current_user):
    """Return bucketed revenue + order count for a given time range.
    Query param: range = 1W | 1M | 3M | 6M | 1Y | 2Y | 5Y  (default 1M)
    Returns: list of { label, revenue, orders } sorted oldest → newest
    """
    import datetime

    range_param = request.args.get('range', '1M').upper()
    now = datetime.datetime.now(datetime.timezone.utc)

    # Define window start and bucket strategy
    RANGES = {
        '1W': (datetime.timedelta(days=7),   'day'),
        '1M': (datetime.timedelta(days=30),  'day'),
        '3M': (datetime.timedelta(days=91),  'week'),
        '6M': (datetime.timedelta(days=182), 'week'),
        '1Y': (datetime.timedelta(days=365), 'month'),
        '2Y': (datetime.timedelta(days=730), 'month'),
        '5Y': (datetime.timedelta(days=1825),'quarter'),
    }
    if range_param not in RANGES:
        range_param = '1M'

    delta, bucket = RANGES[range_param]
    window_start = now - delta

    orders = get_db_file('orders.json')

    # Build buckets dict  key → {revenue, orders}
    buckets = {}

    def bucket_key(dt):
        if bucket == 'day':
            return dt.strftime('%d %b')
        if bucket == 'week':
            # ISO week number + year
            return f"W{dt.isocalendar()[1]:02d} '{dt.strftime('%y')}"
        if bucket == 'month':
            return dt.strftime('%b %y')
        # quarter
        q = (dt.month - 1) // 3 + 1
        return f"Q{q} '{dt.strftime('%y')}"

    # Pre-populate buckets in chronological order
    if bucket == 'day':
        for i in range(delta.days + 1):
            d = (window_start + datetime.timedelta(days=i)).strftime('%d %b')
            buckets.setdefault(d, {'revenue': 0, 'orders': 0})
    elif bucket == 'week':
        cur = window_start
        while cur <= now:
            buckets.setdefault(bucket_key(cur), {'revenue': 0, 'orders': 0})
            cur += datetime.timedelta(weeks=1)
    elif bucket == 'month':
        cur = window_start.replace(day=1)
        while cur <= now:
            buckets.setdefault(bucket_key(cur), {'revenue': 0, 'orders': 0})
            nxt_month = cur.month % 12 + 1
            nxt_year  = cur.year + (1 if cur.month == 12 else 0)
            cur = cur.replace(year=nxt_year, month=nxt_month, day=1)
    else:  # quarter
        for yr in range(window_start.year, now.year + 1):
            for q in range(1, 5):
                key = f"Q{q} '{str(yr)[-2:]}"
                buckets.setdefault(key, {'revenue': 0, 'orders': 0})

    # Tally orders
    for order in orders:
        raw_date = order.get('date') or order.get('created_at') or ''
        if not raw_date:
            continue
        try:
            # Handle both ISO datetime strings and date strings
            if 'T' in raw_date:
                dt = datetime.datetime.fromisoformat(raw_date.replace('Z', '+00:00'))
            else:
                dt = datetime.datetime.strptime(raw_date[:10], '%Y-%m-%d').replace(
                    tzinfo=datetime.timezone.utc)
        except (ValueError, AttributeError):
            continue

        if dt < window_start:
            continue

        key = bucket_key(dt)
        if key in buckets:
            rev = 0
            if isinstance(order.get('billing'), dict):
                rev = order['billing'].get('total', 0)
            else:
                rev = order.get('total', 0)
            buckets[key]['revenue'] += rev
            buckets[key]['orders']  += 1

    result = [{'label': k, **v} for k, v in buckets.items()]
    return jsonify(result)


# =============================================
#  LAYOUT / SITE SETTINGS
# =============================================

@admin_bp.route('/api/admin/layout', methods=['GET'])
@admin_required
def get_layout(current_user):
    layout = get_db_file('layout.json')
    return jsonify(layout)

@admin_bp.route('/api/admin/layout', methods=['PUT'])
@admin_required
def update_layout(current_user):
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Request must be valid JSON"}), 400
        db.write('layout.json', data)
        logging.info(f"Admin {current_user['id']} updated site layout")
        audit_log(current_user['id'], 'update_layout', {})
        return jsonify({"status": "success", "layout": data})
    except Exception as e:
        logging.error(f"Update layout error: {str(e)}")
        return jsonify({"error": "Failed to update layout"}), 500


# =============================================
#  AUDIT LOG
# =============================================

@admin_bp.route('/api/admin/audit-log', methods=['GET'])
@admin_required
def get_audit_log(current_user):
    logs = get_db_file('audit_log.json')
    logs = list(reversed(logs))
    return jsonify(logs[:200])
