# backend/api/members.py

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from db.mongo import members_collection

logger = logging.getLogger("uvicorn")
router = APIRouter(tags=["members"])


# ---- Pydantic models (aligned with member.json schema) ----

class DoshaDistribution(BaseModel):
    """Dosha percentage distribution"""
    vata: float = Field(ge=0, le=100)
    pitta: float = Field(ge=0, le=100)
    kapha: float = Field(ge=0, le=100)


class PrakritiGuidance(BaseModel):
    """Ayurvedic guidance based on prakriti"""
    foods_to_favor: List[str] = Field(default_factory=list)
    foods_to_avoid: List[str] = Field(default_factory=list)
    lifestyle_tips: List[str] = Field(default_factory=list)


class PrakritiAssessment(BaseModel):
    """Prakriti assessment result structure"""
    primaryDosha: str = Field(..., description="Primary dosha: vata, pitta, kapha, or tridoshic")
    secondaryDosha: Optional[str] = Field(None, description="Secondary dosha if applicable")
    distribution: DoshaDistribution
    guidance: PrakritiGuidance
    notes: Optional[str] = None
    assessedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    version: Optional[str] = Field("1.0", description="Assessment version/algorithm")


class MemberCreate(BaseModel):
    userId: str
    fullName: str
    age: int = None
    gender: str = None
    dietaryPreferences: str = None
    state: Optional[str] = None


class MemberUpdate(BaseModel):
    fullName: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    dietaryPreferences: Optional[str] = None    
    state: Optional[str] = None
    # Prakriti assessment fields
    prakriti: Optional[PrakritiAssessment] = None


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
        # Convert Pydantic model to dict, handling nested models properly
        update_doc = payload.model_dump(exclude_unset=True, exclude_none=True, mode="json")
        
        # Handle prakriti assessment separately to ensure proper serialization
        if "prakriti" in update_doc and update_doc["prakriti"]:
            # Ensure assessedAt is set if not provided
            if "assessedAt" not in update_doc["prakriti"] or not update_doc["prakriti"]["assessedAt"]:
                update_doc["prakriti"]["assessedAt"] = datetime.utcnow()
        
        if not update_doc:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_doc["updatedAt"] = datetime.utcnow()

        result = await members_collection.update_one(
            {"_id": ObjectId(member_id)},
            {"$set": update_doc}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        # Return updated member
        updated_member = await members_collection.find_one({"_id": ObjectId(member_id)})
        if updated_member:
            updated_member["_id"] = str(updated_member["_id"])
            # Convert datetime objects to ISO strings for JSON response
            if "prakriti" in updated_member and updated_member["prakriti"]:
                if "assessedAt" in updated_member["prakriti"] and isinstance(updated_member["prakriti"]["assessedAt"], datetime):
                    updated_member["prakriti"]["assessedAt"] = updated_member["prakriti"]["assessedAt"].isoformat()
            if "createdAt" in updated_member and isinstance(updated_member["createdAt"], datetime):
                updated_member["createdAt"] = updated_member["createdAt"].isoformat()
            if "updatedAt" in updated_member and isinstance(updated_member["updatedAt"], datetime):
                updated_member["updatedAt"] = updated_member["updatedAt"].isoformat()
        
        return {"message": "Member updated successfully", "member": updated_member}

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
