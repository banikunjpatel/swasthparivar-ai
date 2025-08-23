# app/utils/extract_meals.py
def extract_meal_names_from_plan(plan: dict) -> set[str]:
    """
    Accepts either:
      - OLD plan: { "Monday": {...}, ... }
      - NEW plan: { "metadata": {...}, "week": { "Monday": {...}, ... } }
    Returns a set of lowercased base dish names from all meals:
      breakfast, mid_morning, lunch, evening_snack, dinner
    """
    if isinstance(plan, dict) and "week" in plan and isinstance(plan["week"], dict):
        week = plan["week"]
    else:
        week = plan

    names = set()
    for day in week.values():
        if not isinstance(day, dict):
            continue
        for meal_key in ("breakfast", "mid_morning", "lunch", "evening_snack", "dinner"):
            info = day.get(meal_key)
            if isinstance(info, dict):
                base = info.get("base")
                if isinstance(base, str) and base.strip():
                    names.add(base.strip().lower())
    return names
