# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swasth Parivar AI is a full-stack Ayurvedic wellness platform that generates personalized family meal plans, recipes, and grocery lists using LLMs, based on each member's Prakriti (dosha constitution).

## Development Commands

### Backend (FastAPI + Python)

```bash
cd backend

# Install dependencies
pip install -e .[dev]          # dev dependencies
pip install -e .[redis]        # with optional Redis caching

# Run dev server (port 8000)
uvicorn app.app:create_app --factory --reload

# Run tests
pytest tests/
pytest tests/test_meal_plan.py  # single test file
pytest -k "test_name"           # single test by name
```

### Frontend (React + Vite)

```bash
cd client

npm install
npm run dev       # Vite dev server (port 5173)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Environment

Copy `.env` to the repo root. Both backend and frontend read from it. Key variables:
- `OPENAI_API_KEY`, `MONGODB_URL`, `JWT_SECRET`, `JWT_ALGORITHM`
- `VITE_API_URI` — backend URL used by the frontend (e.g. `http://127.0.0.1:8000/api/v1`)
- Firebase config vars, MSG91 SMS config

## Architecture

### Stack

- **Backend:** FastAPI (async) + Motor (MongoDB) + OpenAI structured outputs + Jinja2 prompt templates
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Firebase Auth + MUI
- **Auth:** Firebase on the client; JWT (python-jose) on the backend API
- **LLM:** OpenAI with structured JSON schema outputs; task-to-model routing via config

### Backend Layer Structure

```
backend/
├── app/app.py          # FastAPI factory, router registration, CORS
├── api/                # Route handlers (thin — validate & delegate to domain)
├── domain/             # Business logic & Pydantic schemas (meal/, prakriti/, recipe/, grocery/)
│   └── */service.py    # Services call LLM and repo layers
├── db/                 # Motor async MongoDB repositories
├── llm/                # LLM client, prompt renderer, schema registry, model router
│   ├── client.py       # AsyncOpenAI wrapper enforcing structured outputs
│   ├── prompt_renderer.py  # Renders Jinja2 templates from /prompts/
│   └── schema_registry.py  # JSON schema definitions for each task
├── prompts/            # Jinja2 templates: meal_plan.j2, recipe.j2, grocery.j2, prakriti.j2
├── config/
│   ├── setting.yml     # Server, CORS, LLM timeout defaults
│   ├── model_map.yml   # Task → OpenAI model assignments (e.g. meal_plan→gpt-4o)
│   └── features.yml    # Feature flags: use_structured_outputs, enable_caching, etc.
└── cache.py            # Optional Redis caching layer (7-day TTL)
```

All API endpoints are under `/api/v1`. The request flow is:
`api/ handler → domain/*/service.py → llm/client.py + db/*_repo.py`

### Frontend Structure

```
client/src/
├── contexts/AuthContext.tsx   # Firebase auth + JWT token lifecycle
├── apiCall/api.ts             # Fetch-based API client with automatic token refresh
├── components/                # Feature components (Assessment, Dashboard, MealPlan, etc.)
├── utils/ayurvedic-logic.ts   # Dosha calculation logic (client-side)
├── data/                      # Static Ayurvedic data and quiz questions
└── types/index.ts             # Shared TypeScript interfaces
```

### Key Domain Concepts

- **Prakriti** — User's Ayurvedic constitution (Vata/Pitta/Kapha distribution), determined by quiz + LLM
- **Family Member** — Individual profile with dosha type, dietary prefs, allergies; stored per user in MongoDB
- **Meal Plan** — 7-day × 3-meal plan for the whole family; variety enforcement prevents repeats within a 4-week window (`domain/meal/variety.py`)
- **Structured Outputs** — All LLM responses are validated against JSON schemas registered in `llm/schema_registry.py`; never free-form text

### Config-Driven Behavior

- `config/model_map.yml` controls which OpenAI model handles each task — change model assignments here, not in code
- `config/features.yml` controls feature flags (`use_structured_outputs`, `allow_model_override`, `enable_caching`, prompt versions) — use these for safe rollouts
- Prompt templates in `prompts/` are versioned via feature flags
