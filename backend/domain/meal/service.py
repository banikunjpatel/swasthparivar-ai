# domain/meal/service.py
from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, Tuple

from pydantic import ValidationError
from config.config import features, feature_flag
from domain.meal.variety import collect_dish_names, find_duplicates, filter_recent

from cache import Cache
from llm.client import LLMClient
from llm.prompt_renderer import render_prompt
from llm.schema_registry import schema_by_task
from .grocery_aggregators import aggregate_from_plan
from .models import (
    FamilyMember,
    GenerateMealPlanRequest,
    GenerateMealPlanResponse,
    MealPlanDocument,
    WeeklyMealPlan,
)
from .validators import infer_household, validate_week_start


SYSTEM_PROMPT = (
    "You are Prakriti Parivar, an expert in natural living and traditional wellness consultant. "
    "Generate a 7-day personalized meal plan for the entire family following natural living principles, "
    "Satvic guidelines, and seasonal wisdom. "
    "CRITICAL: Breakfast must be FRUITS ONLY (seasonal, regional). "
    "Lunch must be the LARGEST MEAL with dal, grain, vegetables, salad, and chaas. "
    "Dinner must be LIGHT and EARLY. "
    "NO REPETITION of dishes within the week. "
    "Output ONLY valid JSON matching the provided schema."
)

class MealPlanService:
    def __init__(self, llm: LLMClient, cache: Cache | None, rotation_repo=None, meal_plan_repo=None):
        self.llm = llm
        self.cache = cache
        self.rotation_repo = rotation_repo
        self.meal_plan_repo = meal_plan_repo

    def _cache_key(self, payload: dict) -> str:
        blob = json.dumps(payload, sort_keys=True).encode()
        return f"meal:{hashlib.sha256(blob).hexdigest()}"

    async def generate(self, req: GenerateMealPlanRequest) -> Tuple[WeeklyMealPlan, Dict[str, Any]]:
        validate_week_start(req.weekStart)
        h_type, size = infer_household(req.members)

        # Build LLM prompt
        prompt_version = (
            req.prompt_version
            or int(features().get("prompt_versions", {}).get("meal_plan", 1))
        )
        
        # Variety controls
        vcfg = features().get("variety", {}) if features() else {}
        enforce_unique = bool(vcfg.get("enforce_unique_daily", True))
        window_weeks = int(vcfg.get("rotation_weeks_window", 4))
        repair_attempts = int(vcfg.get("repair_attempts", 1))

        # Build avoid list from rotation history (optional DB)
        recent_set = set()
        if self.rotation_repo and window_weeks > 0:
            recent_set = await self.rotation_repo.recent_dishes(req.userId, window_weeks)

        context = {
            "week_start": req.weekStart,
            "region": req.region,
            "diet_type": req.dietType,
            "household": {"type": h_type, "size": size, "members": [m.model_dump() for m in req.members]},
            "avoid_dishes": sorted(list(recent_set)),
            "seed": f"{req.userId}:{req.weekStart}",
        }
        user_prompt = render_prompt("meal_plan", prompt_version, context)

        schema_name, schema = schema_by_task("meal_plan")

        # Cache
        ck_payload = {
            "w": req.weekStart,
            "r": req.region,
            "d": req.dietType,
            "m": [m.model_dump() for m in req.members],
            "pv": prompt_version,
            "mo": req.model,
        }
        ck = self._cache_key(ck_payload)
        if self.cache and not req.force:
            cached = await self.cache.get(ck)
            if cached:
                plan = WeeklyMealPlan.model_validate(cached["plan"])
                return plan, {**cached["meta"], "cached": True}

        # Call LLM
        resp = await self.llm.structured(
            task="meal_plan",
            system=SYSTEM_PROMPT,
            user=user_prompt,
            schema_name=schema_name,
            schema=schema,
            model_override=req.model,
            # Meal plans can be slower; allow a longer timeout
            timeout_s=int(features().get("meal_plan_timeout_s", 120)),
        )

        try:
            plan = WeeklyMealPlan.model_validate(resp.data)
        except ValidationError as ve:
            raise ValueError(f"Model returned invalid schema: {ve}")
        
        # ---- Uniqueness within week & rotation across weeks
        if enforce_unique or recent_set:
            names = collect_dish_names(plan)
            dups = find_duplicates(names) if enforce_unique else []
            recents = filter_recent(names, recent_set) if recent_set else []
            needs_repair = bool(dups or recents)

            attempts = 0
            while needs_repair and attempts < repair_attempts:
                attempts += 1
                # Re-ask with explicit avoid list (merge dups/recents)
                repair_avoid = sorted(list(set([*dups, *recents])))
                repair_ctx = {**context, "avoid_dishes": repair_avoid}
                user_prompt = render_prompt("meal_plan", prompt_version, repair_ctx)

                resp = await self.llm.structured(
                    task="meal_plan",
                    system=SYSTEM_PROMPT,
                    user=user_prompt,
                    schema_name=schema_name,
                    schema=schema,
                    model_override=req.model,
                )
                plan = WeeklyMealPlan.model_validate(resp.data)
                names = collect_dish_names(plan)
                dups = find_duplicates(names) if enforce_unique else []
                recents = filter_recent(names, recent_set) if recent_set else []
                needs_repair = bool(dups or recents)

        # Optional server-side aggregation (only works with old schema with recipe details)
        # New schema doesn't include recipe ingredients, so skip aggregation
        if bool(feature_flag("deterministic_grocery_aggregation", True)) and hasattr(plan, 'days'):
            try:
                items = aggregate_from_plan(plan)
                plan = WeeklyMealPlan(**{**plan.model_dump(), "groceryList": [i.model_dump() for i in items]})
            except (AttributeError, KeyError):
                # New schema structure doesn't support grocery aggregation
                pass

        meta = {"model": resp.model, "prompt_version": prompt_version, "cached": False}

        if self.cache:
            await self.cache.setex(ck, None, {"plan": plan.model_dump(), "meta": meta})

        # Persist to MongoDB (fire-and-forget — never blocks the response)
        if self.meal_plan_repo:
            try:
                doc = MealPlanDocument(
                    userId=req.userId,
                    plan=plan,
                    modelMeta=meta,
                ).model_dump(mode="json")
                doc["weekStart"] = req.weekStart
                doc["region"] = req.region
                doc["dietType"] = req.dietType
                await self.meal_plan_repo.save(doc)
            except Exception:
                pass

        # Record rotation for this user/week (optional if DB configured)
        if self.rotation_repo:
            try:
                await self.rotation_repo.record_week(req.userId, req.weekStart, collect_dish_names(plan))
            except Exception:
                pass  # don't block the response on rotation I/O

        return plan, meta
