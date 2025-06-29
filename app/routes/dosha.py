from openai import OpenAI
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.prompts.dosha_detect import build_dosha_prompt

client = OpenAI()
router = APIRouter()

class DoshaQuiz(BaseModel):
    answers: List[str]

@router.post("/detect-dosha")
def detect_dosha(quiz: DoshaQuiz):
    messages = build_dosha_prompt(quiz.answers)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.3,
        max_tokens=20
    )

    dosha_result = response.choices[0].message.content.strip().lower()
    return {"dosha": dosha_result}