import json
import re
from app.services.openai_client import generate_response_streaming
from app.prompts.grocery_list import build_grocery_prompt

async def generate_grocery_items(meal_plan: list[dict]) -> list[dict]:
    prompt = build_grocery_prompt(meal_plan)

    # Collect streamed output
    raw_output = ""
    async for chunk in generate_response_streaming(prompt, task_type="grocery_list"):
        raw_output += chunk

    # Clean Markdown ```json formatting
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()

    try:
        parsed_json = json.loads(cleaned)
        return parsed_json.get("items", [])
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse grocery list JSON: {e}")