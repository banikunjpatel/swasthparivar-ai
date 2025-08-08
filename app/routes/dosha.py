import json
import re
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
        max_tokens=100
    )

    # dosha_result = response.choices[0].message.content.strip().lower()
    response_text = response.choices[0].message.content.strip()

    # Remove markdown code block if present
    cleaned = re.sub(r'^```(?:json)?\n?|\n?```$', '', response_text.strip(), flags=re.IGNORECASE)

    try:
        dosha_result = json.loads(cleaned)
        print("Parsed Dosha Result:", dosha_result)
        return dosha_result 
    except json.JSONDecodeError as e:
        print("❌ Failed to parse GPT response:", cleaned)
        raise e