def extract_meal_names_from_plan(meal_plan: dict) -> list[str]:
    """
    Extracts unique meal names from the structured meal plan dictionary.
    """
    meal_names = set()

    for day, meals in meal_plan.items():
        for meal_time, meal in meals.items():
            if isinstance(meal, dict) and "name" in meal:
                meal_names.add(meal["name"])
            elif isinstance(meal, str):
                meal_names.add(meal)

    return list(meal_names)