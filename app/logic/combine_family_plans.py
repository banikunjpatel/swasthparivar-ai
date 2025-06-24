from collections import defaultdict
from app.utils.logger import get_logger

logger = get_logger(__name__)

# 🔁 Substitutions for smart merging
SUBSTITUTES = {
    "chicken curry": "paneer curry",
    "egg bhurji": "tofu scramble",
    "fish fry": "soy chunks fry"
}

# 🔁 Resolution suggestions for conflicts
CONFLICT_SUGGESTIONS = {
    ("chicken curry", "paneer curry"): "Use tofu or mushroom curry as a shared alternative.",
    ("fish fry", "veg curry"): "Serve base curry and add fish separately.",
    ("non-veg", "veg"): "Prepare base curry and offer non-veg as a side.",
}


def combine_family_plans(family_plans: dict) -> dict:
    logger.info("👨‍👩‍👧‍👦 Combining meal plans for family...")
    shared_plan = defaultdict(dict)

    for member, plan in family_plans.items():
        for day, meals in plan.items():
            for meal_type, dish in meals.items():
                dish_clean = dish.strip().lower()
                current_entry = shared_plan[day].get(meal_type)

                if not current_entry:
                    # First entry
                    shared_plan[day][meal_type] = {
                        "dish": dish,
                        "members": [member]
                    }
                else:
                    existing_dish = current_entry["dish"].strip().lower()

                    if dish_clean == existing_dish:
                        current_entry["members"].append(member)

                    elif SUBSTITUTES.get(dish_clean) == existing_dish:
                        current_entry["members"].append(member)

                    elif SUBSTITUTES.get(existing_dish) == dish_clean:
                        # Update to more general substitute if needed
                        current_entry["members"].append(member)
                        current_entry["dish"] = SUBSTITUTES.get(existing_dish)

                    else:
                        # Conflict detected
                        if "conflicts" not in current_entry:
                            current_entry["conflicts"] = []
                        current_entry["conflicts"].append(f"{member} prefers {dish}")

                        # 🔁 Resolution suggestion
                        conflict_dishes = [
                            c.split("prefers")[-1].strip().lower()
                            for c in current_entry["conflicts"]
                        ]

                        for (a, b), suggestion in CONFLICT_SUGGESTIONS.items():
                            if (a in conflict_dishes and b == existing_dish) or (b in conflict_dishes and a == existing_dish):
                                current_entry["resolution"] = suggestion
                                break
                        else:
                            current_entry["resolution"] = "Let each member customize their meal component or offer optional sides."

    return shared_plan