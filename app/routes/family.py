from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Dict
from typing import Optional
from datetime import datetime, timezone, timedelta
import pytz
import bcrypt
import re
import json
import logging

from app.dependencies.auth_dependency import get_current_user
from fastapi import Depends

from app.db.mongo import (
    families_collection, members_collection, family_meal_collection,
    wellness_logs_collection, grocery_collection, recipes_collection
)
from app.services.openai_client import generate_response_streaming
from app.prompts.family_meal_prompt import build_family_meal_prompt
from app.prompts.grocery_list import build_grocery_prompt
from app.prompts.recipe_prompt import build_recipe_prompt
from app.models.family_meal_model import FamilyMealPlanModel
from app.models.mongo_schemas import FamilyModel, MemberModel
from app.models.request_modals import MealGenerationRequest
from bson import ObjectId

logger = logging.getLogger(__name__)
router = APIRouter()

class FamilyWithMembers(BaseModel):
    name: str
    email: EmailStr
    password: str
    state: Optional[str] = None

@router.post("/register-family", summary="Register family account")
async def register_family(data: FamilyWithMembers):
    try:
        existing = await families_collection.find_one({"email": data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        now = datetime.utcnow()
        hashed_password = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode('utf-8')
        
        # right after hashing the password, before creating family_doc
        if not data.state:
            # first account must choose a state
            raise HTTPException(status_code=400, detail="State is required during family registration")

        family_doc = {
            "name": data.name,
            "email": data.email,
            "password": hashed_password,
            "state": data.state,
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
            "state": data.state,
            "isVerified": False,
            "createdAt": now,
            "updatedAt": now
        }
        return {"status_code": 200, "detail": "User registered successfully", "user": response_data}

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

        if not request.force:
            existing = await family_meal_collection.find_one({"userId": user_id, "weekStart": week_start})
            if existing:
                logger.info(f"🔁 Returning existing plan for user_id={user_id}, week={week_start}")
                return existing["plan"]

        previous_plan = None
        previous_doc = await family_meal_collection.find_one({"userId": user_id}, sort=[("weekStart", -1)])
        if previous_doc:
            prev_week_start = previous_doc["weekStart"]
            if prev_week_start.tzinfo is None:
                prev_week_start = prev_week_start.replace(tzinfo=timezone.utc)
            if prev_week_start < week_start:
                previous_plan = previous_doc.get("plan")

        wellness_goals = {}
        if request.season:
            from app.routes.wellness import get_member_wellness_tips
            for m in members:
                name = m.get("fullName")
                prakriti = m.get("prakriti")
                conditions = m.get("medicalConditions", [])
                if prakriti:
                    tips = get_member_wellness_tips(prakriti, request.season, conditions)
                    if tips:
                        wellness_goals[name] = tips

        prompt = build_family_meal_prompt(family=members, previous_plan=previous_plan, wellness_goals=wellness_goals)
        raw_output = ""
        async for chunk in generate_response_streaming(prompt, task_type="family_meal_plan"):
            raw_output += chunk
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        # 👇 Robust JSON parsing block
        try:
            meal_plan = json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.warning("First JSON parse failed. Attempting fallback...")
            try:
                match = re.search(r"\{.*\}", cleaned, re.DOTALL)
                if match:
                    meal_plan = json.loads(match.group())
                else:
                    raise ValueError("No JSON object found")
            except Exception as fallback_e:
                logger.error(f"Fallback JSON parsing failed: {fallback_e}")
                raise HTTPException(status_code=500, detail="Meal plan output could not be parsed as JSON.")

        now_utc = datetime.now(pytz.UTC)
        meal_doc = FamilyMealPlanModel(
            userId=user_id,
            plan=meal_plan,
            createdAt=now_utc,
            weekStart=week_start,
            wellnessTips={}
        )
        await family_meal_collection.insert_one(meal_doc.model_dump())

        if wellness_goals:
            await wellness_logs_collection.insert_one({
                "userId": user_id,
                "season": request.season,
                "weekStart": week_start,
                "wellnessTips": wellness_goals,
                "timestamp": now_utc
            })

        # ✅ Generate Grocery
        from app.routes.grocery import group_items_by_category
        grocery_prompt = build_grocery_prompt(meal_plan)
        grocery_raw = ""
        async for chunk in generate_response_streaming(grocery_prompt, task_type="simple"):
            grocery_raw += chunk
        grocery_cleaned = re.sub(r"^```(?:json)?|```$", "", grocery_raw.strip(), flags=re.MULTILINE).strip()
        grocery_parsed = json.loads(grocery_cleaned)
        grocery_items = grocery_parsed.get("items", [])
        categorized_items = group_items_by_category(grocery_items)
        await grocery_collection.insert_one({
            "userId": user_id,
            "week": week_start.isoformat(),
            "itemsFlat": grocery_items,
            "itemsGrouped": categorized_items,
            "createdAt": now_utc
        })

        # ✅ Generate Recipes
        meal_names = {
            meal_info["base"].strip().lower()
            for day in meal_plan.values()
            for meal_info in day.values()
            if isinstance(meal_info, dict) and "base" in meal_info
        }
        for meal_name in meal_names:
            if await recipes_collection.find_one({"name": meal_name}):
                continue
            from app.prompts.recipe_prompt import build_recipe_prompt
            recipe_prompt = build_recipe_prompt(meal_name)
            recipe_raw = ""
            async for chunk in generate_response_streaming(recipe_prompt, task_type="grocery_list"):
                recipe_raw += chunk
            recipe_cleaned = re.sub(r"^```(?:json)?|```$", "", recipe_raw.strip(), flags=re.MULTILINE).strip()
            recipe_data = json.loads(recipe_cleaned)
            recipe_data.update({
                "name": meal_name,
                "createdAt": datetime.utcnow()
            })
            await recipes_collection.insert_one(recipe_data)

        logger.info(f"✅ Meal + Grocery + Recipes generated and saved for user_id={user_id}, week={week_start}")
        return meal_plan

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing failed: {e}")
        raise HTTPException(status_code=500, detail="Meal plan output could not be parsed")

    except Exception as e:
        logger.exception("❌ Unexpected error during full generation pipeline")
        raise HTTPException(status_code=500, detail="Meal generation with auto pipeline failed")

@router.get("/family/{user_id}/profile", summary="Get family profile (state lock)")
async def get_family_profile(user_id: str):
    fam = await families_collection.find_one({"_id": ObjectId(user_id)})
    if not fam:
        raise HTTPException(status_code=404, detail="Family account not found")
    state = fam.get("state")
    return {
        "state": state,
        "stateLocked": bool(state)
    }

@router.get("/get-all-family-meals/{user_id}", summary="Fetch all saved family meal plans by user ID")
async def get_all_family_meals(user_id: str):
    try:
        cursor = family_meal_collection.find({"userId": user_id}).sort("createdAt", -1)
        meal_plans = []
        async for plan in cursor:
            if "_id" in plan:
                plan["_id"] = str(plan["_id"])
            meal_plans.append(plan)
        if not meal_plans:
            raise HTTPException(status_code=404, detail="No meal plans found for this user")
        return meal_plans
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch meal plans: {str(e)}")

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
    return {"household_dosha": dominant, "average_scores": average, "member_count": count}