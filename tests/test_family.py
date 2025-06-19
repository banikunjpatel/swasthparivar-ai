import requests

def test_generate_family_meal():
    url = "http://127.0.0.1:8000/api/generate-family-meal"

    family_profiles = [
        {
            "fullName": "Rita Sharma",
            "age": 35,
            "gender": "female",
            "weight": 60,
            "height": 158,
            "prakriti": "Pitta",
            "fitnessGoals": "weight loss",
            "activityLevel": "moderately active",
            "dietaryPreferences": "vegetarian",
            "medicalConditions": [],
            "allergies": []
        },
        {
            "fullName": "Amit Sharma",
            "age": 40,
            "gender": "male",
            "weight": 70,
            "height": 172,
            "prakriti": "Kapha",
            "fitnessGoals": "general wellness",
            "activityLevel": "lightly active",
            "dietaryPreferences": "non-vegetarian",
            "medicalConditions": [],
            "allergies": []
        }
    ]

    response = requests.post(url, json={"members": family_profiles})
    print("⚠️ Server Response:", response.text)
    assert response.status_code == 200
    data = response.json()
    print("\n👨‍👩‍👧‍👦 Merged Family Meal Plan:")
    print(data["Day 1"]["Breakfast"])  # Just a peek at one item
    assert "Day 1" in data