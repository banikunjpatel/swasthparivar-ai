# api/v1/prakriti/prakriti_assessment.py
from __future__ import annotations

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Dict

from config.config import features
from domain.prakriti.models import GeneratePrakritiRequest, GeneratePrakritiResponse
from domain.prakriti.service import PrakritiService
from domain.prakriti.rule_based_service import RuleBasedPrakritiService
from .deps import model_override, prompt_version_override

router = APIRouter(tags=["prakriti"])


class RuleBasedAssessmentRequest(BaseModel):
    """Request for rule-based prakriti assessment"""
    memberId: str = Field(..., description="Member ID for tracking")
    answers: Dict[str, str] = Field(..., description="Quiz answers mapping question ID to answer (A/B/C)")


@router.post("/prakriti/assessment", response_model=GeneratePrakritiResponse)
async def prakriti_assessment(
    request: Request,
    body: GeneratePrakritiRequest,
    x_model: str | None = Depends(model_override),
    x_prompt_ver: int | None = Depends(prompt_version_override),
):
    """Legacy LLM-based prakriti assessment (deprecated)"""
    feats = features()
    allow_override = bool(feats.get("allow_model_override", True))
    model = x_model if (allow_override and x_model) else body.model
    prompt_version = x_prompt_ver if x_prompt_ver is not None else body.prompt_version

    svc = PrakritiService(llm=request.app.state.claude_llm, cache=request.app.state.cache)
    final_req = body.model_copy(update={"model": model, "prompt_version": prompt_version})

    data, meta = await svc.generate(final_req)
    return data


@router.post("/prakriti/assessment/rule-based", response_model=GeneratePrakritiResponse)
async def rule_based_prakriti_assessment(body: RuleBasedAssessmentRequest):
    """
    Rule-based prakriti assessment without LLM.
    Calculates dosha and element percentages directly from quiz answers.
    
    Answer mapping:
    - A = Vata
    - B = Pitta
    - C = Kapha
    
    Returns percentages that sum to exactly 100.
    """
    try:
        if not body.answers:
            raise HTTPException(status_code=400, detail="No answers provided")
        
        # Calculate assessment using rule-based service
        result = RuleBasedPrakritiService.calculate_from_answers(body.answers)
        
        return result
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")
