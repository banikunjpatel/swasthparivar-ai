from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse
from datetime import datetime
from bson import ObjectId
from app.dependencies.auth_dependency import get_current_user
from fastapi import Depends
import re
import json

from app.db.mongo import families_collection, members_collection
from app.services.openai_client import call_gpt
from app.prompts.family_meal_prompt import build_family_meal_prompt
from app.db.mongo import family_meal_collection
from app.models.family_meal_model import FamilyMealPlanModel
from app.models.mongo_schemas import FamilyModel
from app.models.mongo_schemas import MemberModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

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

        # Build family meal prompt
        prompt = build_family_meal_prompt(members)

        # Call GPT
        raw_output = call_gpt(prompt)

        # Remove ```json if present
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        meal_plan = json.loads(cleaned)

        # Save to DB
        meal_doc = FamilyMealPlanModel(userId=user_id, plan=meal_plan)
        await family_meal_collection.insert_one(meal_doc.model_dump())

        logger.info(f"✅ Family meal plan generated successfully for user_id={user_id}")
        return meal_plan

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed: {e}")
        raise HTTPException(status_code=500, detail="Meal plan output could not be parsed")

    except Exception as e:
        logger.exception("❌ Error generating family meal plan")
        raise HTTPException(status_code=500, detail="Family meal generation failed")