# domain/recipe/service.py
from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, Tuple, Optional

from pydantic import ValidationError

from config.config import features
from cache import Cache
from llm.client import LLMClient
from llm.prompt_renderer import render_prompt
from llm.schema_registry import schema_by_task
from .models import GenerateRecipeRequest, GenerateRecipeResponse


SYSTEM_PROMPT = (
    "You are an expert Indian home-cooking chef. Generate precise, feasible recipes. "
    "Use metric units (g, kg, ml, L, pcs). Output ONLY valid JSON matching the schema."
)

class RecipeService:
    def __init__(self, llm: LLMClient, cache: Cache | None, recipe_repo=None):
        self.llm = llm
        self.cache = cache
        self.recipe_repo = recipe_repo

    def _cache_key(self, payload: dict) -> str:
        blob = json.dumps(payload, sort_keys=True).encode()
        return f"recipe:{hashlib.sha256(blob).hexdigest()}"

    async def generate(self, req: GenerateRecipeRequest) -> Tuple[GenerateRecipeResponse, Dict[str, Any]]:
        pv = req.prompt_version or int(features().get("prompt_versions", {}).get("recipe", 1))
        context = {
            "dish": req.dish,
            "region": req.region,
            "diet_type": req.dietType,
            "servings": req.servings,
        }
        
        # Check if recipe already exists in database (if not forcing regeneration)
        if self.recipe_repo and not req.force:
            existing = await self.recipe_repo.find_by_dish(
                dish=req.dish,
                region=req.region,
                diet_type=req.dietType,
                servings=req.servings,
                user_id=req.userId
            )
            if existing:
                # Update last accessed time
                if "_id" in existing:
                    await self.recipe_repo.update_access_time(existing["_id"])
                
                # Return existing recipe from database
                try:
                    data = GenerateRecipeResponse.model_validate({
                        **existing,
                        "meta": {
                            "model": existing.get("modelMeta", {}).get("model", "cached"),
                            "prompt_version": existing.get("modelMeta", {}).get("prompt_version", pv),
                            "cached": True,
                            "source": "database"
                        }
                    })
                    return data, {
                        "model": "cached",
                        "prompt_version": pv,
                        "cached": True,
                        "source": "database"
                    }
                except (ValidationError, KeyError):
                    pass  # Fall through to regenerate
        
        user_prompt = render_prompt("recipe", pv, context)
        schema_name, schema = schema_by_task("recipe")

        ck_payload = {
            "dish": req.dish,
            "reg": req.region,
            "diet": req.dietType,
            "srv": req.servings,
            "pv": pv,
            "mo": req.model,
        }
        ck = self._cache_key(ck_payload)
        
        # Check cache (Redis/memory)
        if self.cache and not req.force:
            cached = await self.cache.get(ck)
            if cached:
                try:
                    return GenerateRecipeResponse.model_validate(cached["data"]), {**cached["meta"], "cached": True, "source": "cache"}
                except ValidationError:
                    pass  # fall through to regenerate

        # Generate new recipe from LLM
        resp = await self.llm.structured(
            task="recipe",
            system=SYSTEM_PROMPT,
            user=user_prompt,
            schema_name=schema_name,
            schema=schema,
            model_override=req.model,
        )

        try:
            data = GenerateRecipeResponse.model_validate({
                **resp.data,
                "meta": {
                    "model": resp.model,
                    "prompt_version": pv,
                    "cached": False,
                    "source": "llm"
                }
            })
        except ValidationError as ve:
            raise ValueError(f"Model returned invalid recipe schema: {ve}")

        # Save to cache
        if self.cache:
            await self.cache.setex(
                ck,
                None,
                {
                    "data": data.model_dump(),
                    "meta": {
                        "model": resp.model,
                        "prompt_version": pv,
                        "cached": False,
                        "source": "llm"
                    }
                }
            )

        # Save to database (fire-and-forget)
        if self.recipe_repo:
            try:
                doc = {
                    "userId": req.userId,
                    "dish": req.dish,
                    "region": req.region,
                    "dietType": req.dietType,
                    "servings": req.servings,
                    "recipe": data.recipe.model_dump(),
                    "notes": data.notes,
                    "modelMeta": {
                        "model": resp.model,
                        "prompt_version": pv
                    }
                }
                await self.recipe_repo.save(doc)
            except Exception as e:
                # Don't block response on DB save failure
                print(f"Failed to save recipe to database: {e}")

        return data, {
            "model": resp.model,
            "prompt_version": pv,
            "cached": False,
            "source": "llm"
        }
