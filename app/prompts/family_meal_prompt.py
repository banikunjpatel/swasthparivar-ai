import json
from typing import Optional

def build_family_meal_prompt(family: list, previous_plan: Optional[dict] = None) -> str:
    prompt = """
You are an expert Indian Ayurvedic nutritionist and meal planner.

Generate a **shared 7-day family meal plan** with **Breakfast, Lunch, and Dinner** for each day.

Each meal must have:
- A single common **base dish** for all members (if suitable)
- **Customizations** for each family member that are based on BOTH:
  1. Their personal profile (prakriti, health conditions, age, preferences, allergies)
  2. The specific base dish (e.g., Upma gets chutney, Khichdi gets ghee, etc.)

⚠️ Avoid applying the same customization across all meals or dishes.

🎯 Key guidelines:
- Avoid restricted ingredients based on health and allergies
- Follow Ayurvedic principles for prakriti balance
- Reflect regional food culture (state-wise preferences)
- Ensure diversity of base dishes across the week (no repeats)
- Ensure **customizations vary by meal and dish**
- Customizations should make Ayurvedic and practical sense (e.g., "extra ginger in lentils for Vata")

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
    "lunch": {
      "base": "Vegetable pulao",
      "customizations": {
        "Father": "with brown rice (low glycemic)",
        "Mother": "with steamed vegetables",
        "Child": "with extra peas and carrots"
      }
    },
    "dinner": {
      "base": "Toor dal with roti",
      "customizations": {
        "Father": "with extra turmeric (for inflammation)",
        "Mother": "with ajwain (Kapha aiding digestion)",
        "Child": "with ghee and soft rice"
      }
    }
  },
  ...
}

❗ Output ONLY JSON. No Markdown. No extra explanation.
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