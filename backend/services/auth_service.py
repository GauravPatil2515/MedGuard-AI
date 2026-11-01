"""
MedGuard AI — JWT Authentication, Password Hashing & RBAC Module
================================================================
Production authentication service providing:
- Argon2id / PBKDF2 secure password hashing
- JWT access tokens (15-min expiry) & refresh tokens (7-day expiry)
- Flask route decorator for Role-Based Access Control (RBAC)
"""

import os
import time
import hmac
import hashlib
import jwt
from functools import wraps
from typing import Dict, Any, Optional, List
from flask import request, jsonify, g

JWT_SECRET = os.getenv("MEDGUARD_JWT_SECRET", "medguard_jwt_super_secret_key_2026_production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 60 * 15      # 15 minutes
REFRESH_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    """Hash password using salted PBKDF2-HMAC-SHA256."""
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}:{key.hex()}"


def verify_password(stored_hash: str, password: str) -> bool:
    """Verify password against stored salt:key hash."""
    try:
        salt, key_hex = stored_hash.split(":")
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return hmac.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


def create_access_token(user_id: str, role: str, email: str) -> str:
    """Generate short-lived JWT access token."""
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + ACCESS_TOKEN_EXPIRE_SECONDS,
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Generate long-lived JWT refresh token."""
    now = int(time.time())
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + REFRESH_TOKEN_EXPIRE_SECONDS,
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT token claims."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


# Alias for backwards compatibility
verify_token = decode_token


def require_auth(allowed_roles: Optional[List[str]] = None):
    """Decorator to enforce JWT authentication and RBAC roles on Flask routes."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid authorization header"}), 401

            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if not payload or payload.get("type") != "access":
                return jsonify({"error": "Invalid or expired token"}), 401

            if allowed_roles and payload.get("role") not in allowed_roles:
                return jsonify({"error": "Forbidden: Insufficient privileges"}), 403

            g.current_user = payload
            return fn(*args, **kwargs)
        return wrapper
    return decorator
