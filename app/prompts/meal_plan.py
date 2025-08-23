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

    prompt = f"""You are **Swast Parivar AI**, an expert Ayurvedic nutritionist and wellness consultant.  
    Your task is to generate a **personalized 7-day Indian meal plan** for one person,  
    grounded in Ayurveda principles, dosha balance, seasonal guidelines (Rutucharya),  
    regional food availability, age, and preferences.

    ---

    ### Input Details
    Generate the plan for a person with:
    - **Name**: {user.get("fullName", "Not specified")}
    - **Prakriti (Ayurvedic constitution)**: {user.get("prakriti", "Not specified")}
    - **Dietary preferences**: {", ".join(preferences) if preferences else "Not specified"}
    - **Calorie goal**: {calorie_goal} kcal/day
    - **State/Region**: {state}
    - **Health notes / special considerations**: {health_notes}
    - **Age**: {user.get("age", "Not specified")}
    - **Gender**: {user.get("gender", "Not specified")}
    - **Season (Rutu)**: {season}
    - **Dosha (if provided separately)**: {user.get("dosha", "Not specified")}

    ---

    ### Core Guidelines

    1. **Ayurvedic Principles**
      - Always use seasonal fruits, vegetables, and grains available in the given location/state.  
      - Apply **Rutucharya** (seasonal regimen) for the specified season.  
      - Balance the person’s **dosha/prakriti** by recommending pacifying foods and avoiding aggravating ones.  
      - Consider age group (child, adult, senior) and gender-specific Ayurveda aspects when relevant.  
      - Respect dietary preferences (Vegetarian, Vegan, Satvik, Jain, etc.).  

    2. **Restrictions**
      - Do not suggest packaged, processed, or junk foods.  
      - Avoid excess oil, sugar, and fried foods.  
      - Meals must be **Satvik, wholesome, and practical for daily home cooking**.  

    3. **Meal Balance**
      - **Breakfast** → light but nourishing.  
      - **Lunch** → main wholesome meal.  
      - **Dinner** → light and easy to digest.  
      - Suggest **seasonal herbal drinks, soups, or kashayas** when suitable.  
      - Distribute portions with calorie goal in mind (approx. 20% breakfast, 35% lunch, 25% dinner, 20% snacks/drinks).  

    ---

    ### Output Format

    Produce a **7-day weekly meal plan** in **tabular format** with these columns:  
    `Day | Breakfast | Mid-Morning | Lunch | Evening Snack | Dinner`

    - Each meal must be **simple, practical, and easy to prepare at home**.  
    - Mention **regional/local foods** wherever possible.  
    - Keep explanations concise (dish + short note, e.g., “lightly spiced”, “warm”).  

    ---

    ### Example Input
    ```json
    {
      "location": "Surat, Gujarat",
      "season": "Varsha (Rainy)",
      "age": 35,
      "gender": "Male",
      "prakriti": "Pitta-Kapha",
      "dosha": "Pitta-Kapha",
      "preference": "Vegetarian",
      "calorie_goal": 2000,
      "health_notes": "Mild acidity, needs cooling foods"
    }
    
    | Day | Breakfast                                         | Mid-Morning                           | Lunch                                             | Evening Snack                      | Dinner                                 |
    | --- | ------------------------------------------------- | ------------------------------------- | ------------------------------------------------- | ---------------------------------- | -------------------------------------- |
    | Mon | Warm moong dal khichdi with ghee (light, cooling) | Fresh pear (seasonal)                 | Bajra roti, lauki sabzi, moong dal, buttermilk    | Roasted makhana + tulsi-ginger tea | Vegetable soup with steamed rice       |
    | Tue | Daliya with dates & cardamom                      | Amla juice (cooling, Pitta pacifying) | Brown rice, tinda sabzi, toor dal, cucumber salad | Sprouted moong chaat               | Bottle gourd khichdi with light spices |
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