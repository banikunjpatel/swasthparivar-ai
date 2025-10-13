# backend/api/otp.py
from __future__ import annotations

import os, random
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from jose import jwt, JWTError
import httpx

from backend.db.mongo import db  # uses your simple mongo.py with global `db`

router = APIRouter(prefix="/otp", tags=["auth:otp"])

# ---- ENV ----
MSG91_AUTH_KEY   = os.getenv("MSG91_AUTH_KEY", "")
MSG91_SENDER_ID  = os.getenv("MSG91_SENDER_ID", "")
MSG91_ROUTE      = os.getenv("MSG91_ROUTE", "4")
MSG91_COUNTRY    = os.getenv("MSG91_COUNTRY_CODE", "91")

OTP_LENGTH            = int(os.getenv("OTP_LENGTH", "6"))
OTP_EXPIRE_MINUTES    = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
OTP_COOLDOWN_MINUTES  = int(os.getenv("OTP_COOLDOWN_MINUTES", "1"))
OTP_MAX_ATTEMPTS      = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

# JWT (kept minimal; uses your existing env names)
JWT_SECRET   = os.getenv("JWT_SECRET") or os.getenv("JWT_SECRET_KEY") or "change-me"
JWT_ALG      = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_MIN   = int(os.getenv("ACCESS_TOKEN_MIN", "30"))
REFRESH_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))
ISSUER       = os.getenv("JWT_ISSUER", "swasthparivar-ai")

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def _gen_otp(n: int) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(n))

def _encode_jwt(sub: str, minutes: int, typ: str) -> str:
    now = utcnow()
    payload = {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=minutes)).timestamp()),
        "iss": ISSUER,
        "typ": typ,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def create_access_token(user_id: str) -> str:
    return _encode_jwt(user_id, ACCESS_MIN, "access")

def create_refresh_token(user_id: str) -> str:
    return _encode_jwt(user_id, REFRESH_DAYS * 24 * 60, "refresh")

# ---- Models ----
class OTPRequestBody(BaseModel):
    phone: str = Field(..., examples=["919876543210", "+919876543210"])

class OTPVerifyBody(BaseModel):
    phone: str
    code: str

# ---- MSG91 (kept in your v2 send-sms style) ----
async def send_sms_via_msg91(phone: str, message: str) -> None:
    # normalise: keep digits only; MSG91 accepts with/without country code
    to = "".join(ch for ch in phone if ch.isdigit())

    url = "https://api.msg91.com/api/v2/sendsms"
    headers = {
        "accept": "application/json",
        "authkey": MSG91_AUTH_KEY,
        "content-type": "application/json",
    }
    payload = {
        "sender": MSG91_SENDER_ID,
        "route": MSG91_ROUTE,
        "country": MSG91_COUNTRY,
        "sms": [
            {
                "message": message,
                "to": [to],
            }
        ],
    }
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(url, json=payload, headers=headers)
        if r.status_code != 200:
            # bubble up exact provider response for easier debugging
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"MSG91 error: {r.text}")

# ---- Routes ----
@router.post("/request")
async def request_otp(body: OTPRequestBody):
    if not MSG91_AUTH_KEY or not MSG91_SENDER_ID:
        raise HTTPException(500, "MSG91 not configured (missing MSG91_AUTH_KEY / MSG91_SENDER_ID)")

    phone = body.phone.strip()

    # cooldown: block spamming
    cutoff = utcnow() - timedelta(minutes=OTP_COOLDOWN_MINUTES)
    recent = await db.otp_requests.find_one({"phone": phone, "created_at": {"$gte": cutoff}})
    if recent:
        raise HTTPException(429, f"Please wait {OTP_COOLDOWN_MINUTES} minute(s) before requesting another OTP")

    # generate + persist (one active per phone)
    code = _gen_otp(OTP_LENGTH)
    expires_at = utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)

    await db.otps.update_one(
        {"phone": phone},
        {"$set": {"code": code, "expires_at": expires_at, "attempts": 0, "created_at": utcnow()}},
        upsert=True,
    )
    await db.otp_requests.insert_one({"phone": phone, "created_at": utcnow()})

    # send via MSG91
    message = f"{code} is your verification code. It expires in {OTP_EXPIRE_MINUTES} minutes."
    await send_sms_via_msg91(phone, message)

    return {"success": True, "message": "OTP sent"}

@router.post("/verify")
async def verify_otp(body: OTPVerifyBody):
    phone = body.phone.strip()
    rec = await db.otps.find_one({"phone": phone})
    if not rec:
        raise HTTPException(400, "No OTP requested for this phone")

    # expiry
    if rec.get("expires_at") and utcnow() > rec["expires_at"]:
        await db.otps.delete_one({"_id": rec["_id"]})
        raise HTTPException(400, "OTP expired")

    # attempts
    attempts = int(rec.get("attempts", 0))
    if attempts >= OTP_MAX_ATTEMPTS:
        await db.otps.delete_one({"_id": rec["_id"]})
        raise HTTPException(429, "Too many attempts. Request a new OTP")

    # compare
    if body.code != rec["code"]:
        await db.otps.update_one({"_id": rec["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, "Invalid code")

    # success → upsert user and issue tokens
    user = await db.users.find_one({"phone": phone})
    now = utcnow()
    if not user:
        ins = await db.users.insert_one({"phone": phone, "is_verified": True, "created_at": now, "updated_at": now})
        user_id = str(ins.inserted_id)
    else:
        user_id = str(user["_id"])
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"is_verified": True, "updated_at": now}})

    # cleanup OTP
    await db.otps.delete_one({"_id": rec["_id"]})

    return {
        "success": True,
        "token_type": "bearer",
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "user": {"id": user_id, "phone": phone, "is_verified": True},
    }