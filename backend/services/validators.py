def validate_order(data):
    """Checks if the incoming order data is structured correctly."""
    if 'items' not in data or not isinstance(data['items'], list) or len(data['items']) == 0:
        return False, "Order must contain at least one item."
        
    if 'billing' not in data or 'total' not in data['billing']:
        return False, "Missing billing information."
        
    return True, None