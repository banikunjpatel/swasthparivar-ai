import pytz
from datetime import datetime, timezone
import json
import re
from app.models.family_meal_model import FamilyMealPlanModel
from app.models.request_modals import MealGenerationRequest
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.db.mongo import (
    members_collection,
    family_meal_collection,
    grocery_collection,
    recipes_collection,
    wellness_logs_collection
)
from app.prompts.meal_plan import build_meal_plan_prompt
from app.prompts.grocery_list import build_grocery_prompt
from app.prompts.recipe_prompt import build_recipe_prompt
from app.services.openai_client import generate_response_streaming
from app.utils.logger import get_logger
from app.utils.extract_meals import extract_meal_names_from_plan
from app.logic.wellness import get_member_wellness_tips

logger = get_logger(__name__)
router = APIRouter()

# ✅ Generate meal plan using stored member profile
@router.post("/generate-meal/{member_id}", summary="Generate meal plan for one member by ID")
async def generate_meal(member_id: str, request: MealGenerationRequest):
    try:
        # ✅ Retrieve member profile from MongoDB
        week_start = request.weekStart.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=pytz.UTC)
        member = await members_collection.find_one({"_id": ObjectId(member_id)})
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        user_id = member.get("userId")

        if not request.force:
            existing = await family_meal_collection.find_one({
                "userId": user_id,
                "weekStart": week_start
            })
            if existing:
                logger.info(f"🔁 Returning existing plan for user_id={user_id}, week={week_start}")
                return existing["plan"]

        logger.info(f"Generating meal plan for member: {member.get('fullName')}")

        # Clean Mongo-specific fields
        member.pop("_id", None)
        member.pop("createdAt", None)
        member.pop("updatedAt", None)

        previous_plan = None
        previous_doc = await family_meal_collection.find_one({
            "userId": user_id
        }, sort=[("weekStart", -1)])
        if previous_doc:
            prev_week_start = previous_doc["weekStart"]
            if prev_week_start.tzinfo is None:
                prev_week_start = prev_week_start.replace(tzinfo=timezone.utc)
            if prev_week_start < week_start:
                previous_plan = previous_doc.get("plan")           
                
        prompt = build_meal_plan_prompt(member, previous_plan=previous_plan)
        raw_output = ""
        async for chunk in generate_response_streaming(prompt, task_type="meal_plan", max_tokens=2048):
            raw_output += chunk

        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()

        try:
            meal_plan = json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.warning(f"First JSON parse failed: {e}. Attempting fallback extraction...")
            logger.error(f"Raw AI output: {raw_output}")
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                try:
                    meal_plan = json.loads(match.group())
                except Exception as fallback_e:
                    logger.error(f"Fallback JSON parsing failed: {fallback_e}")
                    raise HTTPException(status_code=500, detail="Invalid JSON format from AI response")
            else:
                logger.error("No JSON object found in AI response.")
                raise HTTPException(status_code=500, detail="Invalid JSON format from AI response")

        if isinstance(meal_plan, dict) and "week" in meal_plan and isinstance(meal_plan["week"], dict):
            week_plan = meal_plan["week"]   # normalized days→meals
            metadata = meal_plan.get("metadata", {})
        else:
            week_plan = meal_plan           # assume top-level is the days dict
            metadata = {}

        now_utc = datetime.now(pytz.UTC)
        meal_doc = FamilyMealPlanModel(
            userId=user_id,
            plan=meal_plan,
            createdAt=now_utc,
            weekStart=week_start
        )
        await family_meal_collection.insert_one(meal_doc.model_dump())

        # 💡 Wellness tips (optional)
        wellness_goals = {}
        prakriti = member.get("prakriti")
        conditions = member.get("medicalConditions", [])
        if request.season and prakriti:
            tips = get_member_wellness_tips(prakriti, request.season, conditions)
            if tips:
                wellness_goals[member.get("fullName")] = tips
                await wellness_logs_collection.insert_one({
                    "userId": user_id,
                    "season": request.season,
                    "weekStart": week_start,
                    "wellnessTips": wellness_goals,
                    "timestamp": now_utc
                })

        # 🛒 Auto-generate grocery list
        grocery_prompt = build_grocery_prompt(meal_plan)
        grocery_output = ""
        async for chunk in generate_response_streaming(grocery_prompt, task_type="grocery_list"):
            grocery_output += chunk
        grocery_cleaned = re.sub(r"^```(?:json)?|```$", "", grocery_output.strip(), flags=re.MULTILINE).strip()
        grocery_items = json.loads(grocery_cleaned).get("items", [])
        await grocery_collection.insert_one({
            "userId": user_id,
            "week": request.weekStart,
            "itemsFlat": grocery_items,
            "createdAt": now_utc
        })

        # 🍲 Auto-generate recipes
        try:
            meal_names = extract_meal_names_from_plan(week_plan)  # << prefer updated util (see below)
        except Exception:
            meal_names = {
                (info.get("base") or "").strip().lower()
                for day in week_plan.values()
                for info in day.values()   # breakfast, mid_morning, lunch, evening_snack, dinner
                if isinstance(info, dict)
                and isinstance(info.get("base"), str)
                and info.get("base").strip()
            }

        for meal_name in meal_names:
            existing_recipe = await recipes_collection.find_one({"name": meal_name.lower()})
            if existing_recipe:
                continue
            recipe_prompt = build_recipe_prompt(meal_name)
            recipe_output = ""
            async for chunk in generate_response_streaming(recipe_prompt, task_type="recipe", max_tokens=2048):
                recipe_output += chunk
            recipe_cleaned = re.sub(r"^```(?:json)?|```$", "", recipe_output.strip(), flags=re.MULTILINE).strip()
            recipe_data = json.loads(recipe_cleaned)
            recipe_data["name"] = meal_name.lower()
            recipe_data["createdAt"] = now_utc
            await recipes_collection.insert_one(recipe_data)

        return meal_plan

    except json.JSONDecodeError as e:
        logger.error(f"Meal plan parsing error for member {member_id}: {e}")
        raise HTTPException(status_code=500, detail="Meal plan output could not be parsed as JSON.")

    except Exception as e:
        logger.exception(f"Unexpected error in meal generation for {member_id}")
        raise HTTPException(status_code=500, detail="Meal plan could not be generated")