import json
import os
from openai import OpenAI

# Use API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 1. Load the meal plan JSON
meal_plan_path = "/Users/rudra/ai-for-good-hackathon/meal_plan_output.json"
with open(meal_plan_path, "r") as f:
    meal_plan_json = json.load(f)

# 2. Build the prompt, inserting the meal plan as pretty-printed JSON
prompt = """
You are a wellness-focused Indian nutrition assistant with expertise in Ayurveda and local household planning.

Below is a 7-day Indian meal plan created for one person, including Breakfast, Lunch, Snacks, and Dinner.  
Your task is to extract a complete grocery list from this plan, summarized for the week.

🧾 What you should do:
- Identify all ingredients used across all meals
- Group them into clear categories:
  - Vegetables
  - Grains & Pulses
  - Spices & Herbs
  - Dairy & Substitutes
  - Fruits
  - Miscellaneous
- Combine repeated items and provide an estimated total quantity for 1 person for 7 days
- Use realistic Indian kitchen measures (e.g., 500g rice, 6 tomatoes, 1 bunch spinach)

Now here is the meal plan:
----------------------------
{meal_plan}
----------------------------
Only output the grocery list as a JSON object. Do not include any explanation, greeting, or markdown formatting.
""".replace("{meal_plan}", json.dumps(meal_plan_json, indent=2))

# 3. Send to GPT API
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,
    max_tokens=1000
)

grocery_list_str = response.choices[0].message.content.strip()

# 4. Try to parse and save the grocery list as JSON
try:
    grocery_list_json = json.loads(grocery_list_str)
    with open("/Users/rudra/ai-for-good-hackathon/grocery_list.json", "w") as f:
        json.dump(grocery_list_json, f, indent=2)
    print("Grocery list saved to grocery_list.json")
except json.JSONDecodeError:
    print("Could not parse grocery list as JSON. Here is the raw output:")
    print(grocery_list_str)