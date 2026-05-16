# llm/claude_client.py
from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Union

import anthropic
from anthropic import (
    AsyncAnthropic,
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    APIStatusError,
    APIConnectionError,
)

logger = logging.getLogger("uvicorn")


@dataclass
class StructuredResult:
    """Return type for structured JSON generations — identical shape to LLMClient."""
    data: Dict[str, Any]
    model: str
    raw: Any


class ClaudeLLMClient:
    """
    Anthropic Claude client with the same structured() interface as LLMClient,
    allowing it to be used as a drop-in replacement in the meal plan flow.
    """

    def __init__(
        self,
        *,
        api_key: str,
        request_timeout_s: int,
        task_model_map: Dict[str, str],
        default_model: str = "claude-opus-4-7",
    ) -> None:
        self._client = AsyncAnthropic(api_key=api_key, timeout=float(request_timeout_s))
        self._timeout = request_timeout_s
        self._task_models = {k.strip().lower(): v for k, v in (task_model_map or {}).items()}
        self._default_model = default_model

    # ------------------------------------------------------------------
    # Schema normalisation for Claude structured outputs
    # ------------------------------------------------------------------

    @staticmethod
    def _normalize_schema(schema: Any) -> Any:
        """
        Recursively prepare a JSON schema for Claude structured outputs:

        1. Strip unsupported constraints ($schema, $id, minLength, maxLength,
           minItems, maxItems, minimum, maximum, etc.)
        2. Convert `type: ["X", "null"]` unions to `anyOf: [{type: X, ...}, {type: "null"}]`
        3. Add `additionalProperties: false` and `required: [all_keys]` on every object
           node (required by Claude structured-output strict mode).
        """
        STRIP: set[str] = {
            "$schema", "$id",
            "minLength", "maxLength",
            "minItems", "maxItems",
            "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
        }

        if isinstance(schema, list):
            return [ClaudeLLMClient._normalize_schema(s) for s in schema]

        if not isinstance(schema, dict):
            return schema

        # First pass: collect processed values for every key except "type"
        out: Dict[str, Any] = {}
        for k, v in schema.items():
            if k in STRIP or k == "type":
                continue
            if k == "properties":
                out[k] = {pk: ClaudeLLMClient._normalize_schema(pv) for pk, pv in v.items()}
            elif k == "items":
                out[k] = ClaudeLLMClient._normalize_schema(v)
            elif k in ("anyOf", "allOf", "oneOf"):
                out[k] = [ClaudeLLMClient._normalize_schema(s) for s in v]
            else:
                out[k] = v  # title, description, enum, const, additionalProperties, required, etc.

        type_val = schema.get("type")

        if type_val is None:
            pass  # no type key
        elif isinstance(type_val, list):
            # Handle union types like ["object", "null"] or ["string", "null"]
            non_null: List[str] = [t for t in type_val if t != "null"]
            has_null: bool = "null" in type_val

            if not has_null:
                # Pure type array without null — just pick the first (edge case)
                out["type"] = non_null[0] if len(non_null) == 1 else non_null[0]
            elif len(non_null) == 0:
                out["type"] = "null"
            elif len(non_null) == 1:
                # Most common case: ["object", "null"] or ["string", "null"]
                base: Dict[str, Any] = {"type": non_null[0], **out}
                if non_null[0] == "object" and "properties" in base:
                    base["additionalProperties"] = False
                    base["required"] = list(base["properties"].keys())
                return {"anyOf": [base, {"type": "null"}]}
            else:
                schemas: List[Any] = [{"type": t} for t in non_null] + [{"type": "null"}]
                return {"anyOf": schemas}
        else:
            out["type"] = type_val

        # Add additionalProperties + required for plain object schemas
        if out.get("type") == "object" and "properties" in out and "anyOf" not in out:
            out["additionalProperties"] = False
            out["required"] = list(out["properties"].keys())

        return out

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _model_for(self, task: str, override: Optional[str] = None) -> str:
        if override:
            return override
        key = (task or "").strip().lower()
        return self._task_models.get(key, self._default_model)

    # ------------------------------------------------------------------
    # Public API — same signature as LLMClient.structured()
    # ------------------------------------------------------------------

    async def structured(
        self,
        *,
        task: str,
        system: str,
        user: str,
        schema_name: str,          # kept for interface compat; unused by Claude
        schema: Dict[str, Any],
        model_override: Optional[str] = None,
        timeout_s: Optional[int] = None,
        max_retries: int = 3,
    ) -> StructuredResult:
        """
        Call Claude and return JSON guaranteed to match the provided schema.
        Uses streaming to prevent HTTP timeouts on large meal-plan outputs.
        Adaptive thinking is enabled for better structured-data quality.
        """
        model = self._model_for(task, model_override)
        timeout = float(timeout_s or self._timeout)

        # Deep-copy and normalise the schema for Claude's structured-output API
        claude_schema = self._normalize_schema(json.loads(json.dumps(schema)))

        last_err: Exception | None = None
        for attempt in range(max_retries):
            try:
                client = self._client.with_options(timeout=timeout)
                async with client.messages.stream(
                    model=model,
                    max_tokens=16000,
                    system=system,
                    messages=[{"role": "user", "content": user}],
                    thinking={"type": "adaptive"},
                    output_config={"format": {"type": "json_schema", "schema": claude_schema}},
                ) as stream:
                    response = await stream.get_final_message()

                # Extract the text block (thinking blocks are filtered out)
                text = next(
                    (b.text for b in response.content if b.type == "text"), None
                )
                if text is None:
                    raise ValueError("Claude returned no text content in the response")

                data = json.loads(text)
                logger.info(
                    "Claude meal plan generation succeeded model=%s input_tokens=%s output_tokens=%s",
                    response.model,
                    response.usage.input_tokens,
                    response.usage.output_tokens,
                )
                return StructuredResult(data=data, model=response.model, raw=response)

            except AuthenticationError:
                raise  # wrong key — retrying won't help
            except (RateLimitError, APITimeoutError, APIConnectionError) as e:
                last_err = e
                logger.warning(
                    "Claude transient error attempt=%d/%d error=%s",
                    attempt + 1, max_retries, type(e).__name__,
                )
                await asyncio.sleep(0.5 * (2 ** attempt))
                continue
            except APIStatusError as e:
                if e.status_code < 500:
                    raise  # 4xx are permanent — don't retry
                last_err = e
                logger.warning(
                    "Claude server error attempt=%d/%d status=%d",
                    attempt + 1, max_retries, e.status_code,
                )
                await asyncio.sleep(0.5 * (2 ** attempt))
                continue

        if last_err:
            raise last_err
        raise RuntimeError("ClaudeLLMClient.structured exhausted retries without exception")

    async def aclose(self) -> None:
        await self._client.close()
