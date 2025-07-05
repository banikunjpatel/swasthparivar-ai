from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import pytz
from datetime import datetime
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

from datetime import datetime, timedelta
import pytz

def get_week_start_date(week_offset: int = 0) -> datetime:
    """
    Returns the Monday of the current or future week in UTC, starting at 00:00:00.
    week_offset = 0 → current week
    week_offset = 1 → next week
    """
    now_utc = datetime.now(pytz.UTC)
    monday = now_utc - timedelta(days=now_utc.weekday())  # current week's Monday
    monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    return monday + timedelta(weeks=week_offset)

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


@router.get("/generate-family-meal/{user_id}", summary="Generate meal plan for all family members")
async def generate_family_meal(user_id: str, week: str = "current", force: bool = False):
    try:
        members = await members_collection.find({"userId": user_id}).to_list(length=10)
        if not members:
            raise HTTPException(status_code=404, detail="No members found for this family")

        # ✅ Choose current or next week based on query
        week_offset = 0 if week == "current" else 1
        week_start = get_week_start_date(week_offset)

        # ✅ Check if plan already exists for that week
        if not force:
            existing = await family_meal_collection.find_one({
                "userId": user_id,
                "weekStart": week_start
            })
            if existing:
                logger.info(f"🔁 Returning existing plan for user_id={user_id}, week={week_start}")
                return existing["plan"]

        # 🔁 Optional: fetch previous week's plan to avoid repeats
        previous_plan = None
        if week_offset > 0:
            last_week_start = get_week_start_date(week_offset - 1)
            last_week_doc = await family_meal_collection.find_one({
                "userId": user_id,
                "weekStart": last_week_start
            })
            if last_week_doc:
                previous_plan = last_week_doc.get("plan")

        # 🧠 Build prompt and generate plan
        prompt = build_family_meal_prompt(family=members, previous_plan=previous_plan)
        raw_output = call_gpt(prompt)
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        meal_plan = json.loads(cleaned)

        # 💾 Save to DB
        now_utc = datetime.now(pytz.UTC)
        meal_doc = FamilyMealPlanModel(
            userId=user_id,
            plan=meal_plan,
            createdAt=now_utc,
            weekStart=week_start
        )
        await family_meal_collection.insert_one(meal_doc.model_dump())

        logger.info(f"✅ New meal plan saved for user_id={user_id}, week={week_start}")
        return meal_plan

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing failed: {e}")
        raise HTTPException(status_code=500, detail="Meal plan output could not be parsed")

    except Exception as e:
        logger.exception("❌ Unexpected error during meal generation")
        raise HTTPException(status_code=500, detail="Family meal generation failed")
    
@router.get("/get-family-meal/{user_id}", summary="Fetch latest saved family meal plan by user ID")
async def get_family_meal(user_id: str):
    try:
        latest_plan = await family_meal_collection.find_one(
            {"userId": user_id},
            sort=[("createdAt", -1)]
        )

        if not latest_plan:
            raise HTTPException(status_code=404, detail="No meal plan found for this user")

        # Convert ObjectId to string for JSON serialization
        latest_plan["_id"] = str(latest_plan["_id"])

        return latest_plan

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch family meal plan")