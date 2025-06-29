def title_case_meals(meal_plan):
    if isinstance(meal_plan, list):
        # If it's a list of day objects
        for day in meal_plan:
            for key in day:
                if isinstance(day[key], str):
                    day[key] = day[key].title()
        return meal_plan

    elif isinstance(meal_plan, dict):
        # If it's a dict of days
        for day, meals in meal_plan.items():
            for meal_type, dish in meals.items():
                if isinstance(dish, str):
                    meals[meal_type] = dish.title()
        return meal_plan

    return meal_plan

def clean_meal_name(meal_name: str) -> str:
    # Example: remove extra spaces and capitalize
    return meal_name.strip().title()

def convert_list_to_day_dict(plan_list):
    """
    Convert list of {"day": "Monday", "breakfast": "..."} → {"Monday": {...}}
    """
    return {day["day"]: {k: v for k, v in day.items() if k != "day"} for day in plan_list}