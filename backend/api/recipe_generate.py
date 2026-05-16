# api/v1/recipe/recipe_generate.py
from __future__ import annotations

from fastapi import APIRouter, Depends, Request, HTTPException
from anthropic import (
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    APIConnectionError,
    APIStatusError,
    BadRequestError,
)

from config.config import features
from domain.recipe.models import GenerateRecipeRequest, GenerateRecipeResponse
from domain.recipe.service import RecipeService
from .deps import model_override, prompt_version_override

router = APIRouter(tags=["recipe"])

@router.post("/recipe/generate", response_model=GenerateRecipeResponse)
async def generate_recipe(
    request: Request,
    body: GenerateRecipeRequest,
    x_model: str | None = Depends(model_override),
    x_prompt_ver: int | None = Depends(prompt_version_override),
):
    feats = features()
    allow_override = bool(feats.get("allow_model_override", True))
    model = x_model if (allow_override and x_model) else body.model
    prompt_version = x_prompt_ver if x_prompt_ver is not None else body.prompt_version

    svc = RecipeService(
        llm=request.app.state.claude_llm,  # Use Claude instead of OpenAI
        cache=request.app.state.cache,
        recipe_repo=getattr(request.app.state, "recipe_repo", None)
    )
    final_req = body.model_copy(update={"model": model, "prompt_version": prompt_version})

    try:
        data, meta = await svc.generate(final_req)
        # service already embeds meta; return unified object
        return data
    except AuthenticationError:
        raise HTTPException(
            status_code=502,
            detail="Claude authentication failed — check ANTHROPIC_API_KEY in .env",
        )
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Claude rate limit reached — try again later")
    except (APITimeoutError, APIConnectionError):
        raise HTTPException(status_code=504, detail="Claude request timed out — try again")
    except BadRequestError as e:
        raise HTTPException(status_code=400, detail=f"Claude API error: {e.message}")
    except APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error {e.status_code}: {e.message}")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {str(e)}")
