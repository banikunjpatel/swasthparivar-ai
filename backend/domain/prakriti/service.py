# domain/prakriti/service.py
from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, Tuple

from pydantic import ValidationError

from config.config import features
from cache import Cache
from llm.client import LLMClient
from llm.prompt_renderer import render_prompt
from .models import GeneratePrakritiRequest, GeneratePrakritiResponse
from .validators import ensure_questions_reasonable

SYSTEM_PROMPT = (
    "You are an Ayurvedic expert. Analyze each answer carefully according to Ayurvedic principles:\n"
    "- Identify the primary and secondary dosha.\n"
    "- Provide dosha distribution percentages (vata, pitta, kapha) that sum to 100.\n"
    "- Recommend foods to favor and avoid.\n"
    "- Suggest lifestyle tips.\n"
    "Respond ONLY in strict JSON matching the schema: {primaryDosha, secondaryDosha, distribution, guidance, notes, meta}."
)


class PrakritiService:
    def __init__(self, llm: LLMClient, cache: Cache | None):
        self.llm = llm
        self.cache = cache

    def _ck(self, payload: dict) -> str:
        blob = json.dumps(payload, sort_keys=True).encode()
        return f"prakriti:{hashlib.sha256(blob).hexdigest()}"

    async def generate(
        self, req: GeneratePrakritiRequest
    ) -> Tuple[GeneratePrakritiResponse, Dict[str, Any]]:
        ensure_questions_reasonable(len(req.questions))

        # -------------------------------
        # 1. Build GPT input context
        # -------------------------------
        gpt_context = {
            "profile": req.profile.model_dump() if req.profile else {},
            "questions": [{"question": q.question, "answer": q.answer} for q in req.questions],
        }

        cache_key = self._ck(gpt_context)

        # -------------------------------
        # 2. Check cache
        # -------------------------------
        if self.cache:
            cached = await self.cache.get(cache_key)
            if cached:
                # Cache stores dicts (see Cache.setex + GroceryService), not JSON strings
                parsed = GeneratePrakritiResponse.model_validate(cached)
                parsed.meta.cached = True
                return parsed, parsed.meta

        # -------------------------------
        # 3. Render user prompt
        # -------------------------------
        user_prompt = render_prompt(
            task="prakriti_assessment",
            context=gpt_context,
            version=req.prompt_version or 1,
        )

        # -------------------------------
        # 4. GPT call
        # -------------------------------
        # LLMClient.structured() returns a StructuredResult object with:
        # - data: Dict[str, Any]  (already-parsed JSON)
        # - model: str            (model actually used)
        # - raw: Any              (raw SDK response)
        llm_result = await self.llm.structured(
            task="prakriti_assessment",
            system=SYSTEM_PROMPT,
            user=user_prompt,
            schema_name="GeneratePrakritiResponse",
            schema=GeneratePrakritiResponse.model_json_schema(),
            model_override=req.model,
        )

        # -------------------------------
        # 5. Validate GPT response
        # -------------------------------
        try:
            # We already have a parsed dict from StructuredResult, so we use model_validate
            parsed = GeneratePrakritiResponse.model_validate(llm_result.data)
        except ValidationError as e:
            raise RuntimeError(
                f"Invalid GPT prakriti response: {llm_result.data}"
            ) from e

        # -------------------------------
        # 6. Add meta + cache
        # -------------------------------
        # meta is a typed model (PrakritiMeta), not a dict
        parsed.meta.model = llm_result.model
        parsed.meta.prompt_version = req.prompt_version or 1
        parsed.meta.cached = False

        if self.cache:
            # Cache implementation supports setex(key, ttl, value)
            ttl = int(features().get("cache_ttl_seconds", 604800))
            await self.cache.setex(
                cache_key,
                ttl,
                parsed.model_dump(),
            )

        return parsed, parsed.meta
