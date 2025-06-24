import json
from pathlib import Path
from app.utils.logger import get_logger
from app.utils.timing import timed

logger = get_logger(__name__)

# Load sensitive ingredients from config
CONFIG_PATH = Path(__file__).parent.parent / "config" / "health_rules.json"
try:
    with open(CONFIG_PATH) as f:
        sensitive_ingredients = json.load(f)
except Exception as e:
    logger.error(f"Failed to load health_rules.json: {e}")
    sensitive_ingredients = {}

# Substitution logic for risky foods
SUBSTITUTES = {
    "sugar": "stevia",
    "fried": "steamed",
    "gulab jamun": "fruit salad",
    "pickle": "sprout salad",
    "papad": "roasted chana",
    "jalebi": "baked apple slices"
}

@timed
def filter_meal_plan(meal_plan: dict, conditions: list[str]) -> dict:
    logger.info("🔎 Filtering meal plan with health compliance checks...")

    filtered_plan = {}

    for day, meals in meal_plan.items():
        filtered_meals = {}

        for meal_type, dish in meals.items():
            original_dish = dish
            compliance = "safe"
            warnings = []
            reason = []
            modified = False

            for cond in conditions:
                restricted_items = sensitive_ingredients.get(cond.lower(), [])
                for risk in restricted_items:
                    if risk.lower() in dish.lower():
                        warnings.append(f"{cond}: {risk}")
                        reason.append(f"contains {risk}")
                        compliance = "unsafe"

                        # Try substitution
                        for bad, substitute in SUBSTITUTES.items():
                            if bad in dish.lower():
                                dish = dish.lower().replace(bad, substitute)
                                modified = True
                                compliance = "modified"

            filtered_meals[meal_type] = {
                "dish": dish,
                "compliance": compliance,
                "modified": modified,
                "reason": reason,
                "warnings": warnings,
                "original_dish": original_dish if modified else None
            }

        filtered_plan[day] = filtered_meals

    return filtered_plan