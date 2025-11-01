from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.db.mongo import members_collection, families_collection
from app.models.mongo_schemas import MemberModel
from bson import ObjectId
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

# 🔹 Create single member
@router.post("/member", summary="Create a new member")
async def create_member(member: MemberModel):
    try:
        # Find the family/account doc
        family_oid = ObjectId(member.userId)
        family = await families_collection.find_one({"_id": family_oid})

        if not family:
            raise HTTPException(status_code=404, detail="Family account not found")

        chosen_state = family.get("state")

        # First member added after registration without state on account (legacy accounts)
        if not chosen_state:
            if not member.state:
                raise HTTPException(status_code=400, detail="State is required for the first member of this account")
            chosen_state = member.state
            # Persist it to the family/account so it’s locked for future members
            await families_collection.update_one(
                {"_id": family_oid},
                {"$set": {"state": chosen_state}}
            )

        # Always enforce member.state from the account
        doc = member.model_dump()
        doc["state"] = chosen_state

        result = await members_collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)

        return {
            "member": doc,
            "state": chosen_state,
            "stateLocked": True  # UI hint (optional)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("❌ Failed to create member")
        raise HTTPException(status_code=500, detail="Creation failed")

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
        # Load the account’s state and enforce it
        family_oid = ObjectId(member_id.userId)
        family = await families_collection.find_one({"_id": family_oid})
        if not family:
            raise HTTPException(status_code=404, detail="Family account not found")

        chosen_state = family.get("state")
        if not chosen_state:
            # legacy fallback: allow setting once via update, then lock
            if not member_id.state:
                raise HTTPException(status_code=400, detail="State is required to initialize account")
            chosen_state = member_id.state
            await families_collection.update_one({"_id": family_oid}, {"$set": {"state": chosen_state}})

        update_doc = member_id.model_dump()
        update_doc["state"] = chosen_state  # enforce state
        # Never allow userId overwrite
        update_doc.pop("_id", None)

        result = await members_collection.update_one(
            {"_id": ObjectId(member_id)},
            {"$set": update_doc}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        return {"message": "Member updated successfully", "state": chosen_state, "stateLocked": True}
    except HTTPException:
        raise
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