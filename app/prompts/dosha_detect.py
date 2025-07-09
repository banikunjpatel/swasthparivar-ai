import json

def build_dosha_prompt(quiz_answers: list[str]) -> list[dict]:
    quiz_json = {
        f"question_{i+1}": ans for i, ans in enumerate(quiz_answers)
    }

    return [
       {
        "role": "system",
        "content": (
            "You are an Ayurveda expert. Based ONLY on the user's quiz answers in JSON format, "
            "respond with a complete raw JSON object like this:\n"
            '{\n  "prakriti": "pitta",\n  "doshaStats": { "vata": 30, "pitta": 50, "kapha": 20 }\n}\n'
            "Do not include code blocks or explanations. Just return plain JSON with no markdown or extra characters."
        )
        },
        {
            "role": "user",
            "content": f"{quiz_json}"
        }
    ]