from .data_manager import DataManager

db = DataManager()

def validate_order(data):
    """Checks if the incoming order data is structured correctly."""
    if 'items' not in data or not isinstance(data['items'], list) or len(data['items']) == 0:
        return False, "Order must contain at least one item."
        
    if 'billing' not in data or 'total' not in data['billing']:
        return False, "Missing billing information."
    
    # Additional validations
    products = db.read('products.json')
    product_ids = {p['id'] for p in products}
    for item in data['items']:
        if not isinstance(item.get('id'), int) or item['id'] not in product_ids:
            return False, f"Invalid product ID: {item.get('id')}"
        if not isinstance(item.get('quantity', 0), int) or item['quantity'] <= 0:
            return False, "Invalid quantity for item."
    
    if not isinstance(data['billing']['total'], (int, float)) or data['billing']['total'] <= 0:
        return False, "Invalid total amount."
        
    return True, None