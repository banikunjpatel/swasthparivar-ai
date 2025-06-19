import requests
import json

print("🚀 Sending request to your FastAPI meal plan endpoint...")

url = "http://127.0.0.1:8000/api/generate-meal"

user_profile = {
    "fullName": "Rita Sharma",
    "age": 35,
    "gender": "female",
    "weight": 60,
    "height": 158,
    "prakriti": "Pitta",
    "fitnessGoals": "weight loss",
    "activityLevel": "moderately active",
    "dietaryPreferences": "vegetarian",
    "medicalConditions": ["diabetes"],
    "allergies": ["milk"]
}

# ✅ This uses your FastAPI backend
response = requests.post(url, json=user_profile)
print("Raw meal plan response:", response)
print("Response text:", response.text)

print("✅ Request sent. Status Code:", response.status_code)

try:
    result = response.json()
    print("📦 Response JSON:")
    print(json.dumps(result, indent=2))
except json.JSONDecodeError:
    print("⚠️ Failed to decode JSON. Raw response:")
    print(response.text)