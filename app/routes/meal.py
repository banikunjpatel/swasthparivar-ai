import json
import re
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.db.mongo import members_collection, family_meal_collection
from app.prompts.meal_plan import build_meal_plan_prompt
from app.services.openai_client import call_gpt
from app.utils.logger import get_logger
from app.utils.formatting import title_case_meals, convert_list_to_day_dict
from app.utils.compliance import check_meal_compliance

logger = get_logger(__name__)
router = APIRouter()

# ✅ Generate meal plan using stored member profile
@router.get("/generate-meal/{member_id}", summary="Generate meal plan for one member by ID")
async def generate_meal(member_id: str):
    try:
        # ✅ Retrieve member profile from MongoDB
        member = await members_collection.find_one({"_id": ObjectId(member_id)})
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        logger.info(f"Generating meal plan for member: {member.get('fullName')}")

        # Clean Mongo-specific fields
        member.pop("_id", None)
        member.pop("createdAt", None)
        member.pop("updatedAt", None)
        
        user_id = member.get("userId")  # get the family userId

        # Find most recent family plan
        last_plan_doc = await family_meal_collection.find_one(
            {"userId": user_id},
            sort=[("weekStart", -1)]
        )

        previous_plan = last_plan_doc["plan"] if last_plan_doc else None

        # 🧠 Build prompt and call GPT
        prompt = build_meal_plan_prompt(member, previous_plan=previous_plan)
        raw_output = call_gpt(prompt)

        logger.debug("=== /generate-meal endpoint called ===")
        logger.debug(f"Raw GPT output:\n{raw_output}")

        # ✅ Strip Markdown code block (```json ... ```) if present
        cleaned = raw_output.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?|```$", "", cleaned.strip(), flags=re.MULTILINE).strip()

        parsed = json.loads(cleaned)
        meal_plan = title_case_meals(parsed)

        # ✅ Convert to day dictionary if it's a list of dicts
        if isinstance(meal_plan, list):
            meal_plan = convert_list_to_day_dict(meal_plan)

        # ✅ Apply compliance checking if healthConditions exist
        health_conditions = member.get("healthConditions", [])
        if health_conditions:
            meal_plan = check_meal_compliance(meal_plan, health_conditions)

        return meal_plan

    except json.JSONDecodeError as e:
        logger.error(f"Meal plan parsing error for member {member_id}: {e}")
        raise HTTPException(status_code=500, detail="Meal plan output could not be parsed as JSON.")

    except Exception as e:
        logger.exception(f"Unexpected error in meal generation for {member_id}")
        raise HTTPException(status_code=500, detail="Meal plan could not be generated")