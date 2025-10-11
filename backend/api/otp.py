# backend/api/otp.py
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta, timezone
import os, random, httpx

from db.mongo import get_db
from api.auth import create_access_token, create_refresh_token

router = APIRouter(prefix="/otp", tags=["auth:otp"])

# ---- Settings (env) ----
OTP_LENGTH = int(os.getenv("OTP_LENGTH", "6"))
OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
OTP_COOLDOWN_MINUTES = int(os.getenv("OTP_COOLDOWN_MINUTES", "1"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
SMS_API_URL = os.getenv("SMS_API_URL", "")        # e.g., https://api.twilio.com/... or your provider proxy
SMS_API_KEY = os.getenv("SMS_API_KEY", "")        # or auth token for your SMS gateway
SENDER_ID = os.getenv("SMS_SENDER_ID", "Swasth")

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class OTPRequest(BaseModel):
    phone: str = Field(..., examples=["+919876543210"])

class OTPVerify(BaseModel):
    phone: str
    code: str

def _gen_otp(length: int) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(length))

async def _send_sms(phone: str, message: str) -> None:
    if not SMS_API_URL:
        # In dev: log but don't fail hard
        print(f"[DEV] SMS to {phone}: {message}")
        return
    headers = {"Authorization": f"Bearer {SMS_API_KEY}"} if SMS_API_KEY else {}
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(SMS_API_URL, json={"to": phone, "sender": SENDER_ID, "message": message}, headers=headers)
        resp.raise_for_status()

@router.post("/request")
async def request_otp(data: OTPRequest, db=Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    # Cooldown check
    now = utcnow()
    cutoff = now - timedelta(minutes=OTP_COOLDOWN_MINUTES)
    recent = await db.otp_requests.find_one({"phone": data.phone, "created_at": {"$gte": cutoff}})
    if recent:
        return JSONResponse(
            status_code=429,
            content={"success": False, "message": f"Please wait {OTP_COOLDOWN_MINUTES} minute(s) before requesting another OTP"}
        )

    # create OTP
    code = _gen_otp(OTP_LENGTH)
    expires_at = now + timedelta(minutes=OTP_EXPIRE_MINUTES)

    # Persist OTP (upsert one active)
    await db.otps.update_one(
        {"phone": data.phone},
        {"$set": {"code": code, "expires_at": expires_at, "attempts": 0, "created_at": now}},
        upsert=True
    )
    # Log request
    await db.otp_requests.insert_one({"phone": data.phone, "created_at": now})

    # Send SMS
    try:
        await _send_sms(data.phone, f"{code} is your verification code. It expires in {OTP_EXPIRE_MINUTES} minutes.")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"SMS provider error: {e}")

    return {"success": True, "message": "OTP sent"}

@router.post("/verify")
async def verify_otp(data: OTPVerify, db=Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    rec = await db.otps.find_one({"phone": data.phone})
    if not rec:
        raise HTTPException(status_code=400, detail="No OTP requested for this phone")

    # Expiry
    if rec.get("expires_at") and utcnow() > rec["expires_at"]:
        await db.otps.delete_one({"_id": rec["_id"]})
        raise HTTPException(status_code=400, detail="OTP expired")

    # Attempts
    if rec.get("attempts", 0) >= OTP_MAX_ATTEMPTS:
        await db.otps.delete_one({"_id": rec["_id"]})
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new OTP")

    # Check code
    if data.code != rec["code"]:
        await db.otps.update_one({"_id": rec["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid code")

    # Success: issue tokens, upsert user
    now = utcnow()
    user = await db.users.find_one({"phone": data.phone})
    if not user:
        res = await db.users.insert_one({"phone": data.phone, "is_verified": True, "created_at": now, "updated_at": now})
        user_id = str(res.inserted_id)
        user = {"_id": res.inserted_id, "phone": data.phone, "is_verified": True, "created_at": now, "updated_at": now}
    else:
        user_id = str(user["_id"])
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"is_verified": True, "updated_at": now}})

    # Cleanup OTP
    await db.otps.delete_one({"_id": rec["_id"]})

    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    return {
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "phone": user["phone"],
            "is_verified": True,
            "created_at": user["created_at"],
            "updated_at": user.get("updated_at", user["created_at"])
        }
    }