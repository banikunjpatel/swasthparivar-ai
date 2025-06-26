import json

def build_grocery_prompt(meal_plan_json: dict) -> str:
    """
    Build a prompt for GPT to generate a structured weekly grocery list from a 7-day meal plan.
    """
    meal_plan_text = json.dumps(meal_plan_json, indent=2)

    prompt = f"""
You are a nutrition assistant specializing in Indian wellness and Ayurveda.

Your task is to extract a weekly grocery list from the following 7-day meal plan designed for 1 person.

✅ Instructions:
- Go through all meals and extract every ingredient mentioned.
- For each ingredient, provide:
  - name
  - total quantity for the week
  - category (one of: Vegetables, Grains & Pulses, Spices & Herbs, Dairy & Substitutes, Fruits, Miscellaneous)
- Combine duplicates and estimate totals (e.g., "500g rice", "3 tomatoes", "1 bunch coriander").
- Use practical Indian kitchen measurements.

🧾 Meal Plan:
{meal_plan_text}

📦 Respond ONLY with valid JSON in this format:

{{
  "items": [
    {{"name": "Tomato", "quantity": "4 medium", "category": "Vegetables"}},
    {{"name": "Rice", "quantity": "500g", "category": "Grains & Pulses"}},
    {{"name": "Turmeric", "quantity": "10g", "category": "Spices & Herbs"}},
    {{"name": "Curd", "quantity": "500ml", "category": "Dairy & Substitutes"}},
    {{"name": "Banana", "quantity": "6", "category": "Fruits"}},
    {{"name": "Oil", "quantity": "200ml", "category": "Miscellaneous"}}
  ]
}}

⚠️ Do not include any explanation, greeting, or markdown. Return ONLY the JSON object above.
""".strip()


    return prompt