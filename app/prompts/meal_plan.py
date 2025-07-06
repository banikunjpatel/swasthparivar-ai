from app.utils.compliance import MEAL_COMPLIANCE_RULES
import json

def build_meal_plan_prompt(user, previous_plan: dict = None):
    health_conditions = user.get("health_conditions", [])
    allergies = user.get("allergies", [])
    preferences = user.get("preferences", [])
    calorie_goal = user.get("calorie_goal", "unspecified")

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
        previous_json = json.dumps(previous_plan, indent=2)
        prompt += f"""

Here is last week's meal plan. ⚠️ Please avoid repeating the same dishes in the new plan:

{previous_json}
"""

    return prompt.strip()