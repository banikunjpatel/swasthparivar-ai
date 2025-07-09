INGREDIENT_CATEGORY_MAP = {
    "tomato": "Vegetables",
    "rice": "Grains & Pulses",
    "turmeric": "Spices & Herbs",
    "curd": "Dairy & Substitutes",
    "banana": "Fruits",
    "oil": "Miscellaneous",
    # Add more as needed
}

def get_category(ingredient_name: str) -> str:
    return INGREDIENT_CATEGORY_MAP.get(ingredient_name.lower(), "Others")