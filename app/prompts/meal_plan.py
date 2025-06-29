def build_meal_plan_prompt(user):
    health_conditions = user.get("health_conditions", [])
    allergies = user.get("allergies", [])
    preferences = user.get("preferences", [])
    calorie_goal = user.get("calorie_goal", "unspecified")

    health_notes = ""
    if health_conditions:
        health_notes += "Consider the following health conditions:\n"
        for condition in health_conditions:
            health_notes += f"- {condition}: avoid known triggers\n"

    if allergies:
        health_notes += "User has the following allergies: " + ", ".join(allergies) + ".\n"

    prompt = f"""
You are an expert Indian Ayurvedic dietician.

Generate a personalized 7-day Indian meal plan for a person with:
- Prakriti: {user.get("prakriti", "Not specified")}
- Dietary preferences: {", ".join(preferences)}
- Calorie goal: {calorie_goal} kcal/day

{health_notes}

Each day must include:
- Breakfast, Lunch, and Dinner
- Meal names only (no recipes)
- Meals suitable for the person's prakriti and health
- Strictly avoid any ingredients that are unhealthy for their conditions or allergies

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
    return prompt.strip()