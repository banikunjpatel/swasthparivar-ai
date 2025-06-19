def build_meal_plan_prompt(user):
    return f"""
You are an experienced Indian Ayurvedic nutritionist and fitness-aware meal planner.

Generate a 7-day meal plan for the following user:

- Name: {user.get("fullName", "Unknown")}
- Age: {user.get("age", "Unknown")}, Gender: {user.get("gender", "")}
- Weight: {user.get("weight", "Unknown")} kg, Height: {user.get("height", "Unknown")} cm
- Ayurvedic Body Type (Prakriti): {user.get("prakriti", "Unknown")}
- Fitness Goal: {user.get("fitnessGoals", "general wellness")}
- Activity Level: {user.get("activityLevel", "moderately active")}
- Dietary Preference: {user.get("dietaryPreferences", "vegetarian")}
- Medical Conditions: {", ".join(user.get("medicalConditions", [])) or "None"}
- Food Allergies: {", ".join(user.get("allergies", [])) or "None"}

🟢 Guidelines:
- Align meals with Ayurvedic principles for the user's prakriti type.
- Support the user's goal while respecting allergies and activity level.
- Use seasonal, Indian ingredients and practical recipes.
- Include 4 meals/day: Breakfast, Lunch, Snack, Dinner.
- Add hydration or portion tips if helpful.

🗓️ Respond ONLY with valid JSON — no markdown, no explanation.
Format:

{{
  "Day 1": {{
    "Breakfast": "...",
    "Lunch": "...",
    "Snack": "...",
    "Dinner": "..."
  }},
  ...
  "Day 7": {{
    ...
  }}
}}
"""