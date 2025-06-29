import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.mongo import families_collection, members_collection, grocery_collection
from app.utils.formatting import convert_list_to_day_dict  # ✅ Make sure this is imported

@pytest.mark.asyncio
async def test_full_family_meal_and_grocery_flow():
    # Clean test data before running
    await families_collection.delete_many({"email": "test@example.com"})
    await members_collection.delete_many({"userId": "test-user-123"})
    await grocery_collection.delete_many({"memberId": "test-member-1"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: Register a test family with 2 members
        register_data = {
            "family": {
                "email": "test@example.com",
                "password": "testpass",
                "fullName": "Test User",
                "age": 35,
                "gender": "female",
                "dietaryPreferences": "vegetarian",
                "prakriti": "Pitta",
                "allergies": ["milk"]
            },
            "members": [
                {
                    "userId": "test-user-123",
                    "fullName": "Member One",
                    "age": 30,
                    "gender": "female",
                    "dietaryPreferences": "vegetarian",
                    "prakriti": "Vata",
                    "allergies": ["peanuts"]
                },
                {
                    "userId": "test-user-123",
                    "fullName": "Member Two",
                    "age": 40,
                    "gender": "male",
                    "dietaryPreferences": "non-vegetarian",
                    "prakriti": "Kapha",
                    "allergies": []
                }
            ]
        }

        res = await client.post("/api/register-family", json=register_data)
        assert res.status_code == 200
        user_id = res.json()["userId"]
        print(f"✅ Family registered. userId: {user_id}")

        # Step 2: Fetch members from DB
        members = await members_collection.find({"userId": user_id}).to_list(length=2)
        assert len(members) == 2
        member_id = str(members[0]["_id"])
        print(f"👤 Member ID: {member_id}")

        # Step 3: Generate meal plan for one member
        meal_res = await client.get(f"/api/generate-meal/{member_id}")
        assert meal_res.status_code == 200
        meal_plan = meal_res.json()

        # Validate format
        if isinstance(meal_plan, dict):
            assert "Monday" in meal_plan or "Day 1" in meal_plan
            plan_dict = meal_plan
        elif isinstance(meal_plan, list):
            days = [d.get("day") for d in meal_plan]
            print("📅 Meal days returned:", days)
            assert any(day in ["Monday", "Day 1"] for day in days)
            plan_dict = convert_list_to_day_dict(meal_plan)  # ✅ Convert here
        else:
            pytest.fail("❌ Unexpected meal plan format")

        # Step 4: Generate family plan
        fam_res = await client.get(f"/api/generate-family-meal/{user_id}")
        assert fam_res.status_code == 200
        family_plan = fam_res.json()
        assert "Monday" in family_plan or "Day 1" in family_plan
        print("👨‍👩‍👧‍👦 Family meal plan generated.")

        # Step 5: Generate grocery list
        grocery_payload = {
            "plan": plan_dict,  # ✅ Corrected format
            "memberId": member_id,
            "week": "2025-W01",
            "mealPlanVersion": 1
        }
        groc_res = await client.post("/api/generate-grocery", json=grocery_payload)
        assert groc_res.status_code == 200
        grocery_data = groc_res.json()
        assert "items" in grocery_data
        print("🛒 Grocery list created and stored.")

        print("🎉 Full family flow passed successfully!")