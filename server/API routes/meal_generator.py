import openai
import os
from openai import OpenAI
import json

# 🔐 Set your OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

# ✅ User input JSON (can be replaced by dynamic input later)
user_profile = {
    "fullName": "Anita Sharma",
    "age": 45,
    "gender": "female",
    "weight": 65,
    "height": 160,
    "prakriti": "Pitta",
    "fitnessGoals": "weight loss",
    "activityLevel": "moderately active",
    "dietaryPreferences": "vegetarian",
    "medicalConditions": ["Hypertension", "Acid reflux"],
    "allergies": ["Dairy"]
}

# 🧠 Prompt builder
def build_meal_plan_prompt(user):
    full_name = user.get("fullName", "User")
    age = user.get("age", "unknown age")
    gender = user.get("gender", "")
    weight = user.get("weight", "unknown")
    height = user.get("height", "unknown")
    prakriti = user.get("prakriti", "unknown")
    goal = user.get("fitnessGoals", "general wellness")
    activity = user.get("activityLevel", "moderately active")
    diet = user.get("dietaryPreferences", "vegetarian")
    conditions = ", ".join(user.get("medicalConditions", [])) or "no known conditions"
    allergies = ", ".join(user.get("allergies", [])) or "no known allergies"

    return f"""
You are an experienced Indian Ayurvedic nutritionist and fitness-aware meal planner.

Generate a 7-day meal plan for the following user:

- Name: {full_name}
- Age: {age}, Gender: {gender}
- Weight: {weight} kg, Height: {height} cm
- Ayurvedic Body Type (Prakriti): {prakriti}
- Fitness Goal: {goal}
- Activity Level: {activity}
- Dietary Preference: {diet}
- Medical Conditions: {conditions}
- Food Allergies: {allergies}

🟢 Guidelines:
- Align meals with Ayurvedic principles for balancing the {prakriti} prakriti.
- Support the user's goal of {goal} while respecting their activity level.
- Avoid all allergens and aggravating foods for their medical conditions.
- Use Indian seasonal, affordable, and culturally appropriate ingredients.
- Ensure meals are practical to prepare in a home kitchen.
- Include 4 meals/day: Breakfast, Lunch, Snack, Dinner.
- Mention portion control or hydration tips if helpful.

🗓️ Format the response as a JSON object like this:

{{
  "Day 1": {{
    "Breakfast": "...",
    "Lunch": "...",
    "Snack": "...",
    "Dinner": "..."
  }},
  ...
  "Day 7": {{
    ...
  }}
}}
"""

# Build prompt
prompt = build_meal_plan_prompt(user_profile)

# 🔁 Call GPT-4 API
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,
    max_tokens=1800
)

# 🧾 Output response
meal_plan_str = response.choices[0].message.content
print(meal_plan_str)

# Optional: Save to file
with open("meal_plan_output.json", "w") as f:
    f.write(meal_plan_str)

# Parse and save as JSON
try:
    meal_plan_json = json.loads(meal_plan_str)
    with open("meal_plan.json", "w") as f:
        json.dump(meal_plan_json, f, indent=2)
except json.JSONDecodeError:
    print("Could not parse meal plan as JSON.")
    meal_plan_json = None