from .admin import admin_bp
from .products import products_bp
from .auth import auth_bp
from .cart import cart_bp
from .wishlist import wishlist_bp
from .orders import orders_bp
from .promo import promo_bp
from .media import media_bp

__all__ = ['admin_bp', 'products_bp', 'auth_bp', 'cart_bp', 'wishlist_bp', 'orders_bp', 'promo_bp', 'media_bp']