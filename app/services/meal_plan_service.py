import re
import json
from datetime import datetime
from fastapi import HTTPException
from app.prompts.meal_plan import build_meal_plan_prompt
from app.services.openai_client import call_gpt
from app.utils.timing import timed
from app.utils.logger import get_logger

logger = get_logger(__name__)

@timed
def generate_meal_plan(user_profile: dict) -> dict:
    prompt = build_meal_plan_prompt(user_profile)
    raw_response = call_gpt(prompt)

    logger.info(f"[MealPlan Request] User: {user_profile.get('name', 'anonymous')}")
    logger.debug(f"[MealPlan Prompt] {prompt}")
    logger.debug(f"[MealPlan Raw GPT Output] {raw_response}")

    # ✅ Remove Markdown fencing (```json ... ```)
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw_response.strip(), flags=re.MULTILINE).strip()
    logger.info(f"🧽 Cleaned GPT response:\n{cleaned}")

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("First JSON parse failed. Attempting fallback...")
        try:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
            else:
                raise ValueError("No JSON object found")
        except Exception as e:
            logger.error(f"Fallback JSON parsing failed: {e}")
            raise HTTPException(status_code=400, detail="Meal plan output could not be parsed as JSON.")

    return {
    "plan": parsed,
    "meta": {
        "version": "1.0",
        "source": "GPT-4",
        "parsed_at": datetime.now().isoformat()
    }
}