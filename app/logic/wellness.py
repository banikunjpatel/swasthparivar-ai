# wellness.py

WELLNESS_SUGGESTIONS = {
    "autumn": {
        "vata": ["Warm oils", "Maintain routine", "Get enough rest"],
        "pitta": ["Take time to reflect", "Stay cool", "Avoid spicy food"],
        "kapha": ["Do cardio exercises", "Eat warming spices", "Wake up early"]
    },
    "winter": {
        "vata": ["Stay warm", "Do light yoga", "Avoid cold foods"],
        "pitta": ["Balance heat and light foods", "Avoid excessive sunlight", "Meditate"],
        "kapha": ["Intense workouts", "Detox regularly", "Avoid heavy meals"]
    },
    "spring": {
        "vata": ["Practice breathwork", "Gentle movement", "Eat seasonal vegetables"],
        "pitta": ["Do a light detox", "Engage in creative activities", "Keep cool"],
        "kapha": ["Try HIIT", "Use dry brushing", "Consider intermittent fasting"]
    },
    "summer": {
        "vata": ["Stay hydrated", "Swim or do water-based activities", "Avoid excess sun"],
        "pitta": ["Use cooling oils", "Spend time in moonlight", "Avoid overheating"],
        "kapha": ["Be active in mornings", "Surround with bright colors", "Stay energized"]
    }
}

CONDITION_WARNINGS = {
    "asthma": ["Avoid intense cardio in dry air", "Use steam inhalation"],
    "diabetes": ["Maintain regular meals", "Avoid high glycemic foods"]
}


def get_member_wellness_tips(prakriti: str, season: str, conditions: list[str]) -> list[str]:
    season = season.lower()
    prakriti = prakriti.lower()

    base_tips = WELLNESS_SUGGESTIONS.get(season, {}).get(prakriti, [])
    health_tips = []

    for cond in conditions:
        if cond.lower() in CONDITION_WARNINGS:
            health_tips.extend(CONDITION_WARNINGS[cond.lower()])
    
    return base_tips + health_tips