import requests

def test_generate_grocery():
    url = "http://127.0.0.1:8000/api/generate-grocery"

    meal_plan = {
        "Day 1": {
            "Breakfast": "Quinoa porridge with apple and cinnamon",
            "Lunch": "Moong dal with brown rice",
            "Snack": "Cucumber sticks",
            "Dinner": "Chickpea curry with roti"
        },
        "Day 2": {
            "Breakfast": "Oatmeal with banana",
            "Lunch": "Vegetable khichdi",
            "Snack": "Roasted peanuts",
            "Dinner": "Tofu stir-fry with rice"
        }
    }

    response = requests.post(url, json={"plan": meal_plan})
    print("⚠️ Server Response:", response.text)

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert "Vegetables" in data or "vegetables" in data

    # ✅ Each section should be a dict of ingredient -> quantity
    for section in data.values():
        assert isinstance(section, dict)
        for item, qty in section.items():
            assert isinstance(item, str)
            assert isinstance(qty, (str, int))