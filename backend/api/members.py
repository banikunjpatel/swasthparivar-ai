# backend/api/members.py

import logging
from typing import List, Optional
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db.mongo import members_collection

logger = logging.getLogger("uvicorn")
router = APIRouter(tags=["members"])


# ---- Pydantic models (aligned with member.json schema) ----

class MemberCreate(BaseModel):
    userId: str
    fullName: str
    age: Optional[int] = None
    gender: Optional[str] = None
    dietaryPreferences: Optional[str] = None
    medicalConditions: List[str]          # required
    allergies: List[str] = []             # default empty
    prakriti: Optional[str] = None
    state: Optional[str] = None


class MemberUpdate(BaseModel):
    fullName: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    dietaryPreferences: Optional[str] = None
    medicalConditions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    prakriti: Optional[str] = None
    state: Optional[str] = None


# ---- Routes ----

@router.post("/member", summary="Create a new member")
async def create_member(member: MemberCreate):
    try:
        doc = member.model_dump()
        now = datetime.utcnow()
        doc["createdAt"] = now
        doc["updatedAt"] = now

        result = await members_collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)

        return {"member": doc}

    except Exception as e:
        logger.error(f"Failed to create member: {e}")
        raise HTTPException(status_code=500, detail="Creation failed")


@router.get("/members/{user_id}", summary="Get all members for a user")
async def get_members(user_id: str) -> List[dict]:
    try:
        cursor = members_collection.find({"userId": user_id})
        members = []

        async for m in cursor:
            m["_id"] = str(m["_id"])
            members.append(m)

        return members

    except Exception as e:
        logger.error(f"Failed to fetch members: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/members/{member_id}", summary="Update a member by ID")
async def update_member(member_id: str, payload: MemberUpdate):
    try:
        update_doc = {k: v for k, v in payload.model_dump().items() if v is not None}

        if not update_doc:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_doc["updatedAt"] = datetime.utcnow()

        result = await members_collection.update_one(
            {"_id": ObjectId(member_id)},
            {"$set": update_doc}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        return {"message": "Member updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update member: {e}")
        raise HTTPException(status_code=500, detail="Update failed")


@router.delete("/members/{member_id}", summary="Delete a member by ID")
async def delete_member(member_id: str):
    try:
        result = await members_collection.delete_one({"_id": ObjectId(member_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        return {"message": "Member deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete member: {e}")
        raise HTTPException(status_code=500, detail="Deletion failed")
