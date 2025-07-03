# app/utils/compliance.py
from typing import List, Dict

MEAL_COMPLIANCE_RULES = {
    "diabetes": {
        "sugar": "contains refined sugar",
        "jaggery": "contains natural sugar (jaggery)",
        "sweet": "may spike blood sugar",
        "gulab jamun": "high sugar content",
        "jalebi": "deep-fried and sugary"
    },
    "hypertension": {
        "salt": "contains high salt",
        "pickle": "high in sodium and fermented",
        "papad": "fried and salty",
        "namkeen": "processed and salty",
        "fried": "excess oil and salt"
    },
    "gastric": {
        "chili": "can irritate stomach lining",
        "spicy": "too hot for gastric issues",
        "onion": "gas-forming",
        "garlic": "can trigger gastric discomfort"
    },
    "acid reflux": {
        "spicy": "may cause acid reflux",
        "fried": "triggers reflux symptoms",
        "chili": "irritates esophagus"
    },
    "joint_pain": {
        "curd": "can increase inflammation",
        "brinjal": "may worsen joint pain",
        "spinach": "high in oxalates, can trigger pain"
    }
}


def check_meal_compliance(meal: str, conditions: List[str]) -> Dict:
    meal_lower = meal.lower()
    for condition in conditions:
        rules = MEAL_COMPLIANCE_RULES.get(condition, {})
        for keyword, reason in rules.items():
            if keyword in meal_lower:
                return {
                    "meal": meal,
                    "compliance": "unsafe",
                    "reason": f"{reason} (for {condition})"
                }
    return {
        "meal": meal,
        "compliance": "safe",
        "reason": None
    }