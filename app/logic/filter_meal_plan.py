from app.utils.logger import get_logger
logger = get_logger(__name__)

def filter_meal_plan(meal_plan: dict, conditions: list[str]) -> dict:
    logger.info("Applying health filters...")
    sensitive_ingredients = {
        "diabetes": ["honey", "sugar", "dates", "jaggery"],
        "hypertension": ["salt", "pickle", "papad", "fried"],
        "acid reflux": ["spicy", "fried", "chili"]
    }

    for day, meals in meal_plan.items():
        for meal_type, dish in meals.items():
            for cond in conditions:
                for risk in sensitive_ingredients.get(cond.lower(), []):
                    if risk in dish.lower():
                        meals[meal_type] += " ⚠️ (Caution for " + cond + ")"
    return meal_plan