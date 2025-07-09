import json
from app.services.openai_client import call_gpt

def get_dosha_type(quiz_answers: list[str]) -> str:
    quiz_json = json.dumps({f"question_{i+1}": ans for i, ans in enumerate(quiz_answers)}, indent=2)

    prompt = f"""
You are an Ayurveda expert. Based ONLY on the user's quiz answers in JSON format, 
reply with the dominant dosha type (Vata, Pitta, or Kapha) as a single word in lowercase.
Do not include any greeting, explanation, or extra text. Only output the dosha type.

Quiz answers (JSON): {quiz_json}
""".strip()

    return call_gpt(prompt, model="gpt-3.5-turbo", max_tokens=20, temperature=0.2)