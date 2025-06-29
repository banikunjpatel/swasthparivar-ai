from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.prompts.grocery_list import build_grocery_prompt
from app.services.openai_client import call_gpt
from app.utils.logger import get_logger
from app.db.mongo import grocery_collection
from datetime import datetime
from typing import Optional
import json

router = APIRouter()
logger = get_logger(__name__)

# 🧾 Input model for grocery generation with optional metadata
class MealPlanInput(BaseModel):
    plan: dict
    memberId: Optional[str] = None
    mealPlanVersion: Optional[int] = None
    week: Optional[str] = None  # optional: "2025-W27"

# ✅ POST endpoint to generate and save grocery list
@router.post("/generate-grocery", summary="Generate and save grocery list from meal plan")
async def generate_grocery_list(data: MealPlanInput):
    try:
        logger.info("🛒 Generating grocery list from submitted meal plan...")

        prompt = build_grocery_prompt(data.plan)
        raw_output = call_gpt(prompt)
        logger.debug(f"[Grocery Raw GPT Output] {raw_output}")
        
        if not raw_output.strip():
            logger.error("⚠️ GPT returned an empty grocery response")
            raise HTTPException(status_code=502, detail="GPT did not return a valid grocery list.")


        grocery_items = json.loads(raw_output)
        logger.info("✅ Grocery list parsed successfully")

        # 🧾 Compose document to store
        grocery_doc = {
            "memberId": data.memberId,
            "mealPlanVersion": data.mealPlanVersion,
            "week": data.week,
            "items": grocery_items,
            "createdAt": datetime.utcnow()
        }

        result = await grocery_collection.insert_one(grocery_doc)
        grocery_doc["_id"] = str(result.inserted_id)

        logger.info(f"📦 Grocery list saved to DB with ID: {result.inserted_id}")

        return grocery_doc

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail="Invalid response from AI")

    except Exception as e:
        logger.exception("❌ Grocery generation failed")
        raise HTTPException(status_code=500, detail="Grocery list generation failed")