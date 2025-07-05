import json
from typing import Optional

def build_family_meal_prompt(family: list, previous_plan: Optional[dict] = None) -> str:
    prompt = """
You are an expert Indian Ayurvedic nutritionist and meal planner.

Generate a **shared 7-day family meal plan** with **Breakfast, Lunch, and Dinner** for each day.

Each meal must have:
- A single common **base dish** for all (if suitable)
- **Customizations** for each family member based on:
  - Age
  - Gender (if relevant)
  - Prakriti type
  - Health conditions (e.g., diabetes, thyroid, etc.)
  - Dietary preferences (e.g., vegetarian)
  - Allergies
  - State-wise regional preferences (e.g., South Indian families prefer dosa, idli, etc.)

🎯 Key guidelines:
- Avoid restricted ingredients based on health and allergies
- Follow Ayurvedic principles for balancing prakriti
- Reflect regional food culture (state-wise) when choosing base dishes
- Avoid conflicts — use flexible meals with per-person customizations
- Mention specific modifications (e.g., "with fenugreek chutney", "extra ghee", "no sugar", etc.)
- Prioritize diversity — avoid repeating meals from recent weeks

🧾 Format the output in this strict JSON format:

{
  "Monday": {
    "breakfast": {
      "base": "Moong dal chilla",
      "customizations": {
        "Father": "with fenugreek chutney (for diabetes)",
        "Mother": "with mint chutney (Kapha pacifying)",
        "Child": "with ghee (Vata balancing, for energy)"
      }
    },
    "lunch": { ... },
    "dinner": { ... }
  },
  ...
}

❗ Do not include Markdown. Do not return comments outside the JSON. Do not repeat meals across days.

"""

    if previous_plan:
        prompt += "\nHere is the family's previous week's meal plan. Please avoid repeating these meals:\n"
        prompt += json.dumps(previous_plan, indent=2)
        prompt += "\n"

    prompt += "Now, here is the family profile:\n"

    for member in family:
        prompt += f"""
Name: {member.get("fullName")}
Age: {member.get("age")}
Gender: {member.get("gender")}
Prakriti: {member.get("prakriti")}
Health Conditions: {", ".join(member.get("healthConditions", []))}
Allergies: {", ".join(member.get("allergies", []))}
Dietary Preferences: {member.get("dietaryPreferences", "Not specified")}
State: {member.get("state", "Not specified")}
"""

    return prompt.strip()