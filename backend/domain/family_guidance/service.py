# backend/domain/family_guidance/service.py

import json
from typing import Dict, Any, Union

from llm.client import LLMClient
from llm.claude_client import ClaudeLLMClient
from llm.prompt_renderer import render_prompt


# Simple JSON schema for family guidance
FAMILY_GUIDANCE_SCHEMA = {
    "type": "object",
    "properties": {
        "season": {"type": "string"},
        "familyRhythm": {
            "type": "object",
            "properties": {
                "morningAnchor": {"type": "string"},
                "mealtimeAnchor": {"type": "string"},
                "eveningAnchor": {"type": "string"},
                "whyThisWorks": {"type": "string"}
            },
            "required": ["morningAnchor", "mealtimeAnchor", "eveningAnchor", "whyThisWorks"]
        },
        "seasonAndElements": {
            "type": "object",
            "properties": {
                "natureThisSeason": {"type": "string"},
                "familyBalance": {"type": "string"},
                "familyNeeds": {"type": "string"},
                "kitchenAction": {"type": "string"},
                "foodsToInclude": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "foodsToAvoid": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "homeAction": {"type": "string"},
                "togetherAction": {"type": "string"},
                "whyThisWorks": {"type": "string"}
            },
            "required": [
                "natureThisSeason", "familyBalance", "familyNeeds",
                "kitchenAction", "foodsToInclude", "foodsToAvoid",
                "homeAction", "togetherAction", "whyThisWorks"
            ]
        }
    },
    "required": ["season", "familyRhythm", "seasonAndElements"]
}


SYSTEM_PROMPT = (
    "You are an expert Ayurvedic family wellness advisor. "
    "Generate personalized seasonal guidance that considers the family's collective nature, "
    "individual member needs, and the current season's qualities. "
    "Provide practical, actionable advice that families can easily implement. "
    "Output ONLY valid JSON matching the provided schema."
)


async def generate_family_guidance(
    llm: Union[LLMClient, ClaudeLLMClient],
    season: str,
    region: str,
    members: list,
    member_count: int,
    combined_elements: Dict[str, float],
    strongest_element: str,
    weakest_element: str
) -> Dict[str, Any]:
    """
    Generate family guidance using LLM (OpenAI or Claude).
    """
    # Build context for prompt
    context = {
        "season": season.capitalize(),
        "region": region,
        "member_count": member_count,
        "members": members,
        "combined_elements": combined_elements,
        "strongest_element": strongest_element,
        "weakest_element": weakest_element
    }
    
    # Render prompt
    user_prompt = render_prompt("family_guidance", 1, context)
    
    # Call LLM
    result = await llm.structured(
        task="family_guidance",
        system=SYSTEM_PROMPT,
        user=user_prompt,
        schema_name="FamilyGuidance",
        schema=FAMILY_GUIDANCE_SCHEMA,
        timeout_s=60
    )
    
    return result.data
