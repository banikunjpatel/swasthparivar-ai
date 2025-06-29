from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.db.mongo import members_collection
from app.models.mongo_schemas import MemberModel
from bson import ObjectId

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
    members = await members_collection.find({"userId": user_id}).to_list(length=10)
    return members