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
- Health notes / special considerations: {health_notes}
- Age: {age}
- Gender: {gender}

--------------------------------------------------------------------------------
RULES (must follow)
### Instructions:
1. Always follow Ayurvedic principles for diet:
   - Use seasonal fruits and vegetables available in the given location/state.
   - Consider the current season (Rutu) and apply Rutucharya rules.
   - Balance the given dosha(s) with appropriate foods and avoid aggravating ones.
   - Recommend Satvik, wholesome, light, and easily digestible meals.
 
2. Output format:
   - Present results in a **table** with columns: Day, Breakfast, Mid-Morning, Lunch, Evening Snack, Dinner.
   - Each meal should be simple, practical, and easy to prepare at home.
   - Mention **regional/local foods** wherever possible.
 
3. Consider Member Preferences:
   - Age group (child, adult, senior).
   - Gender if relevant in Ayurveda (e.g., pregnancy, elderly women).
   - Dietary preference (vegetarian, vegan, sattvic, Jain, etc.).
 
4. Restrictions:
   - Do not suggest packaged/processed foods.
   - No excess oil, sugar, or fried foods.
   - Focus on naturally available foods, seasonal grains, pulses, and spices.
 
5. Response:
   - Generate a 7-day weekly meal plan in tabular format.
   - Keep portions balanced for breakfast (light but nourishing), lunch (main meal), and dinner (light and easy to digest).
   - Suggest seasonal herbal drinks, soups, or kashayas when needed.
   - Adapt the plan based on member is provided (different age, dosha, or health focus).

--------------------------------------------------------------------------------
OUTPUT FORMAT (strict JSON, no extra fields)
{
  "metadata": {
    "location": "<string>",
    "season": "<string>",
    "notes": "<string or empty>"
  },
  "plan": {
    "Monday": {
      "breakfast": "<Poha with peas + herbal tea>",
      "mid_morning": "<Seasonal fruit (pear)>",
      "lunch": "<Bajra roti, lauki sabzi, moong dal, buttermilk>",
      "evening_snack": "<Roasted makhana with herbal tea>",
      "dinner": "<Moong dal khichdi with bottle gourd>"
    },
    "Tuesday": { ... same shape ... },
    "Wednesday": { ... },
    "Thursday": { ... },
    "Friday": { ... },
    "Saturday": { ... },
    "Sunday": { ... }
  }
}

### Example Output (shortened):
| Day | Breakfast | Mid-Morning | Lunch | Evening Snack | Dinner |
|-----|-----------|-------------|-------|---------------|--------|
| Mon | Warm moong dal khichdi with ghee | Seasonal fruit (pear) | Bajra roti, lauki sabzi, moong dal, buttermilk | Roasted makhana with herbal tea | Light vegetable soup with steamed rice |
| Tue | Daliya with dates & cardamom | Amla juice | Brown rice, tinda sabzi, toor dal, cucumber salad | Sprouted moong chaat | Moong dal khichdi with bottle gourd |

- Respond ONLY with a valid JSON object. Do not include any explanations, markdown, or extra text.

Constraints:
- **Output ONLY JSON** in the exact schema above.
- Every day must include: breakfast, mid_morning, lunch, evening_snack, dinner.
- Keep customizations **short, practical, and Ayurvedically meaningful** (e.g., “+ghee”, “mild spices”, “mint chutney (Kapha)”, “cooling raita (Pitta)”, “avoid peanuts (allergy)”).
- Respect all allergies/conditions; when an alternative is needed, specify it clearly for member.
- Ensure meal are **diverse across the week** (avoid repeating the same meal).
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