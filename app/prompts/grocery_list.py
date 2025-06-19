import json

def build_grocery_prompt(meal_plan_json: dict) -> str:
    """
    Build a prompt for GPT to generate a structured weekly grocery list from a 7-day meal plan.
    """
    meal_plan_text = json.dumps(meal_plan_json, indent=2)

    prompt = f"""
You are a nutrition assistant specializing in Indian wellness and Ayurveda.

Your task is to extract a weekly grocery list from the following 7-day meal plan designed for 1 person. 
Each day includes Breakfast, Lunch, Snack, and Dinner.

✅ Instructions:
- Go through all meals and extract every ingredient mentioned.
- Group items into the following categories:
  - Vegetables
  - Grains & Pulses
  - Spices & Herbs
  - Dairy & Substitutes
  - Fruits
  - Miscellaneous
- Combine similar ingredients and give an approximate total quantity for the week (e.g., "3 tomatoes", "500g rice", "1 bunch coriander").
- Be concise, practical, and use Indian kitchen measurements.

🧾 Meal Plan:
{meal_plan_text}

📦 Respond ONLY with valid JSON in this format:

{{
  "Vegetables": {{
    "Tomato": "4 medium",
    "Spinach": "1 bunch"
  }},
  "Grains & Pulses": {{
    "Rice": "500g",
    "Moong Dal": "200g"
  }},
  "Spices & Herbs": {{
    "Turmeric": "10g"
  }},
  "Dairy & Substitutes": {{
    "Curd": "500ml"
  }},
  "Fruits": {{
    "Banana": "6"
  }},
  "Miscellaneous": {{
    "Oil": "200ml"
  }}
}}

⚠️ Do not include any explanation, greeting, or markdown. Return ONLY the JSON object above.
""".strip()

    return prompt
