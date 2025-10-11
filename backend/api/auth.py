# backend/api/auth.py
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Dict
from pydantic import BaseModel
from jose import jwt, JWTError
from passlib.context import CryptContext
import os

# ---- Settings ----
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-in-prod")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_MIN = int(os.getenv("ACCESS_TOKEN_MIN", "30"))        # 30 minutes
REFRESH_TOKEN_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))     # 7 days
ISSUER = os.getenv("JWT_ISSUER", "swasth-backend")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    iat: int
    exp: int
    iss: str
    typ: str = "access"  # "access" or "refresh"

def _now() -> datetime:
    return datetime.now(timezone.utc)

def _encode(payload: Dict[str, Any]) -> str:
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def _base_payload(sub: str, minutes: int, typ: str) -> Dict[str, Any]:
    now = _now()
    return {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=minutes)).timestamp()),
        "iss": ISSUER,
        "typ": typ,
    }

def create_access_token(subject: str, minutes: Optional[int] = None) -> str:
    minutes = minutes or ACCESS_TOKEN_MIN
    return _encode(_base_payload(subject, minutes, "access"))

def create_refresh_token(subject: str, days: Optional[int] = None) -> str:
    days = days or REFRESH_TOKEN_DAYS
    minutes = days * 24 * 60
    return _encode(_base_payload(subject, minutes, "refresh"))

def decode_token(token: str) -> TokenPayload:
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], issuer=ISSUER)
        return TokenPayload(**data)
    except JWTError as e:
        raise ValueError(str(e))

# Optional helpers if you later add email+password flow
def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)

def verify_password(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)