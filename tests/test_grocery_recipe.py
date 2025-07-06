import asyncio
import json
from datetime import datetime

from app.prompts.recipe_prompt import build_recipe_prompt
from app.prompts.grocery_list import build_grocery_prompt
from app.services.openai_client import call_gpt
from app.db.mongo import recipes_collection, grocery_collection

async def test_recipe_and_grocery_terminal(dish_name: str):
    print(f"🔍 Looking up recipe: {dish_name}\n")

    # Step 1: Check if recipe exists
    existing = await recipes_collection.find_one({"name": dish_name.lower()})
    if existing:
        print("✅ Recipe found in MongoDB.\n")
        recipe = existing
    else:
        print("🧠 Recipe not found. Generating with GPT...\n")
        prompt = build_recipe_prompt(dish_name)
        raw = call_gpt(prompt)
        cleaned = raw.strip().strip("```json").strip("```")
        recipe = json.loads(cleaned)
        recipe["name"] = dish_name.lower()
        result = await recipes_collection.insert_one(recipe)
        recipe["_id"] = str(result.inserted_id)
        print("✅ Recipe saved to MongoDB.\n")

    # Step 2: Print the recipe
    print("📄 Recipe Details:")
    print(json.dumps(recipe, indent=2))
    print("\n" + "="*60 + "\n")

    # Step 3: Create mock 7-day meal plan
    meal_plan = {
        "Monday": {
            "breakfast": {
                "base": recipe["name"].title(),
                "customizations": {
                    "User": "with ghee and chutney"
                }
            }
        }
    }

    # Step 4: Generate grocery list from that plan
    print("🛒 Generating grocery list from the meal plan...\n")
    grocery_prompt = build_grocery_prompt(meal_plan)
    grocery_raw = call_gpt(grocery_prompt)
    grocery_data = json.loads(grocery_raw)

    # Step 5: Save grocery list
    grocery_doc = {
        "userId": "test-user",
        "memberId": "test-member",
        "mealPlanVersion": 1,
        "week": "2025-W28",
        "items": grocery_data["items"],
        "createdAt": datetime.utcnow()
    }
    result = await grocery_collection.insert_one(grocery_doc)
    grocery_doc["_id"] = str(result.inserted_id)

    # Step 6: Print grocery items
    print("📦 Grocery List:")
    for item in grocery_data["items"]:
        print(f" - {item['name']}: {item['quantity']} ({item['category']})")

    print(f"\n✅ Grocery list saved with ID: {grocery_doc['_id']}\n")

# Run it directly
if __name__ == "__main__":
    asyncio.run(test_recipe_and_grocery_terminal("Moong dal chilla"))