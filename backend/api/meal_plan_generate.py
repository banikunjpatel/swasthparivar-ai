# api/v1/meal/meal_plan_generate.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from anthropic import (
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    APIConnectionError,
    APIStatusError,
)

from config.config import features
from domain.meal.models import GenerateMealPlanRequest, GenerateMealPlanResponse
from domain.meal.service import MealPlanService

from .deps import model_override, prompt_version_override

router = APIRouter(tags=["meal"])


@router.post("/meal-plan/generate", response_model=GenerateMealPlanResponse)
async def generate_meal_plan(
    request: Request,
    body: GenerateMealPlanRequest,
    x_model: str | None = Depends(model_override),
    x_prompt_ver: int | None = Depends(prompt_version_override),
):
    # Merge header overrides if allowed
    feats = features()
    allow_override = bool(feats.get("allow_model_override", True))
    model = x_model if (allow_override and x_model) else body.model
    prompt_version = x_prompt_ver if x_prompt_ver is not None else body.prompt_version

    svc = MealPlanService(
        llm=request.app.state.claude_llm,
        cache=request.app.state.cache,
        rotation_repo=getattr(request.app.state, "rotation_repo", None),
        meal_plan_repo=getattr(request.app.state, "meal_plan_repo", None),
    )
    final_req = body.model_copy(update={"model": model, "prompt_version": prompt_version})

    try:
        plan, meta = await svc.generate(final_req)
    except AuthenticationError:
        raise HTTPException(
            status_code=502,
            detail="Claude authentication failed — check ANTHROPIC_API_KEY in .env",
        )
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Claude rate limit reached — try again later")
    except (APITimeoutError, APIConnectionError):
        raise HTTPException(status_code=504, detail="Claude request timed out — try again")
    except APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error {e.status_code}: {e.message}")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return GenerateMealPlanResponse(
        plan=plan,
        meta=meta,
        user_id=final_req.userId,
        weekStartDate=final_req.weekStart,
    )


@router.get("/get-all-family-meals/{user_id}", tags=["meal"])
async def get_all_family_meals(user_id: str, request: Request):
    """Return all saved meal plans for a user, newest first."""
    repo = getattr(request.app.state, "meal_plan_repo", None)
    if not repo:
        return []
    plans = await repo.get_by_user(user_id)
    return plans
