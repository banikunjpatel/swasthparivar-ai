# 🧠 SwasthParivar-AI Backend Overview & Debugging History

This document serves as a technical overview and history log of the SwasthParivar-AI backend service, providing a guide for Angular frontend developers and backend collaborators.

---

## 📦 Project Structure Summary

### 🔌 `app/`
- **`main.py`** – Launches the FastAPI app and includes all API routers.
- **`routes/meal.py`** – Endpoint to generate a meal plan for a single user.
- **`routes/family.py`** – Merges multiple meal plans into a personalized family meal.
- **`routes/grocery.py`** – Converts meal plans into a structured grocery list.

### 🛠 `services/`
- **`meal_plan_service.py`** – Generates meal plan from GPT and parses JSON safely.
- **`grocery_service.py`** – Handles GPT prompt construction and grocery response parsing.
- **`openai_client.py`** – Generic GPT caller with logging and error handling.

### ✍️ `prompts/`
- **`meal_plan.py`** – Prompt builder for GPT meal planning.
- **`grocery_list.py`** – Prompt builder for weekly grocery list conversion.

### 🧰 `utils/`
- **`logger.py`** – Custom logger instance.
- **`timing.py`** – Decorator for profiling function execution time.
- **`validators.py`** – Validates user profiles (e.g., dosha, preferences).
- **`formatting.py`** – Applies formatting (e.g., title casing) to meals.

### 🔗 `logic/`
- **`combine_family_plans.py`** – Combines and labels multi-user meal plans.
- **`filter_meal_plan.py`** – Tags meals that conflict with user health conditions.

### 📑 `modals/` *(typo, should be `models/`)*
- **`user_profile.py`** – Pydantic model for user meal profile.
- **`meal_plan_input.py`** – Pydantic model for posting a meal plan for groceries.

### 🧪 `tests/`
- **`test_dosha.py`** – Tests for body type/dosha classification.
- **`test_family.py`** – Integration test for family meal generation.
- **`test_grocery.py`** – Integration test for grocery list generation.

---

## 🧭 Frontend Integration Guidelines (Angular)

1. **Base URL:** `http://localhost:8000/api/`
2. **Endpoints:**
   - `POST /generate-meal` – input: `UserProfile`, returns 7-day meal plan.
   - `POST /generate-family-meal` – input: `{ members: UserProfile[] }`, returns merged family plan.
   - `POST /generate-grocery` – input: `{ plan: MealPlan }`, returns categorized grocery list.
3. **Response Format:** JSON. All endpoints expect structured objects and return dictionaries with `Day X` keys.
4. **CORS:** Make sure the backend enables CORS for Angular dev ports (e.g., 4200).

---

## 🐞 Debugging History

### 1. **Family Meal Plan Error**
- **Error:** `'list' object has no attribute 'strip'`
- **Cause:** `call_gpt(prompt)` was passed a list instead of a string.
- **Fix:** Ensured each `generate_meal_plan()` receives a valid string prompt.

### 2. **Invalid JSON from GPT**
- **Error:** `JSONDecodeError` when parsing GPT output.
- **Fix:** Cleaned Markdown/code fences from GPT response before `json.loads()`.

### 3. **Inconsistent Grocery Output**
- **Error:** Grocery list sometimes returned `500` or empty.
- **Cause:** GPT didn't respond or responded with malformed data.
- **Fix:**
  - Improved `build_grocery_prompt()` with strict JSON formatting instructions.
  - Added retry/debug logging in `grocery_service.py`.

### 4. **Test Case Flakiness**
- **Issue:** Sometimes grocery test passed, sometimes failed.
- **Cause:** GPT output variance, e.g., empty response or unstructured JSON.
- **Fix:** Verified response format with `print(response)` and tuned prompt to enforce strict JSON.

---

## ✅ Test Coverage Summary

| Test | Purpose | Status |
|------|---------|--------|
| `test_dosha.py` | Verifies dosha classification | ✅ Passes |
| `test_family.py` | Verifies merged meal plan for a family | ✅ Passes |
| `test_grocery.py` | Verifies grocery list generation from meal plan | ✅ Now stable (after re-prompting) |

---

## 📌 Notes for Future Devs

- **Prompt design is critical** – If GPT outputs are unstable, refine prompt instructions.
- **Catch JSONDecodeError** everywhere GPT is used.
- **Add retry logic** in `call_gpt()` if needed.
- **Frontend Tip:** Use loading spinners on all GPT-triggered requests (they can take 3–15s).

---

Let me know if you want this exported as a downloadable `.md` or added to your repo as `BACKEND_OVERVIEW.md`.