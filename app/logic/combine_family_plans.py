from app.utils.timing import timed
from app.utils.formatting import title_case_meals, clean_meal_name

@timed
def merge_family_meal_plans(family: list[dict], plans: list[dict]) -> dict:
    merged = {}
    for day_num in range(1, 8):
        day_key = f"Day {day_num}"
        merged[day_key] = {"Breakfast": [], "Lunch": [], "Snack": [], "Dinner": []}
        for member, plan in zip(family, plans):
            day_meals = plan.get(day_key, {})
            for meal_type in ["Breakfast", "Lunch", "Snack", "Dinner"]:
                meal = clean_meal_name(day_meals.get(meal_type, ""))
                if meal and meal not in merged[day_key][meal_type]:
                    merged[day_key][meal_type].append(f"{meal} ({member['fullName']})")
    return merged