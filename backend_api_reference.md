
# 🍲 SwasthParivar-AI Backend API Reference

This document helps frontend developers (Angular team) understand and integrate with the FastAPI backend for meal planning, dosha detection, and grocery generation.

---

## 🔐 Base URL

```
http://localhost:8000/api
```

(Adjust when deployed to production.)

---

## 🔮 1. `/detect-dosha` — Detect User's Ayurvedic Dosha

### POST `/detect-dosha`

**Purpose:** Analyze the user's profile and predict their `prakriti` (Vata, Pitta, Kapha).

### Request Body (JSON)
```json
{
  "fullName": "Rita Sharma",
  "age": 35,
  "gender": "female",
  "weight": 60,
  "height": 158,
  "prakriti": "",
  "fitnessGoals": "weight loss",
  "activityLevel": "moderately active",
  "dietaryPreferences": "vegetarian",
  "medicalConditions": [],
  "allergies": []
}
```

> `"prakriti"` field is optional if auto-detected.

### Response
```json
{
  "prakriti": "Pitta"
}
```

---

## 🥗 2. `/generate-meal` — Generate Personalized Meal Plan

### POST `/generate-meal`

**Purpose:** Generate a 7-day meal plan based on user's profile.

### Request Body (JSON)
```json
{ "profile": <UserProfile object> }
```

Same format as above.

### Response
```json
{
  "Day 1": {
    "Breakfast": "...",
    "Lunch": "...",
    "Snack": "...",
    "Dinner": "..."
  },
  ...
  "Day 7": { ... }
}
```

---

## 👨‍👩‍👧‍👦 3. `/generate-family-meal` — Generate Combined Family Meal Plan

### POST `/generate-family-meal`

**Purpose:** Generate a merged meal plan for multiple users.

### Request Body
```json
{
  "members": [<UserProfile>, <UserProfile>, ...]
}
```

### Response
Same as single meal plan but with member names appended per dish:
```json
{
  "Day 1": {
    "Breakfast": "Oats porridge... (rita sharma), Moong dal... (amit sharma)",
    ...
  }
}
```

---

## 🛒 4. `/generate-grocery` — Generate Grocery List

### POST `/generate-grocery`

**Purpose:** Convert a meal plan into a categorized grocery list.

### Request Body
```json
{
  "plan": {
    "Day 1": {
      "Breakfast": "...",
      "Lunch": "...",
      "Snack": "...",
      "Dinner": "..."
    },
    ...
  }
}
```

### Response (Example)
```json
{
  "Vegetables": {
    "Cucumber": "2 medium",
    "Mixed Vegetables (for khichdi and stir-fry)": "500g"
  },
  "Grains & Pulses": {
    "Quinoa": "250g",
    "Moong Dal": "200g",
    ...
  },
  "Spices & Herbs": {
    "Cinnamon": "10g"
  },
  "Fruits": {
    "Banana": "2",
    "Apple": "1"
  },
  ...
}
```

---

## ✅ Status Codes

| Code | Meaning             |
|------|----------------------|
| 200  | Success              |
| 400  | Invalid input        |
| 500  | Server or GPT error  |

---

## 💡 Notes for Angular Developers

- All responses are JSON.
- Use Angular's `HttpClient.post(...)` with appropriate headers.
- `dietaryPreferences` can be used to toggle vegetarian/non-vegetarian options.
- Use retry logic on `/generate-grocery` if JSON parse fails (backend is now stable, but frontend may receive GPT errors occasionally).
- Suggest showing loading indicators — GPT calls can take 5–10 seconds.

---
