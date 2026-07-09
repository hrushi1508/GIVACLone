"""
Reset demo data to a clean, known state.

Creates two accounts:
  admin@giva.co  /  Admin@1234   (is_admin = True)
  demo@giva.co   /  Demo@1234   (is_admin = False)

Keeps products.json and promos.json intact.
Clears all carts, wishlists, and orders.

Usage:
    cd backend
    python seed.py
"""

import json
import os
import datetime
from werkzeug.security import generate_password_hash

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')


def _write(filename, data):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(os.path.join(DATA_DIR, filename), 'w') as f:
        json.dump(data, f, indent=2)
    print(f"  wrote {filename} ({len(data) if isinstance(data, list) else '...'} records)")


def seed():
    print("Seeding demo data...\n")

    users = [
        {
            "id": "user_admin001",
            "email": "admin@giva.co",
            "name": "Admin",
            "password": generate_password_hash("Admin@1234"),
            "joined_date": str(datetime.date.today()),
            "is_admin": True,
            "role": "admin",
        },
        {
            "id": "user_demo0001",
            "email": "demo@giva.co",
            "name": "Demo User",
            "password": generate_password_hash("Demo@1234"),
            "joined_date": str(datetime.date.today()),
            "is_admin": False,
            "role": "customer",
        },
    ]
    _write("users.json", users)

    carts = [{"user_id": u["id"], "items": []} for u in users]
    _write("carts.json", carts)

    wishlists = [{"user_id": u["id"], "products": []} for u in users]
    _write("wishlist.json", wishlists)

    _write("orders.json", [])
    _write("audit_log.json", [])

    # Ensure promos exist with sensible defaults if file is missing
    promos_path = os.path.join(DATA_DIR, "promos.json")
    if not os.path.exists(promos_path):
        promos = [
            {
                "id": "promo_001", "code": "GIVA10",
                "description": "10% off on your first order",
                "discount_type": "percentage", "value": 10,
                "min_purchase": 1000, "max_discount": 500, "active": True
            },
            {
                "id": "promo_002", "code": "WELCOME500",
                "description": "Flat ₹500 off on orders above ₹2,000",
                "discount_type": "fixed", "value": 500,
                "min_purchase": 2000, "max_discount": 500, "active": True
            },
            {
                "id": "promo_003", "code": "FESTIVE20",
                "description": "20% off during festive season",
                "discount_type": "percentage", "value": 20,
                "min_purchase": 1500, "max_discount": 1000, "active": True
            },
            {
                "id": "promo_004", "code": "FREESHIP",
                "description": "Free shipping on orders above ₹500",
                "discount_type": "shipping", "value": 99,
                "min_purchase": 500, "max_discount": 99, "active": True
            },
        ]
        _write("promos.json", promos)
    else:
        print("  promos.json already exists — skipped")

    print("\nDone.")
    print("\nDemo accounts:")
    print("  Admin    -> admin@giva.co  /  Admin@1234")
    print("  Customer -> demo@giva.co   /  Demo@1234")


if __name__ == "__main__":
    seed()
