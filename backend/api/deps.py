# backend/api/deps.py
from __future__ import annotations
from fastapi import Header, HTTPException, status
from typing import Optional, Dict, Any
from api.auth import decode_token

# Extracts Bearer token from Authorization header, verifies "access" type
async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        if payload.typ != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        # Here you could look up the user by payload.sub if needed:
        #   user = await db.users.find_one({"_id": ObjectId(payload.sub)})
        #   if not user: raise HTTPException(401, "User not found")
        return {"user_id": payload.sub}
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

async def model_override(x_model: Optional[str] = Header(None, alias="X-Model")) -> Optional[str]:
    return x_model

async def prompt_version_override(x_prompt_ver: Optional[int] = Header(None, alias="X-Prompt-Ver")) -> Optional[int]:
    return x_prompt_ver