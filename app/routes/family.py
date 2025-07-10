from fastapi import APIRouter, HTTPException
from pydantic import BaseModel,EmailStr
from typing import List, Dict
from datetime import datetime
import pytz
from datetime import datetime
from app.dependencies.auth_dependency import get_current_user
from fastapi import Depends
from datetime import timezone
import re
import json

from app.db.mongo import families_collection, members_collection
from app.services.openai_client import call_gpt
from app.prompts.family_meal_prompt import build_family_meal_prompt
from app.db.mongo import family_meal_collection
from app.models.family_meal_model import FamilyMealPlanModel
from app.models.mongo_schemas import FamilyModel
from app.models.mongo_schemas import MemberModel
from app.db.mongo import wellness_logs_collection
from app.models.request_modals import MealGenerationRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

from datetime import datetime, timedelta
import bcrypt

# ✅ Register family + members into MongoDB
class FamilyWithMembers(BaseModel):
    name: str
    email: EmailStr
    password: str


# ✅ Register family + members into MongoDB
@router.post("/register-family", summary="Register family account")
async def register_family(data: FamilyWithMembers):
    try:
        # 🔍 Check if email already exists
        existing = await families_collection.find_one({"email": data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        now = datetime.utcnow()

        # 🔐 Hash password before saving (if not done already)
        hashed_password =  bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode('utf-8')

        family_doc = {
            "name": data.name,
            "email": data.email,
            "password": hashed_password,
            "createdAt": now,
            "updatedAt": now,
            "isVerified": False,
        }

        result = await families_collection.insert_one(family_doc)
        user_id = str(result.inserted_id)
        response_data = {
            "userId": user_id,
            "name": data.name,
            "email": data.email,
            "isVerified": False,
            "createdAt": now,
            "updatedAt": now
        }
        return { "status_code": 200,"detail": "User registered successfully","user": response_data}

    except Exception as e:
        logger.exception("❌ Failed to register user.")
        raise HTTPException(status_code=500, detail="Registration failed")



@router.post("/generate-family-meal/{user_id}", summary="Generate meal plan for a specific week")
async def generate_family_meal(user_id: str, request: MealGenerationRequest):
    try:
        week_start = request.weekStart.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=pytz.UTC)

        members = await members_collection.find({"userId": user_id}).to_list(length=10)
        if not members:
            raise HTTPException(status_code=404, detail="No members found for this family")

        # ⛔ Check if already exists unless force
        if not request.force:
            existing = await family_meal_collection.find_one({
                "userId": user_id,
                "weekStart": week_start
            })
            if existing:
                logger.info(f"🔁 Returning existing plan for user_id={user_id}, week={week_start}")
                return existing["plan"]

        # 📦 Fetch previous plan (to avoid duplicates)
        previous_plan = None
        previous_doc = await family_meal_collection.find_one({
            "userId": user_id
        }, sort=[("weekStart", -1)])
        if previous_doc:
            prev_week_start = previous_doc["weekStart"]
        if previous_doc and prev_week_start.tzinfo is None:
            prev_week_start = prev_week_start.replace(tzinfo=timezone.utc)
        if previous_doc and prev_week_start < week_start:
            previous_plan = previous_doc.get("plan")

        # 🌿 Build seasonal wellness goals (optional)
        wellness_goals = {}
        if request.season:
            from app.routes.wellness import get_member_wellness_tips  # or move to shared utility
            for m in members:
                name = m.get("fullName")
                prakriti = m.get("prakriti")
                conditions = m.get("medicalConditions", [])
                if prakriti:
                    tips = get_member_wellness_tips(prakriti, request.season, conditions)
                    if tips:
                        wellness_goals[name] = tips

        # 🧠 Build GPT prompt
        prompt = build_family_meal_prompt(
            family=members,
            previous_plan=previous_plan,
            wellness_goals=wellness_goals
        )

        raw_output = call_gpt(prompt)

        # 🧹 Clean and parse JSON
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        meal_plan = json.loads(cleaned)

        # 💾 Save plan to DB
        now_utc = datetime.now(pytz.UTC)
        meal_doc = FamilyMealPlanModel(
            userId=user_id,
            plan=meal_plan,
            createdAt=now_utc,
            weekStart=week_start,
            wellnessTips={}
        )
        await family_meal_collection.insert_one(meal_doc.model_dump())
        
        # NEW: Log seasonal tips
        if wellness_goals:
            await wellness_logs_collection.insert_one({
                "userId": user_id,
                "season": request.season,
                "weekStart": week_start,
                "wellnessTips": wellness_goals,
                "timestamp": now_utc
            })

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
    
@router.get("/get-all-family-meals/{user_id}", summary="Fetch all saved family meal plans by user ID")
async def get_all_family_meals(user_id: str):
    try:
        cursor = family_meal_collection.find({"userId": user_id}).sort("createdAt", -1)
        meal_plans = []

        async for plan in cursor:
            # Convert all ObjectId to str
            if "_id" in plan:
                plan["_id"] = str(plan["_id"])
            # Optional: Convert nested ObjectIds if any
            meal_plans.append(plan)

        if not meal_plans:
            raise HTTPException(status_code=404, detail="No meal plans found for this user")

        return meal_plans

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch meal plans: {str(e)}")
    
    # Household Dosha Aggregation

def determine_household_dosha(average: Dict[str, float]) -> str:
    sorted_doshas = sorted(average.items(), key=lambda x: x[1], reverse=True)
    top_score = sorted_doshas[0][1]
    top_doshas = [dosha for dosha, score in sorted_doshas if score == top_score]

    if len(top_doshas) == 1:
        return top_doshas[0]
    elif len(top_doshas) == 2:
        return "+".join(top_doshas)
    else:
        return "tri-doshic"

@router.get("/family/{family_id}/household-dosha")
async def get_household_dosha(family_id: str):
    try:
        members = await members_collection.find({"userId": family_id}).to_list(length=100)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching members: {str(e)}")

    if not members:
        raise HTTPException(status_code=404, detail="No members found")

    total = {"vata": 0, "pitta": 0, "kapha": 0}
    count = 0

    for member in members:
        stats = member.get("doshaStats")
        if stats:
            total["vata"] += stats.get("vata", 0)
            total["pitta"] += stats.get("pitta", 0)
            total["kapha"] += stats.get("kapha", 0)
            count += 1

    if count == 0:
        raise HTTPException(status_code=404, detail="No dosha stats available")

    average = {k: round(v / count, 2) for k, v in total.items()}
    dominant = determine_household_dosha(average)

    return {
        "household_dosha": dominant,
        "average_scores": average,
        "member_count": count
    }