import re
import json
from fastapi import HTTPException
from app.prompts.meal_plan import build_meal_plan_prompt
from app.services.openai_client import call_gpt
from app.utils.timing import timed

@timed
def generate_meal_plan(user_profile: dict) -> dict:
    prompt = build_meal_plan_prompt(user_profile)
    raw_response = call_gpt(prompt)

    print("🧽 Raw GPT output:", raw_response)

    # ✅ Remove Markdown code block if present
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw_response.strip(), flags=re.MULTILINE).strip()

    print("🧽 Cleaned GPT Response:\n", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        print("⚠️ FINAL PARSE FAIL:\n", cleaned)
        raise HTTPException(status_code=400, detail="Meal plan output could not be parsed as JSON.")