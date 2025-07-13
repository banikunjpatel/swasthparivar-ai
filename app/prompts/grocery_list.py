import json

def build_grocery_prompt(meal_plan_json: dict) -> str:
    meal_plan_text = json.dumps(meal_plan_json, separators=(",", ":"))  # compact JSON

    prompt = f"""
You are an expert in Ayurveda and Indian nutrition. Your task is to extract a **weekly grocery list** from this 7-day meal plan.

🔧 For each ingredient found in any meal (breakfast/lunch/dinner/customization), return:
- name
- total quantity (practical for Indian kitchens)
- category: Vegetables, Grains & Pulses, Spices & Herbs, Dairy & Substitutes, Fruits, Miscellaneous
- estimated price (₹, based on 2025 Indian grocery market)

🧠 Combine duplicates, and avoid listing any ingredient twice. Estimate quantity realistically.

🧾 Meal Plan JSON:
{meal_plan_text}

📦 Output ONLY valid JSON like:
{{
  "items": [
    {{ "name": "Tomato", "quantity": "4 medium", "category": "Vegetables", "price": "₹20" }},
    {{ "name": "Rice", "quantity": "500g", "category": "Grains & Pulses", "price": "₹40" }},
    ...
  ]
}}
Do not return any text or explanations.
""".strip()

    return prompt