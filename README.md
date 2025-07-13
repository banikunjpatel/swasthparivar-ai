🌟 SwasthParivar AI – Personalized Family Wellness & Meal Planner
SwasthParivar AI is an AI-powered web application designed to help Indian families plan healthy, tasty, and culturally-relevant meals and wellness routines tailored to individual needs. It harmonizes family nutrition by combining Ayurvedic wisdom, seasonal ingredients, health conditions, and budget constraints, making holistic wellness accessible and practical.

📋 Table of Contents
✨ Features
🚀 Technology Stack
🛠 Setup Instructions
🤖 AI/ML Implementation
📂 Repository Structure
📊 Datasets & Sources
🔒 Ethical & Privacy Considerations
📈 Success Metrics
🔮 Future Enhancements
🎥 Demo & Presentation

✨ Features
✅ Family profile creation (up to 5 members) with:
Age, Gender, Culture,  Dietary Preferences, Health Conditions, Ayurvedic Dosha.
✅ AI-powered weekly meal plan:
Harmonized across family while respecting individual needs.
Recipes with cooking instructions & seasonal/local substitutes.
✅ Grocery list generator:
Categorized (Vegetables, Grains, Spices, etc.).
✅ Ayurvedic wellness suggestions:
Family yoga, massages, detox routines, dosha-balancing tips.
✅ Simple, homemaker-friendly, mobile-first UI.

🚀 Technology Stack
Component
Technology
Frontend
React 18+, TailwindCSS, PWA
Backend
Python (FastAPI)
Database
MongoDB
AI/ML Integration
OpenAI GPT-4 (via API)
Hosting
(e.g., Vercel + MongoDB Atlas)


🛠 Setup Instructions
Prerequisites
Node.js & npm
Python 3.9+
MongoDB (local or Atlas)
OpenAI API Key
JWT key
Steps
1️⃣ Clone the repository:
git clone https://github.com/banikunjpatel/swasthparivar-ai.git
cd swasthparivar-ai
2️⃣ Install frontend dependencies:
cd client
npm install
3️⃣ Install backend dependencies:
pip install -r requirements.txt
4️⃣ Configure environment:
Add your OpenAI API key & MongoDB URI
Add JWT Token for security
Add  ALLOWED_ORIGINS for CORS
Add VITE_API_URI for backend server URL  to .env file in root
5️⃣ Run backend server:
uvicorn app.main:app --reload
6️⃣ Run frontend:
cd client
npm start
7️⃣ Access the app at: http://localhost:3000

🤖 AI/ML Implementation
GPT-4 prompts are engineered to generate personalized Indian meal plans factoring:
Health conditions (diabetes, BP, etc.)
Dosha (Vata, Pitta, Kapha)
Dietary preferences (vegetarian, etc.)
Seasonal/local ingredients.
Rule-based post-processing layer ensures culturally appropriate and balanced outputs.

📂 Repository Structure
swasthparivar-ai/
├── client/
│   └── React app with UI components & assets
├── app/
│   └── FastAPI app with API endpoints & models
├── test/
│   └── Test cases to test API
├── README.md
└── requirements.txt

📊 Datasets & Sources
Ayurvedic dosha guidelines (compiled from public Ayurvedic texts)
Seasonal/local produce charts (ICMR & Ministry of Agriculture)
Recipe templates & nutritional recommendations (ICMR guidelines)

🔒 Ethical & Privacy Considerations
✅ All health data is optional, editable, and stored securely.
✅ GDPR-compliant consent practices.
✅ AI suggestions come with disclaimers:
“Consult your doctor in case of serious illness. These are wellness recommendations, not medical advice.”
✅ Transparent about AI-generated plans with clear source attribution.

📈 Success Metrics
🚀 50+ families onboarded in pilot.
😊 90%+ satisfaction with personalization.
⏳ 70% time saved in weekly planning.
🔥 High engagement with daily tips & grocery lists.

🔮 Future Enhancements
Advanced Ayurveda logic engine (region & time-aware)
Community recipe sharing & reviews
Grocery app integrations (BigBasket, JioMart)
Voice-first experience & regional language support
Wearable integration for nutrition & activity tracking

🎥 Demo & Presentation
Live Demo: https://swasthparivar-ai.vercel.app/

🌱 Built with ❤️ to help families thrive!
