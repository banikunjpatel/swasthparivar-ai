from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
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
    mealPlan: list = Field(..., alias="mealPlan")
    userId: Optional[str] = Field(None, alias="userId")
    weekStart: Optional[str] = Field(None, alias="weekStart")
 
    class Config:
        allow_population_by_field_name = True
 
# ✅ POST: Generate & save grocery list
@router.post("/generate-grocery", summary="Generate and save grocery list from meal plan")
async def generate_grocery_list(data: MealPlanInput):
    try:
        logger.info("Grocery list parsed successfully ✔")
        
        # 🔍 Check if grocery list already exists for user and week
        existing = await grocery_collection.find_one({
            "userId": data.userId,
            "week": data.weekStart
        })
        if existing:
            existing["_id"] = str(existing["_id"])
            logger.info(f"🔁 Returning existing grocery list for userId={data.userId}, week={data.weekStart}")
            return existing
        
        # call GPT to generate grocery list
        prompt = build_grocery_prompt(data.mealPlan)
        raw_output = call_gpt(prompt)
 
        logger.debug(f"[Grocery GPT Output] {raw_output}")
        if not raw_output.strip():
            raise HTTPException(status_code=502, detail="GPT returned an empty grocery list.")
        cleaned_output = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        parsed = json.loads(cleaned_output)
        grocery_items = parsed.get("items", [])
        logger.info("✅ Grocery list parsed successfully")
 
        grocery_doc = {
            "userId": data.userId,
            "week": data.weekStart,
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
    
class RecipeRequest(BaseModel):
    mealName: str
    mealType: Optional[str] = None
    
# ✅ POST: Fetch or generate recipe
@router.post("/get-recipe", summary="Fetch or generate detailed recipe by name and type")
async def get_recipe(payload: RecipeRequest):
    try:
        meal_name = payload.mealName.strip().lower()
        meal_type = payload.mealType.strip().lower() if payload.mealType else None

        # 🔍 Check if recipe already exists
        query = {"name": meal_name}
        if meal_type:
            query["mealType"] = meal_type

        existing = await recipes_collection.find_one(query)
        if existing:
            existing["_id"] = str(existing["_id"])
            logger.info(f"🔁 Returning existing recipe for: {meal_name} ({meal_type})")
            return [existing]

        logger.info(f"🧠 Generating new recipe for: {meal_name} ({meal_type})")

        # 🧠 Build GPT prompt and call
        prompt = build_recipe_prompt(meal_name)
        raw_output = call_gpt(prompt)

        # 🧼 Clean GPT output and parse JSON
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_output.strip(), flags=re.MULTILINE).strip()
        recipe_data = json.loads(cleaned)

        # ✅ Save to MongoDB
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