# backend/api/users.py
from __future__ import annotations
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from jose import jwt
from firebase_admin import auth as fb_auth
from db.mongo import db  # your Motor global db

router = APIRouter(prefix="/users", tags=["users"])

# JWT env
JWT_SECRET   = os.getenv("JWT_SECRET", "change-me")
JWT_ALG      = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_MIN   = int(os.getenv("ACCESS_TOKEN_MIN", "30"))
REFRESH_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))
ISSUER       = os.getenv("JWT_ISSUER", "swasthparivar-ai")

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
    idToken: str

    # Your user fields (add/remove as you need)
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    gender: Optional[str] = Field(default=None, description="male|female|other")
    dob: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    # add more like address, family_id, etc.

@router.post("/register")
async def register_user(body: RegisterBody):
    # 1) Verify Firebase token
    try:
        decoded = fb_auth.verify_id_token(body.idToken)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {e}")

    phone = decoded.get("phone_number")
    if not phone:
        raise HTTPException(400, "Firebase token missing phone_number")

    # 2) Upsert user with provided profile data
    now = _now()
    user = await db.users.find_one({"phone": phone})

    # Prepare update doc only with fields provided
    updates = {"updated_at": now, "is_verified": True}
    if body.name is not None:   updates["name"] = body.name
    if body.email is not None:  updates["email"] = body.email.lower()
    if body.gender is not None: updates["gender"] = body.gender
    if body.dob is not None:    updates["dob"] = body.dob
    # You can also store Firebase uid if you want:
    updates["firebase_uid"] = decoded.get("uid")

    if not user:
        doc = {
            "phone": phone,
            "created_at": now,
            **updates
        }
        ins = await db.users.insert_one(doc)
        user_id = str(ins.inserted_id)
        user_doc = { "_id": ins.inserted_id, **doc }
    else:
        await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
        user_id = str(user["_id"])
        user_doc = { **user, **updates }

    # 3) Issue your JWTs
    access  = _make_token(user_id, ACCESS_MIN, "access")
    refresh = _make_token(user_id, REFRESH_DAYS * 24 * 60, "refresh")

    # 4) Return
    # (Convert Mongo _id to string for frontend)
    user_out = {
        "id": user_id,
        "phone": user_doc["phone"],
        "name": user_doc.get("name"),
        "email": user_doc.get("email"),
        "gender": user_doc.get("gender"),
        "dob": user_doc.get("dob"),
        "is_verified": True,
        "firebase_uid": user_doc.get("firebase_uid"),
        "created_at": user_doc.get("created_at"),
        "updated_at": user_doc.get("updated_at"),
    }
    return {
        "success": True,
        "token_type": "bearer",
        "access_token": access,
        "refresh_token": refresh,
        "user": user_out,
    }
