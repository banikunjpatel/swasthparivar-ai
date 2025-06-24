from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi.responses import JSONResponse

from app.models.user_profile import UserProfile
from app.services.meal_plan_service import generate_meal_plan
from app.logic.combine_family_plans import combine_family_plans
from app.utils.validators import validate_user_profile
from app.utils.formatting import title_case_meals
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


# 🧾 Request schema
class FamilyMealRequest(BaseModel):
    members: List[UserProfile]


# ✅ POST route to generate family meal from user input
@router.post("/generate-family-meal", summary="Generate a combined family meal plan")
def generate_family_meal(data: FamilyMealRequest):
    try:
        meal_plans = {}
        for member in data.members:
            profile = member.dict()
            validate_user_profile(profile)
            individual_plan = generate_meal_plan(profile)
            meal_plans[member.fullName] = individual_plan

        # 🧠 Merge the individual meal plans using smart logic
        combined = combine_family_plans(meal_plans)

        logger.info("✅ Family meal plan generated successfully.")
        return combined

    except ValueError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.exception("❌ Unexpected error during family meal generation.")
        raise HTTPException(status_code=500, detail="Family meal generation failed")


# ✅ GET route to export a sample shared family plan (SP-203.6)
@router.get("/export-family-meal", summary="Export a sample family meal plan")
def export_sample_family_plan():
    try:
        # 🔁 Hardcoded sample input (can be moved to file or replaced with POST input)
        sample_input = {
            "Anita": {
                "Monday": {
                    "breakfast": "Poha",
                    "lunch": "Paneer Curry"
                }
            },
            "Ramesh": {
                "Monday": {
                    "breakfast": "Poha",
                    "lunch": "Chicken Curry"
                }
            },
            "Amit": {
                "Monday": {
                    "breakfast": "Upma",
                    "lunch": "Dal Fry"
                }
            }
        }

        result = combine_family_plans(sample_input)
        return JSONResponse(content=result)

    except Exception as e:
        logger.exception("❌ Failed to export sample family plan.")
        raise HTTPException(status_code=500, detail="Could not export family meal plan")