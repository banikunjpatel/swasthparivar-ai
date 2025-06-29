def validate_user_profile(profile: dict):
    if not profile.get("fullName"):
        raise ValueError("Full name is required.")
    if "age" in profile and (profile["age"] <= 0 or profile["age"] > 120):
        raise ValueError("Age must be a positive number under 120.")
    if profile.get("dietaryPreferences") == "vegan" and "milk" in profile.get("allergies", []):
        raise ValueError("Vegan profile cannot list 'milk' as an allergy conflict.")
    if not profile.get("prakriti"):
        raise ValueError("Prakriti (Ayurvedic body type) must be selected.")
    if not profile.get("fitnessGoals"):
        raise ValueError("Fitness goal must be specified.")
    if not profile.get("dietaryPreferences"):
        raise ValueError("Dietary preference must be provided.")

def validate_quiz_answers(answers: list):
    if not isinstance(answers, list) or len(answers) != 9:
        raise ValueError("Exactly 9 quiz answers are required.")
    for i, ans in enumerate(answers):
        if not isinstance(ans, str) or not ans.strip():
            raise ValueError(f"Quiz answer {i+1} must be a non-empty string.")