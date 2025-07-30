from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from collections import defaultdict
import json
import re

from app.prompts.grocery_list import build_grocery_prompt
from app.prompts.recipe_prompt import build_recipe_prompt
from app.services.openai_client import generate_response_streaming
from app.utils.logger import get_logger
from app.db.mongo import grocery_collection, recipes_collection

router = APIRouter()
logger = get_logger(__name__)

class MealPlanInput(BaseModel):
    mealPlan: list = Field(..., alias="mealPlan")
    userId: Optional[str] = Field(None, alias="userId")
    weekStart: Optional[str] = Field(None, alias="weekStart")

    class Config:
        allow_population_by_field_name = True

def group_items_by_category(items: list[dict]) -> dict:
    grouped = defaultdict(list)
    for item in items:
        category = item.get("category", "Others")
        grouped[category].append(item)
    return dict(grouped)

@router.post("/generate-grocery", summary="Generate and save grocery list from meal plan")
async def generate_grocery_list(data: MealPlanInput):
    try:
        logger.info("Grocery list parsed successfully ✔")
        existing = await grocery_collection.find_one({
            "userId": data.userId,
            "week": data.weekStart
        })
        if existing:
            existing["_id"] = str(existing["_id"])
            logger.info(f"🔁 Returning existing grocery list for userId={data.userId}, week={data.weekStart}")
            return existing

        # ✅ Use task_type "grocery_plan"
        prompt = build_grocery_prompt(data.mealPlan)
        raw_output = ""
        async for chunk in generate_response_streaming(prompt, task_type="grocery_plan"):  # ✅
            raw_output += chunk

        logger.debug(f"[Grocery GPT Output] {raw_output}")
        if not raw_output.strip():
            raise HTTPException(status_code=502, detail="GPT returned an empty grocery list.")
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        parsed_json = json.loads(cleaned)
        
        grocery_items = parsed_json.get("items", [])
        logger.info("✅ Grocery list parsed successfully")
        categorized_items = group_items_by_category(grocery_items)

        grocery_doc = {
            "userId": data.userId,
            "week": data.weekStart,
            "itemsFlat": grocery_items,
            "itemsGrouped": categorized_items,
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

class RecipeRequest(BaseModel):
    mealName: str
    mealType: Optional[str] = None

@router.post("/get-recipe", summary="Fetch or generate detailed recipe by name and type")
async def get_recipe(payload: RecipeRequest):
    try:
        meal_name = payload.mealName.strip().lower()
        meal_type = payload.mealType.strip().lower() if payload.mealType else None

        query = {"name": meal_name}
        if meal_type:
            query["mealType"] = meal_type

        existing = await recipes_collection.find_one(query)
        if existing:
            existing["_id"] = str(existing["_id"])
            logger.info(f"🔁 Returning existing recipe for: {meal_name} ({meal_type})")
            return [existing]

        logger.info(f"🧠 Generating new recipe for: {meal_name} ({meal_type})")
        prompt = build_recipe_prompt(meal_name)

        # ✅ Use task_type "recipe_generation"
        raw_output = ""
        async for chunk in generate_response_streaming(prompt, task_type="recipe_generation"):  # ✅
            raw_output += chunk

        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        recipe_data = json.loads(cleaned)

        recipe_data["name"] = meal_name
        if meal_type:
            recipe_data["mealType"] = meal_type
        recipe_data["createdAt"] = datetime.utcnow()

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