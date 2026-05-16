# app/lifespan.py
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

import os
from db.mongo import init_mongo, close_mongo, db as mongo_db
from db.rotation_repo import RotationRepository
from db.meal_plan_repo import MealPlanRepository
from db.recipe_repo import RecipeRepository

from fastapi import FastAPI

from config.config import (
    features,
    feature_flag,
    llm_defaults,
    model_map,
    env as env_settings,
)
from cache import init_cache, close_cache
from llm.client import LLMClient
from llm.claude_client import ClaudeLLMClient

# Global LLM client reference
_llm_client: LLMClient | None = None
_claude_llm_client: ClaudeLLMClient | None = None


def get_llm_client() -> LLMClient:
    """Get the global LLM client instance."""
    if _llm_client is None:
        raise RuntimeError("LLM client not initialized")
    return _llm_client


def get_claude_llm_client() -> ClaudeLLMClient:
    """Get the global Claude LLM client instance."""
    if _claude_llm_client is None:
        raise RuntimeError("Claude LLM client not initialized")
    return _claude_llm_client


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    App startup/shutdown.
    - Initializes shared LLM client (task→model aware)
    - Initializes cache (optional, per features.yml)
    - Exposes config snapshots on app.state for easy access
    """
    global _llm_client, _claude_llm_client
    
    # ---- Resolve runtime config
    feat = features()
    timeout_s = int(llm_defaults()["request_timeout_s"])
    use_cache = bool(feature_flag("enable_caching", True))
    cache_ttl = int(feature_flag("cache_ttl_seconds", 604800))
    task_models = model_map()

    # ---- Init resources
    cache = await init_cache(enabled=use_cache, default_ttl_seconds=cache_ttl)
    llm = LLMClient(
        api_key=env_settings.OPENAI_API_KEY,
        request_timeout_s=timeout_s,
        task_model_map=task_models,
    )
    _llm_client = llm  # Store global reference
    
    claude_llm = ClaudeLLMClient(
        api_key=env_settings.ANTHROPIC_API_KEY,
        request_timeout_s=timeout_s,
        task_model_map={"meal_plan": "claude-opus-4-7"},
    )
    _claude_llm_client = claude_llm  # Store global reference
    
    db = await init_mongo(os.getenv("MONGO_URL"), os.getenv("MONGO_DB"))
    rotation_repo = RotationRepository(db) if db else None
    meal_plan_repo = MealPlanRepository(mongo_db)
    recipe_repo = RecipeRepository(mongo_db)

    app.state.db = db
    app.state.rotation_repo = rotation_repo
    app.state.meal_plan_repo = meal_plan_repo
    app.state.recipe_repo = recipe_repo

    # ---- Expose on app.state
    app.state.features = feat
    app.state.model_map = task_models
    app.state.cache = cache
    app.state.llm = llm
    app.state.claude_llm = claude_llm

    try:
        yield
    finally:
        # ---- Graceful shutdown
        await close_cache(cache)
        await close_mongo()
        await llm.aclose()
        await claude_llm.aclose()
        _llm_client = None
        _claude_llm_client = None