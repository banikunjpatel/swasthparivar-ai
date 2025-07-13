# 🌟 SwasthParivar AI – Personalized Family Wellness & Meal Planner

**SwasthParivar AI** is an AI-powered web application designed to help Indian families plan **healthy, tasty, and culturally-relevant** meals and wellness routines tailored to individual needs. It harmonizes family nutrition by combining **Ayurvedic wisdom**, **seasonal ingredients**, **health conditions**, and **budget constraints**, making holistic wellness accessible and practical.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Technology Stack](#-technology-stack)
- [🛠 Setup Instructions](#-setup-instructions)
- [🤖 AI/ML Implementation](#-aiml-implementation)
- [📂 Repository Structure](#-repository-structure)
- [📊 Datasets & Sources](#-datasets--sources)
- [🔒 Ethical & Privacy Considerations](#-ethical--privacy-considerations)
- [📈 Success Metrics](#-success-metrics)
- [🔮 Future Enhancements](#-future-enhancements)
- [🎥 Demo & Presentation](#-demo--presentation)

---

## ✨ Features

✅ **Family profile creation** (up to 5 members) with:
- Age, Gender, Culture, Dietary Preferences, Health Conditions, Ayurvedic Dosha

✅ **AI-powered weekly meal plan**:
- Harmonized across family while respecting individual needs  
- Recipes with cooking instructions & seasonal/local substitutes

✅ **Grocery list generator**:
- Categorized (Vegetables, Grains, Spices, etc.)

✅ **Ayurvedic wellness suggestions**:
- Family yoga, massages, detox routines, dosha-balancing tips

✅ **Simple, homemaker-friendly, mobile-first UI**

---

## 🚀 Technology Stack

| Component         | Technology                       |
|------------------|----------------------------------|
| **Frontend**      | React 18+, TailwindCSS, PWA      |
| **Backend**       | Python (FastAPI)                 |
| **Database**      | MongoDB                          |
| **AI/ML**         | OpenAI GPT-4 (via API)           |
| **Hosting**       | Vercel, MongoDB Atlas (example)  |

---

## 🛠 Setup Instructions

### ✅ Prerequisites

- Node.js & npm
- Python 3.9+
- MongoDB (local or Atlas)
- OpenAI API Key
- JWT Secret Key

### 🧪 Steps to Run

1. **Clone the repository**

    ```bash
    git clone https://github.com/banikunjpatel/swasthparivar-ai.git
    cd swasthparivar-ai
    ```

2. **Install frontend dependencies**

    ```bash
    cd client
    npm install
    ```

3. **Install backend dependencies**

    ```bash
    pip install -r requirements.txt
    ```

4. **Configure environment variables**

    Create a `.env` file in the root directory and add the following:

    ```env
    OPENAI_API_KEY=your_openai_key
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ALLOWED_ORIGINS=http://localhost:3000
    VITE_API_URI=http://localhost:8000
    ```

5. **Run backend server**

    ```bash
    uvicorn app.main:app --reload
    ```

6. **Run frontend**

    ```bash
    cd client
    npm start
    ```

7. **Access the app**

    Open your browser and go to:  
    [http://localhost:3000](http://localhost:3000)

## 🤖 AI/ML Implementation

GPT-4 is used to generate personalized Indian meal plans by considering:

- Health conditions (e.g., diabetes, blood pressure)
- Ayurvedic Doshas (Vata, Pitta, Kapha)
- Dietary preferences (e.g., vegetarian, vegan)
- Seasonal and local ingredients

A rule-based post-processing layer ensures culturally appropriate and nutritionally balanced outputs.

---

## 📂 Repository Structure

swasthparivar-ai/
├── client/ # React app with UI components & assets
├── app/ # FastAPI app with API endpoints & models
├── test/ # Test cases for APIs
├── README.md # Project documentation
└── requirements.txt

---


## 📊 Datasets & Sources

- Ayurvedic Dosha guidelines (compiled from public Ayurvedic texts)
- Seasonal/local produce charts (ICMR & Ministry of Agriculture)
- Recipe templates and nutritional recommendations (ICMR guidelines)

---

## 🔒 Ethical & Privacy Considerations

- ✅ All health data is optional, editable, and securely stored
- ✅ GDPR-compliant user consent and data handling
- ✅ AI-generated suggestions include the disclaimer:  
  > “Consult your doctor in case of serious illness. These are wellness recommendations, not medical advice.”
- ✅ Transparent AI usage and clear source attribution

---

## 📈 Success Metrics

- 🚀 50+ families onboarded in pilot
- 😊 90%+ satisfaction with personalization
- ⏳ 70% time saved in weekly meal planning
- 🔥 High engagement with daily wellness tips and grocery list features

---

## 🔮 Future Enhancements

- Advanced Ayurveda logic engine (region & season-aware)
- Community recipe sharing & reviews
- Grocery app integrations (e.g., BigBasket, JioMart)
- Voice-first experience & multilingual support
- Integration with fitness wearables for nutrition/activity tracking

---

## 🎥 Demo & Presentation

- 🔗 **Live Demo**: [https://swasthparivar-ai.vercel.app/](https://swasthparivar-ai.vercel.app/)
- 🎬 **Presentation Video**: _[Insert Link]_

---

> 🌱 *Built with ❤️ to help families thrive!
