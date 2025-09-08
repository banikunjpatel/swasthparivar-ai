from typing import Optional

def build_meal_plan_prompt(user: dict, previous_plan: Optional[dict] = None, wellness_tips: Optional[list[str]] = None) -> str:
    import json
    from app.utils.compliance import MEAL_COMPLIANCE_RULES

    health_conditions = user.get("healthConditions", [])
    allergies = user.get("allergies", [])
    preferences = user.get("dietaryPreferences", [])
    calorie_goal = user.get("calorieGoal", "unspecified")
    state = user.get("state", "Not specified")
    season = user.get("season", "Not specified")

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

    prompt = """
You are **Swast Parivar AI**, an expert Ayurvedic nutritionist and wellness consultant.

Your task: Generate a **shared 7-day Indian meal plan** that is:
- Rooted in Ayurveda (dosha/prakriti balance, Rutucharya/seasonal regimen),
- Uses regional & seasonal foods for the given state/location,
- Practical for home cooking,
- Output **ONLY valid JSON** in the exact structure below (no Markdown, no prose).

--------------------------------------------------------------------------------
INPUT (variables you receive)
- location/state: {state}
- season (Rutu): {season}
- Name: {fullName}
- Prakriti (Ayurvedic constitution): {prakriti}
- Dietary preferences: {preferences}
- Calorie goal: {calorie_goal} kcal/day
- State: {state}

{health_notes}

Each day must include:
- Breakfast, Lunch, and Dinner
- Meal names only (no recipes)
- Meals suitable for the person's prakriti and health
- Strictly avoid any ingredients listed above
 Ensure variety across the week — do not repeat meals.
- **Add meal-level Ayurvedic customizations** like:
  - "with ghee for Vata"
  - "add ajwain for Kapha digestion"
  - "steamed version for weight loss"
  - "ginger added for immunity"
- Each meal (breakfast/lunch/dinner) must include a **base dish** and a **customizations** string.


Return response in this strict JSON format:


{{
  "Monday": {{
    "breakfast": {{
      "base": "Ragi porridge",
      "customizations": "with cardamom and jaggery (for Vata balance)"
    }},
    "lunch": {{
       "base": "Lauki sabzi with jowar roti",
      "customizations": "with extra turmeric (for inflammation)"
    }},
    "dinner": {{
       "base": "Moong dal khichdi",
      "customizations": "with ghee and cumin seeds (Vata pacifying)"
    }}
  }},
  ...
}}

⚠️ Output only JSON. No Markdown. No extra commentary.

Do not use Markdown. No extra commentary.
"""
    if wellness_tips:
      prompt += "\n🌿 Seasonal Ayurvedic Wellness Suggestions:\n"
      prompt += "\n".join(f"- {tip}" for tip in wellness_tips)

    if previous_plan:
        prompt += f"""

Here is last week's meal plan. ⚠️ Please avoid repeating the same dishes:

{json.dumps(previous_plan, indent=2)}

Please generate a new meal plan that does not repeat any of these meals.
"""

    return prompt.strip()