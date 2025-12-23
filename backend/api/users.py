# backend/api/users.py
from __future__ import annotations
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, Field, EmailStr
from jose import jwt
from firebase_admin import auth as fb_auth, credentials, initialize_app, _apps
from db.mongo import db  # your Motor global db
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/users", tags=["users"])

# JWT env
JWT_SECRET   = os.getenv("JWT_SECRET", "change-me")
JWT_ALG      = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_MIN   = int(os.getenv("ACCESS_TOKEN_MIN", "30"))
REFRESH_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))
ISSUER       = os.getenv("JWT_ISSUER", "swasthparivar-ai")

if not _apps:
    cred_env = os.getenv("FIREBASE_CREDENTIALS")
    # repo_backend_dir points to backend/
    repo_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    # repo_root is project root (one level above backend/)
    repo_root = os.path.abspath(os.path.join(repo_backend_dir, ".."))
    default_cred = os.path.join(repo_backend_dir, "credentials", "firebase-service-account.json")

    if cred_env:
        # if absolute path provided, use it; if relative, resolve relative to project root
        cred_path = cred_env if os.path.isabs(cred_env) else os.path.abspath(os.path.join(repo_root, cred_env))
    else:
        cred_path = default_cred

    if not os.path.exists(cred_path):
        raise RuntimeError(
            f"Firebase credentials not found at: {cred_path}. "
            "Set FIREBASE_CREDENTIALS env to the absolute path of your service account JSON."
        )

    initialize_app(credentials.Certificate(cred_path))
    
def _now(): return datetime.now(timezone.utc)
def _make_token(sub: str, minutes: int, typ: str) -> str:
    n = _now()
    payload = {
        "sub": sub, "typ": typ, "iss": ISSUER,
        "iat": int(n.timestamp()),
        "exp": int((n + timedelta(minutes=minutes)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

class RegisterBody(BaseModel):
    # REQUIRED Firebase idToken proves the phone
    idToken: Optional[str] = None
    uid: Optional[str] = None
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    createdAt: Optional[str] = None  # RFC1123 string expected like "Thu, 06 Nov 2025 04:21:40 GMT"
    emailVerified: Optional[bool] = None

@router.post("/register")
async def register_user(body: RegisterBody, authorization: Optional[str] = Header(None)):
    print("Register user called with:", body.dict())
    # 1) Verify Firebase token
    token = body.idToken
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]

    firebase_uid = None
    phone = None
    email = None
    email_verified = False
    created_at = None

    if token:
        # verify firebase id token
        try:
            decoded = fb_auth.verify_id_token(token)
            firebase_uid = decoded.get("uid")
            phone = decoded.get("phone_number")
            email = decoded.get("email")
            email_verified = decoded.get("email_verified", False)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Firebase token: {e}")
    else:
        # Use payload fields sent from client
        firebase_uid = body.uid
        phone = body.phoneNumber or None
        email = body.email or None
        email_verified = bool(body.emailVerified)

    # parse createdAt if present
    if body.createdAt:
        try:
            created_at = parsedate_to_datetime(body.createdAt)
        except Exception:
            created_at = None

    now = _now()

    # 2) Find existing user by firebase_uid or email
    query = {}
    if firebase_uid:
        query = {"firebase_uid": firebase_uid}
    elif email:
        query = {"email": email.lower()}
    else:
        # no identifier provided
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing uid or idToken or email")

    user = await db.users.find_one(query)

    # Prepare update doc only with fields provided
    updates = {"updated_at": now}
    if created_at is not None:
        updates["created_at"] = created_at
    if email:
        updates["email"] = email.lower()
    updates["emailVerified"] = email_verified
    if phone:
        updates["phone"] = phone
    if firebase_uid:
        updates["firebase_uid"] = firebase_uid

    if not user:
        doc = {
            "created_at": created_at or now,
            **updates
        }
        ins = await db.users.insert_one(doc)
        user_id = str(ins.inserted_id)
        user_doc = {"_id": ins.inserted_id, **doc}
    else:
        await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
        user_id = str(user["_id"])
        user_doc = {**user, **updates}

    # 3) Return created/updated user
    user_out = {
        "id": user_id,
        "phone": user_doc.get("phone"),
        "email": user_doc.get("email"),
        "emailVerified": user_doc.get("emailVerified"),
        "firebase_uid": user_doc.get("firebase_uid"),
        "created_at": user_doc.get("created_at"),
        "updated_at": user_doc.get("updated_at"),
    }
    return {"success": True, "user": user_out}


class LoginBody(BaseModel):
    uId: str  # Firebase ID Token from frontend


@router.post("/login")
async def login_user(body: LoginBody):

    

    # 2️⃣ Lookup user in MongoDB
    user = await db.users.find_one({"firebase_uid": body.uId})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not exist. Please sign up first."
        )

    # 3️⃣ Create tokens

    # 4️⃣ Return user object
    user_out = {
        "userId": str(user["_id"]),
        "firebase_uid": user["firebase_uid"],
        "email": user.get("email"),
        "phone": user.get("phone"),
        "isVerified": user.get("emailVerified", False),
    }

    return {
        "success": True,
        "user": user_out,
    }