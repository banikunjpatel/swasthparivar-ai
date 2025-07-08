from typing import Optional

def build_meal_plan_prompt(user: dict, previous_plan: Optional[dict] = None) -> str:
    import json
    from app.utils.compliance import MEAL_COMPLIANCE_RULES

    health_conditions = user.get("healthConditions", [])
    allergies = user.get("allergies", [])
    preferences = user.get("dietaryPreferences", [])
    calorie_goal = user.get("calorieGoal", "unspecified")

    health_notes = ""
    restricted_ingredients = set()

    if health_conditions:
        health_notes += "User has the following health conditions:\n"
        for condition in health_conditions:
            health_notes += f"- {condition}\n"
            restricted_ingredients.update(MEAL_COMPLIANCE_RULES.get(condition.lower(), []))

    if allergies:
        health_notes += f"User is allergic to: {', '.join(allergies)}.\n"
        restricted_ingredients.update(allergies)

    if restricted_ingredients:
        avoid_text = ", ".join(sorted(restricted_ingredients))
        health_notes += f"\n❌ Avoid these ingredients: {avoid_text}\n"

    prompt = f"""
You are an expert Indian Ayurvedic dietician.

Generate a personalized 7-day Indian meal plan for a person with:
- Name: {user.get("fullName", "Not specified")}
- Prakriti: {user.get("prakriti", "Not specified")}
- Dietary preferences: {", ".join(preferences) if preferences else "Not specified"}
- Calorie goal: {calorie_goal} kcal/day

{health_notes}

Each day must include:
- Breakfast, Lunch, and Dinner
- Meal names only (no recipes)
- Meals suitable for the person's prakriti and health
- Strictly avoid any ingredients listed above

Return response in JSON format like:
[
  {{
    "day": "Monday",
    "breakfast": "Idli with coconut chutney",
    "lunch": "Vegetable khichdi",
    "dinner": "Tofu curry with roti"
  }},
  ...
]
Do not use Markdown. No extra commentary.
"""

    if previous_plan:
        prompt += f"""

Here is last week's meal plan. ⚠️ Please avoid repeating the same dishes:

{json.dumps(previous_plan, indent=2)}
"""

    return prompt.strip()