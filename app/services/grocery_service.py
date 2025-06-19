from app.prompts.grocery_list import build_grocery_prompt
from app.services.openai_client import call_gpt
from app.utils.timing import timed
import json
import re

@timed
def generate_grocery_list(meal_plan: dict) -> dict:
    prompt = build_grocery_prompt(meal_plan)

    for attempt in range(3):  # retry up to 3 times
        response = call_gpt(prompt)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"⚠️ Attempt {attempt+1} failed to parse JSON.")
            print("🔴 Raw Response:", response)

    # Final failure
    raise ValueError("Grocery list output could not be parsed as JSON after 3 attempts.")