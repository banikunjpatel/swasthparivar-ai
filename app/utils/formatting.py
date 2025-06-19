def title_case_meals(meal_plan: dict) -> dict:
    for day, meals in meal_plan.items():
        for meal in meals:
            meals[meal] = meals[meal].strip().capitalize()
    return meal_plan

def clean_meal_name(meal_name: str) -> str:
    # Example: remove extra spaces and capitalize
    return meal_name.strip().title()