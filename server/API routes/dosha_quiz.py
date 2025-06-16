import json
from openai import OpenAI

quiz_answers = [
    "Large, solid build, gains weight easily",
    "Slow to start but lasts long — steady energy",
    "Slow digestion, often feels heavy after meals",
    "Soft, smooth, moist and cool",
    "Withdrawn or emotionally heavy",
    "Deep sleeper, loves long rest",
    "Dry and warm climates",
    "Calm, reserved, slow to open up",
    "I enjoy steady, repetitive routines"
]

quiz_answers_json = json.dumps({
    f"question_{i+1}": answer for i, answer in enumerate(quiz_answers)
}, indent=2)

client = OpenAI()

messages = [
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
        "content": f"Quiz answers (JSON): {quiz_answers_json}"
    }
]

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages
)

result = response.choices[0].message.content.strip()
print(result)