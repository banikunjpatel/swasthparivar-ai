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
  - price (estimated based on average Indian market rates, e.g., ₹40 per kg of tomato)

🧠 Combine duplicate ingredients and estimate total quantities practically, using Indian kitchen measurements.
Estimate **realistic prices based on Indian grocery markets (2025)**.
Avoid repeating items.

🧠 Use common Indian prices:
- Vegetables: ₹30–₹80 per kg
- Grains & Pulses: ₹60–₹120 per kg
- Spices & Herbs: ₹500–₹1000 per kg (use small practical units like 10g)
- Dairy: ₹50–₹80 per litre
- Fruits: ₹40–₹100 per kg
- Misc: Oil ~₹150/ltr, Salt ~₹20/kg, etc.

🧾 Meal Plan:
{meal_plan_text}

📦 Respond ONLY with valid JSON in the following format:

{{
  "items": [
    {{ "name": "Tomato", "quantity": "4 medium", "category": "Vegetables", "price": "₹20" }},
    {{ "name": "Rice", "quantity": "500g", "category": "Grains & Pulses", "price": "₹40" }},
    {{ "name": "Turmeric", "quantity": "10g",  "category": "Spices & Herbs", "price": "₹10" }},
    {{ "name": "Curd", "quantity": "500ml","category": "Dairy & Substitutes", "price": "₹30" }},
    {{ "name": "Banana", "quantity": "6", "category": "Fruits", "price": "₹60" }},
    {{ "name": "Oil", "quantity": "200ml", "category": "Miscellaneous", "price": "₹80" }}
  ]
}}

⚠️ Do not include explanations, greetings, or markdown. Return ONLY the JSON object above.
""".strip()

    return prompt