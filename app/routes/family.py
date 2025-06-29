from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse
from datetime import datetime
from bson import ObjectId
from app.dependencies.auth_dependency import get_current_user
from fastapi import Depends

from app.db.mongo import families_collection, members_collection
from app.models.mongo_schemas import FamilyModel, MemberModel
from app.services.meal_plan_service import generate_meal_plan
from app.logic.combine_family_plans import combine_family_plans
from app.utils.logger import get_logger
from app.utils.formatting import convert_list_to_day_dict

router = APIRouter()
logger = get_logger(__name__)

# 🧾 Request model for registering family and members
class FamilyWithMembers(BaseModel):
    family: FamilyModel
    members: List[MemberModel]


# ✅ Register family + members into MongoDB
@router.post("/register-family", summary="Register family with members")
async def register_family(data: FamilyWithMembers, current_user: str = Depends(get_current_user)):
    try:
        # 🔍 Check if email already registered
        existing = await families_collection.find_one({"email": data.family.email})
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        now = datetime.utcnow()

        # 🏠 Prepare and insert family document
        family_doc = data.family.model_dump()
        family_doc["createdAt"] = now
        family_doc["updatedAt"] = now
        family_doc["isVerified"] = False

        result = await families_collection.insert_one(family_doc)
        user_id = str(result.inserted_id)

        # 👥 Insert all members
        for member in data.members:
            member_doc = member.model_dump()
            member_doc["userId"] = user_id
            member_doc["createdAt"] = now
            member_doc["updatedAt"] = now
            member_doc["isVerified"] = False
            await members_collection.insert_one(member_doc)

        return {"message": "Family registered successfully", "userId": user_id}

    except Exception as e:
        logger.exception("❌ Failed to register family.")
        raise HTTPException(status_code=500, detail="Registration failed")


# ✅ Generate a combined family meal plan from stored MongoDB data
@router.get("/generate-family-meal/{user_id}", summary="Generate meal plan for all family members")
async def generate_family_meal(user_id: str):
    try:
        members = await members_collection.find({"userId": user_id}).to_list(length=10)
        if not members:
            raise HTTPException(status_code=404, detail="No members found for this family")

        meal_plans = {}

        for member in members:
            member.pop("_id", None)
            member.pop("createdAt", None)
            member.pop("updatedAt", None)
            individual_plan = generate_meal_plan(member)
            meal_plans[member["fullName"]] = convert_list_to_day_dict(individual_plan["plan"])

        combined = combine_family_plans(meal_plans)

        logger.info(f"✅ Family meal plan generated for user_id={user_id}")
        return combined

    except Exception as e:
        logger.exception("❌ Error generating family meal plan")
        raise HTTPException(status_code=500, detail="Family meal generation failed")


# ✅ Demo export route (static)
@router.get("/export-family-meal", summary="Export a sample family meal plan")
def export_sample_family_plan():
    try:
        sample_input = {
            "Anita": {
                "Monday": {"breakfast": "Poha", "lunch": "Paneer Curry"}
            },
            "Ramesh": {
                "Monday": {"breakfast": "Poha", "lunch": "Chicken Curry"}
            },
            "Amit": {
                "Monday": {"breakfast": "Upma", "lunch": "Dal Fry"}
            }
        }

        result = combine_family_plans(sample_input)
        return JSONResponse(content=result)

    except Exception as e:
        logger.exception("❌ Failed to export sample family plan.")
        raise HTTPException(status_code=500, detail="Could not export family meal plan")