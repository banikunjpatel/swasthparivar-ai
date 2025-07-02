from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.db.mongo import members_collection
from app.models.mongo_schemas import MemberModel
from bson import ObjectId
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

# 🔹 Create single member
@router.post("/member", summary="Create a new member")
async def create_member(member: MemberModel):
    try:
        doc = member.model_dump()
        result = await members_collection.insert_one(doc)
        return {"message": "Member created", "memberId": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🔹 Get members by userId (family ID)
@router.get("/members/{user_id}", summary="Get all members for a family")
async def get_members(user_id: str):
    try:
        members_cursor = members_collection.find({"userId": user_id})
        members = []
        async for member in members_cursor:
            member["_id"] = str(member["_id"])  # Convert ObjectId to string
            members.append(member)
        return members
    except Exception as e:
        print("Error fetching members:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/members/{member_id}", summary="Update a member by ID")
async def update_member(member_id: str, updated_data: MemberModel):
    try:
        result = await members_collection.update_one(
            {"_id": ObjectId(member_id)},
            {"$set": updated_data.model_dump(exclude_unset=True)}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Member not found or no change")
        return {"message": "Member updated successfully"}
    except Exception as e:
        logger.exception("❌ Failed to update member")
        raise HTTPException(status_code=500, detail="Update failed")
    
@router.delete("/members/{member_id}", summary="Delete a member by ID")
async def delete_member(member_id: str):
    try:
        result = await members_collection.delete_one({"_id": ObjectId(member_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")
        return {"message": "Member deleted successfully"}
    except Exception as e:
        logger.exception("❌ Failed to delete member")
        raise HTTPException(status_code=500, detail="Deletion failed")