import json

def build_dosha_prompt(quiz_answers: list[str]) -> list[dict]:
    """
    Build a GPT-compatible message format to determine dominant Ayurvedic dosha from quiz answers.
    """
    # Convert list of answers into a JSON object (keyed for clarity)
    quiz_json = json.dumps({
        f"question_{i+1}": ans for i, ans in enumerate(quiz_answers)
    }, indent=2)

    return [
        {
            "role": "system",
            "content": (
                "You are an Ayurveda expert. Based ONLY on the user's quiz answers in JSON format, "
                "reply with the dominant dosha type (Vata, Pitta, or Kapha) as a single word in lowercase. "
                "Do not include any greeting, explanation, or extra text. Only output the dosha type."
            )
        },
        {
            "role": "user",
            "content": f"Quiz answers (JSON): {quiz_json}"
        }
    ]
