import json

def build_grocery_prompt(meal_plan_json: dict) -> str:
    meal_plan_text = json.dumps(meal_plan_json, indent=2)

    prompt = f"""
You are a nutrition assistant specializing in Indian wellness and Ayurveda.

Your task is to extract a **weekly grocery list** from the following 7-day meal plan designed for a family or group.

✅ Instructions:
- Go through **all meals** (breakfast, lunch, dinner) for each day
- Extract every **distinct ingredient** mentioned in base meals and customizations
- For each ingredient, provide:
  - name (e.g., "Tomato")
  - total quantity for the week (estimated)
  - unit (e.g., "g", "ml", "cup", "piece", etc.)
  - category (one of: Vegetables, Grains & Pulses, Spices & Herbs, Dairy & Substitutes, Fruits, Miscellaneous)

🧠 Combine duplicate ingredients and estimate total quantities practically, using Indian kitchen measurements.
Avoid repeating items.

🧾 Meal Plan:
{meal_plan_text}

📦 Respond ONLY with valid JSON in the following format:

{{
  "items": [
    {{ "name": "Tomato", "quantity": "4 medium", "unit": "piece", "category": "Vegetables" }},
    {{ "name": "Rice", "quantity": "500g", "unit": "g", "category": "Grains & Pulses" }},
    {{ "name": "Turmeric", "quantity": "10g", "unit": "g", "category": "Spices & Herbs" }},
    {{ "name": "Curd", "quantity": "500ml", "unit": "ml", "category": "Dairy & Substitutes" }},
    {{ "name": "Banana", "quantity": "6", "unit": "piece", "category": "Fruits" }},
    {{ "name": "Oil", "quantity": "200ml", "unit": "ml", "category": "Miscellaneous" }}
  ]
}}

⚠️ Do not include explanations, greetings, or markdown. Return ONLY the JSON object above.
""".strip()

    return prompt