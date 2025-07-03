def build_family_meal_prompt(family: list) -> str:
    prompt = """
You are an expert Indian Ayurvedic nutritionist and meal planner.

Generate a **shared 7-day family meal plan** with **Breakfast, Lunch, and Dinner** for each day.

Each meal must have:
- A single common **base dish** for all (if suitable)
- **Customizations** for each family member based on:
  - Age
  - Gender (if relevant)
  - Prakriti type
  - Health conditions (e.g., diabetes, thyroid, etc.)
  - Dietary preferences (e.g., vegetarian)
  - Allergies

🎯 Key guidelines:
- Avoid any restricted ingredients based on allergies or conditions.
- Follow Ayurvedic guidelines for prakriti balancing.
- Avoid conflicts — use adaptable meals with per-person customization if needed.
- Mention specific modifications (e.g., "with fenugreek chutney", "extra ghee", "no sugar", etc.)

🧾 Format the output in this strict JSON format:

{
  "Monday": {
    "breakfast": {
      "base": "Moong dal chilla",
      "customizations": {
        "Father": "with fenugreek chutney (for diabetes)",
        "Mother": "with mint chutney (Kapha pacifying)",
        "Child": "with ghee (Vata balancing, for energy)"
      }
    },
    "lunch": { ... },
    "dinner": { ... }
  },
  ...
}

Do not include Markdown or extra commentary.
Now, here is the family profile:
"""

    for member in family:
        prompt += f"""
Name: {member.get("fullName")}
Age: {member.get("age")}
Gender: {member.get("gender")}
Prakriti: {member.get("prakriti")}
Health Conditions: {", ".join(member.get("healthConditions", []))}
Allergies: {", ".join(member.get("allergies", []))}
Dietary Preferences: {member.get("dietaryPreferences", "Not specified")}
"""

    return prompt.strip()