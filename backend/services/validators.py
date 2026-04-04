def validate_order(data):
    """Checks if the incoming order data is structured correctly."""
    required_fields = ['email', 'items', 'total']
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    if not isinstance(data['items'], list) or len(data['items']) == 0:
        return False, "Order must contain at least one item."
        
    return True, None