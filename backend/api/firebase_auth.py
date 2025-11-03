# # backend/api/firebase_auth.py
# from __future__ import annotations
# import os, json
# from datetime import datetime, timedelta, timezone
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from jose import jwt
# from firebase_admin import auth as fb_auth, credentials, initialize_app, _apps
# from db.mongo import db  # your Motor client with global `db`

# router = APIRouter(prefix="/auth", tags=["auth:firebase"])

# # Initialize Firebase Admin once
# cred_path = os.getenv("FIREBASE_CREDENTIALS")
# if not cred_path or not os.path.exists(cred_path):
#     raise RuntimeError("FIREBASE_CREDENTIALS missing or invalid path")
# if not _apps:  # only init if not already
#     initialize_app(credentials.Certificate(cred_path))

# # JWT env
# JWT_SECRET   = os.getenv("JWT_SECRET", "change-me")
# JWT_ALG      = os.getenv("JWT_ALGORITHM", "HS256")
# ACCESS_MIN   = int(os.getenv("ACCESS_TOKEN_MIN", "30"))
# REFRESH_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))
# ISSUER       = os.getenv("JWT_ISSUER", "swasthparivar-ai")

# def now_utc(): return datetime.now(timezone.utc)
# def make_token(sub: str, minutes: int, typ: str) -> str:
#     n = now_utc()
#     payload = {
#         "sub": sub,
#         "typ": typ,
#         "iat": int(n.timestamp()),
#         "exp": int((n + timedelta(minutes=minutes)).timestamp()),
#         "iss": ISSUER,
#     }
#     return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

# class FirebaseToken(BaseModel):
#     idToken: str

# @router.post("/firebase")
# async def firebase_login(body: FirebaseToken):
#     try:
#         decoded = fb_auth.verify_id_token(body.idToken)
#     except Exception as e:
#         raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {e}")

#     phone = decoded.get("phone_number")
#     if not phone:
#         raise HTTPException(status_code=400, detail="Firebase token missing phone_number")

#     # Upsert user by phone
#     now = now_utc()
#     user = await db.users.find_one({"phone": phone})
#     if not user:
#         ins = await db.users.insert_one({"phone": phone, "is_verified": True, "created_at": now, "updated_at": now})
#         user_id = str(ins.inserted_id)
#     else:
#         user_id = str(user["_id"])
#         await db.users.update_one({"_id": user["_id"]}, {"$set": {"is_verified": True, "updated_at": now}})

#     # Issue your own JWT pair
#     access  = make_token(user_id, ACCESS_MIN, "access")
#     refresh = make_token(user_id, REFRESH_DAYS * 24 * 60, "refresh")

#     return {
#         "success": True,
#         "token_type": "bearer",
#         "access_token": access,
#         "refresh_token": refresh,
#         "user": {"id": user_id, "phone": phone, "is_verified": True},
#     }