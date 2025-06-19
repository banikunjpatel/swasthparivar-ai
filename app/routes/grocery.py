from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.prompts.grocery_list import build_grocery_prompt
from app.services.openai_client import call_gpt
import json

router = APIRouter()

class MealPlanInput(BaseModel):
    plan: dict

@router.post("/generate-grocery")
def generate_grocery_list(data: MealPlanInput):
    try:
        prompt = build_grocery_prompt(data.plan)
        raw_output = call_gpt(prompt)
        grocery_list = json.loads(raw_output)
        return grocery_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grocery list generation failed: {str(e)}")