import json
from app.services.openai_client import generate_response_streaming

async def get_dosha_type(quiz_answers: list[str]) -> str:
    quiz_json = json.dumps({f"question_{i+1}": ans for i, ans in enumerate(quiz_answers)}, indent=2)

    prompt = f"""
You are an Ayurveda expert. Based ONLY on the user's quiz answers in JSON format, 
reply with the dominant dosha type (Vata, Pitta, or Kapha) as a single word in lowercase.
Do not include any greeting, explanation, or extra text. Only output the dosha type.

Quiz answers (JSON): {quiz_json}
""".strip()

    # 🔁 Collect streamed chunks
    output = ""
    async for chunk in generate_response_streaming(prompt, task_type="dosha_type"):
        output += chunk

    return output.strip().lower()