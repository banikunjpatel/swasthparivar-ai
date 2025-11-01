def build_recipe_prompt(recipe_name: str) -> str:
    prompt = f"""
You are an expert Ayurvedic recipe assistant.
You MUST reply with 100% valid, parseable JSON without any comments or Markdown.

Generate a detailed, structured recipe for the following dish:
📝 Recipe Name: "{recipe_name}"

🔧 Your output must include:
- A short description of the recipe
- Ingredients (with name, quantity, unit, foodId)
- Cooking instructions (as a list of clear steps)
- Prep time, cook time, servings
- Meal type (e.g., breakfast, lunch, snack)
- Dosha balancing percentages
- Suitable seasons
- Difficulty level
- Relevant tags
- Basic nutrition info
- Substitutes for main ingredients (if applicable)

🧾 Format the response as strict JSON in this structure:

{{
  "id": "slug-format-id",  // lowercase, kebab-case slug derived from recipe name like 'moong-dal-chilla'
  "name": "{recipe_name}",
  "description": "Short Ayurvedic description...",
  "ingredients": [
    {{ "foodId": "mung-dal", "name": "Mung Dal", "quantity": 0.5, "unit": "cup" }},
    {{ "foodId": "ghee", "name": "Ghee", "quantity": 1, "unit": "tbsp" }}
  ],
  "instructions": [
    "Step 1...",
    "Step 2..."
  ],
  "prepTime": 10,
  "cookTime": 25,
  "servings": 2,
  "mealType": "lunch",
  "doshaBalance": {{ "vata": 80, "pitta": 70, "kapha": 60 }},
  "season": ["spring", "summer", "winter"],
  "difficulty": "easy",
  "tags": ["healing", "balanced"],
  "nutrition": {{
    "calories": 280,
    "protein": 12,
    "carbs": 40,
    "fat": 5,
    "fiber": 6,
    "vitamins": ["B1", "B12"],
    "minerals": ["iron", "magnesium"]
  }},
  "substitutes": {{
    "Mung Dal": ["Red lentils", "Yellow split peas"],
    "Ghee": ["Sesame oil"]
  }}
}}

⚠️ Respond ONLY with valid JSON. No Markdown, no extra text, no explanations.
""".strip()

    return prompt
