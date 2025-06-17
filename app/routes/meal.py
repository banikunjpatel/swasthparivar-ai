from fastapi import APIRouter
from app.prompts.meal_plan import build_meal_plan_prompt
from app.services.openai_client import call_gpt
from app.models.user_profile import UserProfile

router = APIRouter()

@router.post("/generate-meal")
def generate_meal(user: UserProfile):
    prompt = build_meal_plan_prompt(user.dict())
    raw_output = call_gpt(prompt)  # wraps openai.ChatCompletion.create
    try:
        return json.loads(raw_output)
    except:
        return {"error": "Could not parse meal plan response."}
