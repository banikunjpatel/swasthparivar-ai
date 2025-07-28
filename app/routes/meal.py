import pytz
from datetime import datetime, timezone
import json
import re
from app.models.family_meal_model import FamilyMealPlanModel
from app.models.request_modals import MealGenerationRequest
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.db.mongo import members_collection, family_meal_collection
from app.prompts.meal_plan import build_meal_plan_prompt
from app.services.openai_client import generate_response_streaming
from app.utils.logger import get_logger
from app.utils.formatting import title_case_meals, convert_list_to_day_dict
from app.utils.compliance import check_meal_compliance

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
        
        user_id = member.get("userId")  # get the family userId
        
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

        # Find most recent family plan
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

        # 🧠 Build prompt and call GPT
        prompt = build_meal_plan_prompt(member, previous_plan=previous_plan)
        
        # ¸Get full output from streamed chunks
        raw_output = ""
        async for chunk in generate_response_streaming(prompt, task_type="meal_plan"):
            raw_output += chunk
            
        # Clean Markdown formatting if GPT wrapped it in ```json ... ```
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()

        # Parse JSON safely
        try:
            parsed_json = json.loads(cleaned)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON format from AI response")

        logger.debug("=== /generate-meal endpoint called ===")
        logger.debug(f"Raw GPT output:\n{raw_output}")

        # ✅ Strip Markdown code block (```json ... ```) if present
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        meal_plan = json.loads(cleaned)

        # ✅ Convert to day dictionary if it's a list of dicts
        # if isinstance(meal_plan, list):
        #     meal_plan = convert_list_to_day_dict(meal_plan)

        # ✅ Apply compliance checking if healthConditions exist
        # health_conditions = member.get("healthConditions", [])
        # if health_conditions:
        #     meal_plan = check_meal_compliance(meal_plan, health_conditions)

        # Save to DB
        now_utc = datetime.now(pytz.UTC)
        meal_doc = FamilyMealPlanModel(
            userId=user_id,
            plan=meal_plan,
            createdAt=now_utc,
            weekStart=week_start
        )
        await family_meal_collection.insert_one(meal_doc.model_dump())

        return meal_plan

    except json.JSONDecodeError as e:
        logger.error(f"Meal plan parsing error for member {member_id}: {e}")
        raise HTTPException(status_code=500, detail="Meal plan output could not be parsed as JSON.")

    except Exception as e:
        logger.exception(f"Unexpected error in meal generation for {member_id}")
        raise HTTPException(status_code=500, detail="Meal plan could not be generated")