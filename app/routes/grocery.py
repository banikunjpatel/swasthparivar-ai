from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import json
import re

from app.prompts.grocery_list import build_grocery_prompt
from app.prompts.recipe_prompt import build_recipe_prompt
from app.services.openai_client import call_gpt
from app.utils.logger import get_logger
from app.db.mongo import grocery_collection, recipes_collection

router = APIRouter()
logger = get_logger(__name__)

# 🧾 Model for grocery generation input
class MealPlanInput(BaseModel):
    plan: list
    userId: Optional[str] = None
    week: Optional[str] = None

# ✅ POST: Generate & save grocery list
@router.post("/generate-grocery", summary="Generate and save grocery list from meal plan")
async def generate_grocery_list(data: MealPlanInput):
    try:
        logger.info("🛒 Generating grocery list from submitted meal plan...")

        prompt = build_grocery_prompt(data.plan)
        raw_output = call_gpt(prompt)

        logger.debug(f"[Grocery GPT Output] {raw_output}")
        if not raw_output.strip():
            raise HTTPException(status_code=502, detail="GPT returned an empty grocery list.")

        grocery_items = json.loads(raw_output)
        logger.info("✅ Grocery list parsed successfully")

        grocery_doc = {
            "userId": data.userId,
            "memberId": data.memberId,
            "mealPlanVersion": data.mealPlanVersion,
            "week": data.week,
            "items": grocery_items,
            "createdAt": datetime.utcnow()
        }

        result = await grocery_collection.insert_one(grocery_doc)
        grocery_doc["_id"] = str(result.inserted_id)

        logger.info(f"📦 Grocery list saved with ID: {result.inserted_id}")
        return grocery_doc

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail="Invalid JSON response from GPT")

    except Exception as e:
        logger.exception("❌ Grocery generation failed")
        raise HTTPException(status_code=500, detail="Grocery list generation failed")


# ✅ GET: Fetch or generate recipe by name
@router.get("/get-recipe", summary="Fetch or generate detailed recipe by name")
async def get_recipe(name: str = Query(..., description="Recipe name to generate or fetch")):
    try:
        recipe_name = name.strip().lower()

        # 🔍 Check if recipe exists in MongoDB
        existing = await recipes_collection.find_one({"name": recipe_name})
        if existing:
            existing["_id"] = str(existing["_id"])
            return [existing]  # ✅ Return as list for frontend

        logger.info(f"🧠 Generating new recipe for: {recipe_name}")

        # 🧠 Build GPT prompt and call
        prompt = build_recipe_prompt(recipe_name)
        raw_output = call_gpt(prompt)

        # 🧼 Clean GPT output and parse JSON
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        recipe_data = json.loads(cleaned)

        # ✅ Normalize and save
        recipe_data["name"] = recipe_name  # use lower-case name for lookup
        result = await recipes_collection.insert_one(recipe_data)
        recipe_data["_id"] = str(result.inserted_id)

        logger.info(f"📦 New recipe saved with ID: {result.inserted_id}")
        return [recipe_data]

    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse recipe JSON: {e}")
        raise HTTPException(status_code=500, detail="Invalid JSON from GPT")

    except Exception as e:
        logger.exception("❌ Recipe generation failed")
        raise HTTPException(status_code=500, detail="Recipe generation failed")