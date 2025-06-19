from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.modals.user_profile import UserProfile
from app.services.meal_plan_service import generate_meal_plan
from app.logic.combine_family_plans import merge_family_meal_plans
from app.utils.validators import validate_user_profile
from app.utils.formatting import title_case_meals

router = APIRouter()

class FamilyMealRequest(BaseModel):
    members: List[UserProfile]

@router.post("/generate-family-meal", summary="Generate a combined family meal plan")
def generate_family_meal(data: FamilyMealRequest):
    try:
        meal_plans = []

        for member in data.members:
            profile = member.dict()
            validate_user_profile(profile)  # 🛡️ ensure data is safe
            individual_plan = generate_meal_plan(profile)  # 🔄 GPT-based generation
            meal_plans.append(individual_plan)

        # 🧠 Merge all individual meal plans
        family_meal = merge_family_meal_plans([m.dict() for m in data.members], meal_plans)

        # 🧼 Flatten lists
        for day in family_meal:
            for meal_type in family_meal[day]:
                if isinstance(family_meal[day][meal_type], list):
                    family_meal[day][meal_type] = ", ".join(family_meal[day][meal_type])
                    
        print("🔎 Merged family meal plan keys:", family_meal.keys())
        print("🔎 Sample day:", family_meal['Day 1'])
        print("🔎 Type of Breakfast:", type(family_meal['Day 1']['Breakfast']))

        # ✨ Format meal text
        formatted_meal = title_case_meals(family_meal)
        return formatted_meal

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Family meal generation failed: {str(e)}")
