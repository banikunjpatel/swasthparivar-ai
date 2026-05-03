# domain/meal/variety.py
from __future__ import annotations
from typing import List, Tuple
from .models import WeeklyMealPlan

def collect_dish_names(plan: WeeklyMealPlan) -> List[str]:
    """Extract dish names from the meal plan. Works with both old and new schema structures."""
    names = []
    # New schema structure: week_plan with meals dict
    if hasattr(plan, 'week_plan'):
        for day_item in plan.week_plan:
            meals = day_item.meals
            names.extend([
                meals.get('morning', ''),
                meals.get('breakfast', ''),
                meals.get('lunch', ''),
                meals.get('evening', ''),
                meals.get('dinner', ''),
            ])
    # Old schema structure: days with Meal objects
    elif hasattr(plan, 'days'):
        for day in plan.days:
            names.extend([day.breakfast.name, day.lunch.name, day.dinner.name])
    return [n for n in names if n]  # Filter empty strings

def find_duplicates(names: List[str]) -> List[str]:
    seen, dups = set(), set()
    for n in names:
        key = n.strip().lower()
        if key in seen:
            dups.add(key)
        else:
            seen.add(key)
    return sorted(list(dups))

def filter_recent(names: List[str], recent: set[str]) -> List[str]:
    bad = []
    for n in names:
        if n.strip().lower() in recent:
            bad.append(n)
    return bad