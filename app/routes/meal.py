import json
import re
from fastapi import APIRouter, HTTPException
from app.prompts.meal_plan import build_meal_plan_prompt
from app.services.openai_client import call_gpt
from app.utils.logger import get_logger
from app.utils.formatting import title_case_meals
from app.models.user_profile import UserProfile

logger = get_logger(__name__)
router = APIRouter()

@router.post("/generate-meal-plan")
def generate_meal(user: UserProfile):
    logger.info(f"Generating meal plan for {user.fullName}")
    prompt = build_meal_plan_prompt(user.dict())
    raw_output = call_gpt(prompt)
    print("=== Endpoint called ===")
    print("Raw GPT output:", raw_output)
    try:
        # Extract JSON between triple backticks if present
        match = re.search(r"```json(.*?)```", raw_output, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
        else:
            # Fallback: try to find the first {...} block
            match = re.search(r"(\{.*\})", raw_output, re.DOTALL)
            json_str = match.group(1).strip() if match else raw_output

        print("Extracted JSON string:", json_str)
        return title_case_meals(json.loads(json_str))
    except Exception as e:
        logger.error(f"Meal plan parsing error: {e}")
        raise HTTPException(status_code=500, detail="Meal plan output could not be parsed as JSON.")