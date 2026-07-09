from flask import Blueprint, jsonify, request
from .utils import get_db_file, get_cloudinary_url, product_cache

products_bp = Blueprint('products', __name__)

@products_bp.route('/api/layout', methods=['GET'])
def get_layout():
    layouts = get_db_file('layout.json')
    if isinstance(layouts, list):
        active_layout = next((l for l in layouts if l.get('active')), layouts[0] if layouts else {})
    else:
        active_layout = layouts
    return jsonify(active_layout)

@products_bp.route('/api/products', methods=['GET'])
def get_products():
    import copy
    import logging
    
    products = product_cache.get()
    if not products:
        products = get_db_file('products.json')
        product_cache.set(products)

    category = request.args.get('category')
    q = request.args.get('q', '').lower()
    search_by = request.args.get('search_by', 'all')  # 'all', 'name', 'description', 'category'
    sort_by = request.args.get('sort_by', 'name')  # 'name', 'price_asc', 'price_desc', 'rating'
    
    # IMPORTANT: Make a deep copy to avoid mutating the cache
    filtered = copy.deepcopy(products)
    
    # Filter by category
    if category:
        filtered = [p for p in filtered if p.get('category', '').lower() == category.lower()]
        logging.info(f"After category filter ({category}): {len(filtered)} products")

    # Filter by relationship (Men, Women, Kids etc.)
    relation = request.args.get('relation')
    if relation:
        filtered = [p for p in filtered if relation.lower() in [r.lower() for r in p.get('relations', [])]]
        logging.info(f"After relation filter ({relation}): {len(filtered)} products")

    # Filter by search query (before Cloudinary URL resolution)
    if q:
        if search_by == 'name':
            filtered = [p for p in filtered if q in p.get('name', '').lower()]
        elif search_by == 'description':
            filtered = [p for p in filtered if q in p.get('description', '').lower()]
        elif search_by == 'category':
            filtered = [p for p in filtered if q in p.get('category', '').lower()]
        else:  # 'all'
            # If query matches a category exactly, prioritize that category to avoid substring overlap
            if any(p.get('category', '').lower() == q for p in filtered):
                filtered = [p for p in filtered if p.get('category', '').lower() == q]
            else:
                filtered = [p for p in filtered if q in p.get('name', '').lower() or q in p.get('description', '').lower()]
        logging.info(f"After search filter (q={q}): {len(filtered)} products")
    
    # Filter by price range
    price_range = request.args.get('price_range')
    if price_range:
        try:
            low_str, high_str = price_range.split('-')
            low, high = int(low_str), int(high_str)
            filtered = [p for p in filtered if low <= p.get('price', 0) <= high]
            logging.info(f"After price filter ({low}-{high}): {len(filtered)} products")
        except (ValueError, IndexError):
            logging.warning(f"Invalid price_range format: {price_range}")
            pass

    # Sort the results
    if sort_by == 'price_asc':
        filtered.sort(key=lambda p: p.get('price', 0))
    elif sort_by == 'price_desc':
        filtered.sort(key=lambda p: p.get('price', 0), reverse=True)
    elif sort_by == 'rating':
        filtered.sort(key=lambda p: p.get('rating', 0), reverse=True)
    else:  # 'name'
        filtered.sort(key=lambda p: p.get('name', '').lower())

    # Resolve Cloudinary image URLs for all returned product objects (AFTER filtering and sorting)
    for product in filtered:
        product['image'] = get_cloudinary_url(product.get('image'))
    
    return jsonify(filtered)

@products_bp.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    import copy
    products = product_cache.get()
    if not products:
        products = get_db_file('products.json')
        product_cache.set(products)

    product = next((p for p in products if p.get('id') == product_id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    product = copy.deepcopy(product)
    product['image'] = get_cloudinary_url(product.get('image'))
    return jsonify(product)

@products_bp.route('/api/collections', methods=['GET'])
def get_collections():
    collections = get_db_file('collections.json')
    for collection in collections:
        collection['image'] = get_cloudinary_url(collection.get('image'), 'q_auto,f_auto,w_400,h_400,c_fill')
    return jsonify(collections), 200