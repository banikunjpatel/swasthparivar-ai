import json
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.prompts.dosha_detect import build_dosha_prompt
from app.services.openai_client import generate_response_streaming

router = APIRouter()

class DoshaQuiz(BaseModel):
    answers: List[str]

@router.post("/detect-dosha")
async def detect_dosha(quiz: DoshaQuiz):
    messages = build_dosha_prompt(quiz.answers)

    try:
        # 🧠 Use streaming GPT with task_type="simple"
        response_text = await generate_response_streaming(messages, task_type="simple")

        # 🧹 Clean up markdown formatting
        cleaned = re.sub(r'^```(?:json)?\n?|\n?```$', '', response_text.strip(), flags=re.IGNORECASE)

        # 🧾 Parse the result
        dosha_result = json.loads(cleaned)
        return dosha_result

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse GPT response.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Dosha detection failed.")