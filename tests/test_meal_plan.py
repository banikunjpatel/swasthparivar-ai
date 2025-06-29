import pytest
from unittest.mock import patch
from app.services.meal_plan_service import generate_meal_plan

mock_user_profile = {
    "name": "Test User",
    "prakriti": "Vata",
    "health_conditions": ["diabetes"],
    "preferences": ["vegetarian"],
    "calorie_goal": "1800"
}

mock_gpt_response = """
[
  {
    "day": "Monday",
    "breakfast": "Poha",
    "lunch": "Dal with brown rice",
    "dinner": "Vegetable khichdi"
  },
  {
    "day": "Tuesday",
    "breakfast": "Upma",
    "lunch": "Chapati with sabzi",
    "dinner": "Moong dal soup with roti"
  }
]
"""

@patch("app.services.openai_client.call_gpt", return_value=mock_gpt_response)
def test_generate_meal_plan(mock_call):
    result = generate_meal_plan(mock_user_profile)

    assert isinstance(result, list)
    assert len(result) == 2
    assert result[0]["day"] == "Monday"
    assert "breakfast" in result[0]
    assert mock_call.called