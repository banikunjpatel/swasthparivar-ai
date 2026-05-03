# Requirements Document

## Introduction

Swasth Parivar is a family wellness AI web application that combines Ayurvedic principles with modern AI to deliver personalized nutrition and lifestyle guidance. Users register a household, add family members with individual profiles, complete a Prakriti (Ayurvedic body-type) assessment for each member, and then generate AI-powered weekly meal plans tailored to the combined dosha profile of the family. The system also generates a weekly grocery list derived from the meal plan and provides seasonal and constitution-specific wellness guidance.

The backend is a FastAPI service backed by MongoDB and Firebase Authentication. Authentication uses a two-tier approach: Firebase handles user identity verification (email/password, Google OAuth, phone OTP), and the backend issues JWT tokens for API session management. The frontend is a React + TypeScript SPA styled with Tailwind CSS. AI generation is handled by an LLM client with prompt versioning, response caching, and schema-validated structured output.

---

## Glossary

- **User**: An authenticated account holder who owns a household.
- **Family_Member**: A profile within a household representing one person (may be the user themselves or a relative).
- **Prakriti**: An individual's Ayurvedic constitutional type, determined by a questionnaire.
- **Dosha**: One of three bio-energies in Ayurveda — Vata, Pitta, or Kapha — that describe physiological and psychological tendencies.
- **Tridoshic**: A balanced constitution where no single dosha dominates.
- **Dosha_Distribution**: Percentage breakdown of Vata, Pitta, and Kapha that sums to 100.
- **Assessment**: The 15-question visual quiz used to determine a Family_Member's Prakriti.
- **Meal_Plan**: A 7-day Ayurvedic meal schedule covering morning, breakfast, lunch, evening snack, and dinner for each day.
- **Grocery_List**: An aggregated list of ingredients derived from a Meal_Plan, grouped by category with estimated Indian Rupee prices.
- **Recipe**: A detailed cooking instruction set for a named dish, including ingredients, steps, prep/cook times, dosha balance, and nutrition.
- **Rutucharya**: Ayurvedic seasonal lifestyle guidance covering foods to favor/avoid and lifestyle tips per season.
- **Wellness_Tips**: Personalized daily and seasonal health recommendations based on a member's Prakriti and the current season.
- **LLM**: Large Language Model used to generate Prakriti assessments, meal plans, recipes, and grocery lists.
- **Cache**: A server-side in-memory key-value store used to avoid redundant LLM calls.
- **Firebase**: Google's authentication platform used for identity management (email/password, Google OAuth, phone OTP).
- **Firebase_ID_Token**: A JWT token issued by Firebase after successful authentication, verified by the backend.
- **JWT**: JSON Web Token used by the backend for session management after Firebase verification.
- **Access_Token**: Short-lived JWT token (default 30 minutes) used for API authentication.
- **Refresh_Token**: Long-lived JWT token (default 7 days) used to obtain new access tokens.
- **Region**: An Indian geographic area (e.g., "Karnataka", "Punjab") used to regionalise meal plans.
- **Diet_Type**: Dietary preference — one of `veg`, `non_veg`, or `eggs_ok`.
- **Season**: One of six Indian seasons — spring, summer, monsoon, autumn, winter, pre-winter.

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a new visitor, I want to create an account and sign in, so that my family data and meal plans are securely stored and accessible across sessions.

#### Acceptance Criteria

1. WHEN a user submits a valid Firebase ID token via `POST /api/v1/users/register`, THE Backend SHALL verify the token with Firebase Admin SDK and create a new user document in MongoDB if one does not already exist for that Firebase UID or email.
2. WHEN a user is created or updated via `/register`, THE Backend SHALL store `firebase_uid`, `email`, `phone`, `emailVerified`, `created_at`, and `updated_at` in the MongoDB `users` collection.
3. WHEN a user submits a Firebase UID via `POST /api/v1/users/login`, THE Backend SHALL look up the user by `firebase_uid` and return the user's profile if found.
4. IF a login request is made with a Firebase UID that does not exist in MongoDB, THEN THE Backend SHALL return HTTP 401 with the message "User does not exist. Please sign up first."
5. THE Auth_Modal SHALL support email/password sign-in and sign-up using Firebase Authentication client SDK.
6. THE Auth_Modal SHALL support Google OAuth sign-in via Firebase `signInWithPopup`.
7. THE Auth_Modal SHALL support phone number OTP sign-in using Firebase `signInWithPhoneNumber` with an invisible reCAPTCHA verifier.
8. WHEN a new user registers with email/password, THE Auth_Modal SHALL trigger a Firebase email verification and display a success message to the user.
9. WHEN Firebase authentication succeeds, THE Frontend SHALL obtain a Firebase ID token and send it to the backend `/register` or `/login` endpoint.
10. WHEN the backend successfully registers or logs in a user, THE Auth_Context SHALL store the Firebase ID token as `accessToken` in `localStorage` and persist the user object.
11. WHEN authentication succeeds, THE Auth_Context SHALL set `isAuthenticated` to `true` and display the personalised dashboard.
12. WHEN a user signs out, THE Auth_Context SHALL call Firebase `signOut()`, clear `localStorage` tokens and user data, and set `isAuthenticated` to `false`.
13. WHEN the app initializes, THE Auth_Context SHALL check for stored `accessToken` and `user` in `localStorage` and rehydrate the authenticated state if both exist.
14. IF a Firebase authentication error occurs (e.g., wrong password, email already in use), THEN THE Auth_Modal SHALL display a human-readable error message mapped from the Firebase error code.
15. THE Backend SHALL support JWT token generation with configurable expiry (default: 30 minutes for access tokens, 7 days for refresh tokens) using environment variables `ACCESS_TOKEN_MIN` and `REFRESH_TOKEN_DAYS`.
16. THE Backend SHALL use `JWT_SECRET`, `JWT_ALGORITHM`, and `JWT_ISSUER` environment variables for token signing and verification.

---

### Requirement 2: Family Member Management

**User Story:** As an authenticated user, I want to add, edit, and remove family members, so that I can maintain individual profiles for each person in my household.

#### Acceptance Criteria

1. WHEN a user submits a valid member payload to `POST /api/v1/member`, THE Members_Service SHALL create a new member document with `createdAt` and `updatedAt` timestamps.
2. WHEN a user requests `GET /api/v1/members/{user_id}`, THE Members_Service SHALL return all member documents whose `userId` field matches the given user ID.
3. WHEN a user submits a partial update to `PUT /api/v1/members/{member_id}`, THE Members_Service SHALL apply only the provided fields and update the `updatedAt` timestamp.
4. IF a `PUT` or `DELETE` request references a `member_id` that does not exist, THEN THE Members_Service SHALL return HTTP 404 with the message "Member not found".
5. WHEN a user confirms deletion via `DELETE /api/v1/members/{member_id}`, THE Members_Service SHALL permanently remove the member document.
6. THE Add_Family_Member_Modal SHALL validate that `fullName` is non-empty, `age` is between 1 and 99, and `state` (Indian region) is selected before submitting.
7. IF validation fails on the Add_Family_Member_Modal, THEN THE Modal SHALL highlight the invalid fields without submitting the form.
8. THE Family_Members_View SHALL display a summary card for each member showing name, age, gender, and Prakriti assessment status badge ("Assessed ✔" or "Not Assessed").
9. THE Family_Members_View SHALL display aggregate statistics including total member count and number of vegetarian members.
10. WHEN no family members exist, THE App SHALL display a prompt guiding the user to add their first family member.

---

### Requirement 3: Prakriti Assessment

**User Story:** As a family member, I want to complete a visual questionnaire about my physical and mental characteristics, so that the system can determine my Ayurvedic body type (Prakriti).

#### Acceptance Criteria

1. THE Prakriti_Quiz SHALL present 15 questions covering physical traits (body frame, weight, skin, sweat, temperature, hair) and mental traits (hunger, digestion, sleep, focus, work style, speech, emotions, memory).
2. WHEN a user selects an answer for the current question, THE Prakriti_Quiz SHALL enable the "Next" button and record the answer keyed by question ID.
3. WHEN a user reaches the last question and clicks "Review Answers", THE Prakriti_Quiz SHALL transition to a review screen showing all questions and selected answers.
4. WHEN a user submits the completed questionnaire, THE Prakriti_Quiz SHALL call `POST /api/v1/prakriti/assessment` with the member's profile (name, age, gender, region) and all question-answer pairs.
5. WHEN the Prakriti_Service receives a valid assessment request, THE Prakriti_Service SHALL call the LLM with a structured prompt and return a `GeneratePrakritiResponse` containing `primaryDosha`, optional `secondaryDosha`, `distribution` (vata/pitta/kapha percentages summing to 100), `guidance` (foods to favor, foods to avoid, lifestyle tips), and optional `notes`.
6. WHEN the LLM returns a valid Prakriti response, THE Prakriti_Service SHALL cache the result keyed by a SHA-256 hash of the profile and answers for the configured TTL (default 7 days).
7. IF the LLM response fails Pydantic schema validation, THEN THE Prakriti_Service SHALL raise a `RuntimeError` with the raw response for debugging.
8. WHEN a Prakriti assessment completes successfully, THE Prakriti_Quiz SHALL call `PUT /api/v1/members/{member_id}` to persist the full assessment (primaryDosha, secondaryDosha, distribution, guidance, notes, assessedAt, version) on the member document.
9. WHEN a member has a completed Prakriti assessment, THE Family_Members_View SHALL display the Prakriti_Details_Card showing primary/secondary dosha badges, a visual dosha distribution bar chart, and an expandable section with foods to favor, foods to avoid, and lifestyle tips.
10. THE Prakriti_Quiz SHALL support navigating backwards through questions without losing previously recorded answers.

---

### Requirement 4: AI-Powered Weekly Meal Plan Generation

**User Story:** As a family, we want to generate a 7-day Ayurvedic meal plan that respects each member's dosha and our regional food preferences, so that we eat in harmony with our constitutions.

#### Acceptance Criteria

1. WHEN a user triggers meal plan generation via `POST /api/v1/meal-plan/generate`, THE Meal_Plan_Service SHALL accept `userId`, `weekStart` (ISO date string), `region`, `dietType`, and a list of family members each with `name` and `dosha`.
2. THE Meal_Plan_Service SHALL validate that `weekStart` is a valid date string and infer household type (`single` or `family`) and size from the members list.
3. WHEN generating a meal plan, THE Meal_Plan_Service SHALL render a versioned Jinja2 prompt that includes week start, region, diet type, household details, and an optional list of dishes to avoid (from rotation history).
4. THE LLM SHALL return a `WeeklyMealPlan` containing a `title`, `subtitle`, `region`, `diet_type`, `constitution`, exactly 7 `week_plan` entries (Monday through Sunday), at least 3 `key_guidelines`, `regional_notes`, and an optional `previous_region_comparison`.
5. EACH day in the `week_plan` SHALL include five meal slots: `morning`, `breakfast`, `lunch`, `evening`, and `dinner`.
6. WHEN the `variety` feature flag `enforce_unique_daily` is enabled, THE Meal_Plan_Service SHALL detect duplicate dish names within the generated week and re-request the LLM up to `repair_attempts` times with the duplicates added to the avoid list.
7. WHEN a rotation repository is configured, THE Meal_Plan_Service SHALL load recently used dish names from the past `rotation_weeks_window` weeks and include them in the avoid list to prevent repetition across weeks.
8. WHEN a valid meal plan is generated, THE Meal_Plan_Service SHALL cache the result keyed by a hash of weekStart, region, dietType, members, prompt version, and model.
9. WHEN a cached meal plan exists and `force` is `false`, THE Meal_Plan_Service SHALL return the cached plan without calling the LLM.
10. THE Meal_Plan_View SHALL display the weekly plan in a 7-column grid (desktop) or stacked card layout (mobile), with colour-coded cards for breakfast (yellow), lunch (green), and dinner (purple).
11. THE Meal_Plan_View SHALL support day-view and week-view toggle modes with previous/next navigation.
12. WHEN a meal plan already exists for the selected week, THE Meal_Plan_View SHALL disable the "Generate New Plan" button for that week.
13. WHEN a user clicks a meal card, THE App SHALL fetch and display the full recipe for that dish via the Recipe generation endpoint.
14. THE Dashboard SHALL display today's breakfast, lunch, and dinner from the current week's meal plan in a "Today's Meal Highlights" card.

---

### Requirement 5: AI-Powered Recipe Generation

**User Story:** As a user, I want to view a detailed recipe for any meal in my plan, so that I know exactly how to prepare it.

#### Acceptance Criteria

1. WHEN a user clicks a meal name in the Meal_Plan_View, THE App SHALL call `POST /api/v1/recipe/generate` with the dish name, region, diet type, and serving count.
2. WHEN the Recipe_Service receives a valid request, THE Recipe_Service SHALL call the LLM with a structured prompt and return a `GenerateRecipeResponse` containing `dish`, `region`, `dietType`, `servings`, and a `RecipeDetail` with `ingredients` (name, qty, unit, category), `steps`, `prep_mins`, and `cook_mins`.
3. THE LLM-generated recipe SHALL include 6–16 ingredients with metric units, 4–10 preparation steps, dosha balance percentages, season suitability tags, difficulty level, nutritional information (calories, protein, carbs, fat, fiber, vitamins, minerals), and ingredient substitutes.
4. WHEN a recipe is generated, THE Recipe_Service SHALL cache the result keyed by dish, region, diet type, servings, prompt version, and model.
5. WHEN a cached recipe exists and `force` is `false`, THE Recipe_Service SHALL return the cached recipe without calling the LLM.
6. THE Recipe_Detail_Component SHALL display the recipe in a modal overlay with ingredients list, step-by-step instructions, prep/cook times, and nutritional information.

---

### Requirement 6: AI-Powered Grocery List Generation

**User Story:** As a family, I want an auto-generated weekly grocery list derived from our meal plan, so that I can shop efficiently without manually listing ingredients.

#### Acceptance Criteria

1. WHEN a user navigates to the Grocery section, THE Grocery_List_Component SHALL fetch the grocery list for the currently selected week by calling the backend grocery endpoint with the matched meal plan days.
2. WHEN the Grocery_Service receives a request with a `mealPlan` payload, THE Grocery_Service SHALL aggregate ingredients from the meal plan server-side without calling the LLM.
3. WHEN the Grocery_Service receives a request without a `mealPlan` payload and `use_llm` is `true`, THE Grocery_Service SHALL call the LLM with region, diet type, and household size to generate a grocery list.
4. THE Grocery_List_Component SHALL display items grouped by category: Vegetables, Grains & Pulses, Spices & Herbs, Dairy & Substitutes, Fruits, and Miscellaneous.
5. EACH grocery item SHALL display its name, quantity, and estimated price in Indian Rupees (₹).
6. THE Grocery_List_Component SHALL display summary cards showing total item count, estimated total cost, and collected item count.
7. THE Grocery_List_Component SHALL display a shopping progress bar showing the percentage of items marked as collected.
8. WHEN a user checks an item's checkbox, THE Grocery_List_Component SHALL toggle that item's `collected` state and update the progress bar.
9. THE Grocery_List_Component SHALL support week navigation (previous/next week) to view grocery lists for different weeks.
10. WHEN no meal plan exists for the selected week, THE Grocery_List_Component SHALL display a message prompting the user to generate a meal plan first.
11. THE App SHALL expose `GET /api/v1/grocery/categories` to return the list of supported grocery categories from a static JSON file.

---

### Requirement 7: Seasonal Wellness Guidance (Rutucharya)

**User Story:** As a user, I want to receive Ayurvedic seasonal lifestyle guidance tailored to my dosha, so that I can align my diet and habits with the current season.

#### Acceptance Criteria

1. THE Rutucharya_Guide SHALL support six Indian seasons: spring, summer, monsoon, autumn, winter, and pre-winter.
2. THE Rutucharya_Guide SHALL allow the user to select any season and any dosha (Vata, Pitta, Kapha) independently via toggle buttons.
3. WHEN a season and dosha are selected, THE Rutucharya_Guide SHALL display foods to favor, foods to avoid, lifestyle tips, and dosha-specific personalised guidance for that combination.
4. THE App SHALL automatically detect the current season and pre-select it when the Rutucharya_Guide is first rendered.
5. WHEN the selected season matches the current season, THE Rutucharya_Guide SHALL display a "Current Season" badge and a transition notice reminding the user to gradually adapt as seasons change.

---

### Requirement 8: Personalised Wellness Tips

**User Story:** As a family, we want personalised daily and seasonal wellness tips for each member based on their Prakriti, so that everyone follows constitution-appropriate health practices.

#### Acceptance Criteria

1. THE Wellness_Tips_View SHALL display a "Today's Wellness Tip" card with a fixed daily Ayurvedic morning ritual recommendation.
2. THE Wellness_Tips_View SHALL display a seasonal wellness guide with tips specific to the current season.
3. THE Wellness_Tips_View SHALL display constitution-specific tips for each family member based on their Prakriti (Vata, Pitta, or Kapha).
4. WHEN a user selects a specific family member from the filter dropdown, THE Wellness_Tips_View SHALL show only that member's constitution-specific tips.
5. WHEN "All Members" is selected, THE Wellness_Tips_View SHALL display constitution tips for every family member in a responsive grid.

---

### Requirement 9: LLM Infrastructure and Caching

**User Story:** As a system operator, I want the AI generation pipeline to be reliable, versioned, and cost-efficient, so that responses are consistent and redundant LLM calls are avoided.

#### Acceptance Criteria

1. THE LLM_Client SHALL support structured output generation by passing a JSON schema to the model and returning a validated `StructuredResult` containing `data` (parsed dict), `model` (model name used), and `raw` (SDK response).
2. THE Prompt_Renderer SHALL load versioned Jinja2 templates from `backend/prompts/{task}/v{version}.j2` and render them with the provided context dictionary.
3. THE Schema_Registry SHALL map task names (`prakriti_assessment`, `meal_plan`, `recipe`, `grocery`) to their corresponding JSON schema files in `backend/schemas/`.
4. WHEN an `X-Model` header is present and the `allow_model_override` feature flag is `true`, THE API SHALL use the overridden model instead of the default.
5. WHEN an `X-Prompt-Ver` header is present, THE API SHALL use the specified prompt version instead of the configured default.
6. THE Cache SHALL store LLM responses keyed by a SHA-256 hash of the request payload (excluding non-deterministic fields) with a configurable TTL (default 604800 seconds / 7 days) in an in-memory store.
7. WHEN a cache hit occurs, THE Service SHALL set `meta.cached = true` in the response without calling the LLM.
8. WHEN `force = true` is passed in a request, THE Service SHALL bypass the cache and call the LLM regardless of cached state.
9. THE Meal_Plan_Service SHALL apply a configurable timeout (default 120 seconds) to LLM calls for meal plan generation.

---

### Requirement 10: Dashboard and Navigation

**User Story:** As an authenticated user, I want a central dashboard that summarises my family's wellness status and provides quick access to all features, so that I can navigate the app efficiently.

#### Acceptance Criteria

1. WHEN a user is authenticated, THE Dashboard SHALL display a personalised greeting with the user's name, current date, current season, family member count, and an "AI-Powered Wellness" indicator.
2. THE Dashboard SHALL display four stat cards: Dosha Balance percentage, Days Planned (weeks × 7), Recipes Available (weeks × 7 × 3), and Current Season.
3. THE Dashboard SHALL display a "Today's Meal Highlights" card showing breakfast, lunch, and dinner for the current day from the active meal plan.
4. THE Dashboard SHALL display a "Quick Actions" panel with buttons to navigate to Meal Plan, Grocery, and Daily Guidance sections.
5. THE Header SHALL provide navigation links to: Dashboard, Family Members, Meal Plan, Grocery, Guidance, and Wellness sections.
6. WHEN a user is not authenticated, THE Dashboard SHALL display a landing section describing the app's three core features: Family Profiles, AI Meal Planning, and Wellness Guidance.
7. WHEN a user is not authenticated and clicks "Start Your Journey", THE App SHALL open the authentication modal.
8. THE App SHALL support responsive layouts: single-column on mobile, multi-column grid on desktop (lg breakpoint and above).
