# backend/api/family_guidance.py

import logging
import hashlib
import json
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from api.deps import get_current_user
from db.mongo import members_collection
from db.family_guidance_repo import (
    get_guidance_by_season,
    save_guidance,
    mark_all_guidance_stale
)
from app.lifespan import get_claude_llm_client
from domain.family_guidance.service import generate_family_guidance

logger = logging.getLogger("uvicorn")
router = APIRouter(tags=["family-guidance"])


def get_current_season() -> str:
    """
    Determine current season based on month.
    Indian seasons:
    - Summer: March-May
    - Monsoon: June-August
    - Autumn: September-October
    - Winter: November-January
    - Spring: February
    """
    month = datetime.now().month
    
    if month in [3, 4, 5]:
        return "summer"
    elif month in [6, 7, 8]:
        return "monsoon"
    elif month in [9, 10]:
        return "autumn"
    elif month in [11, 12, 1]:
        return "winter"
    else:  # February
        return "spring"


def compute_family_hash(members: list) -> str:
    """
    Compute a hash of family composition to detect changes.
    Includes member IDs, prakritis, and elements.
    """
    # Sort members by ID for consistent hashing
    sorted_members = sorted(members, key=lambda m: str(m.get("_id", "")))
    
    # Create a string representation of key family data
    family_data = []
    for m in sorted_members:
        member_str = f"{m.get('_id')}:{m.get('fullName')}:{m.get('age')}"
        prakriti = m.get("prakriti", {})
        if prakriti:
            member_str += f":{prakriti.get('primaryDosha', '')}"
            elements = prakriti.get("elements", {})
            if elements:
                member_str += f":{elements.get('fire', 0)}:{elements.get('water', 0)}:{elements.get('earth', 0)}:{elements.get('air', 0)}:{elements.get('space', 0)}"
        family_data.append(member_str)
    
    # Hash the combined string
    combined = "|".join(family_data)
    return hashlib.md5(combined.encode()).hexdigest()


async def get_family_data(user_id: str) -> Dict[str, Any]:
    """
    Fetch and aggregate family data needed for guidance generation.
    """
    # Fetch all members
    cursor = members_collection.find({"userId": user_id})
    members = []
    
    async for m in cursor:
        m["_id"] = str(m["_id"])
        members.append(m)
    
    if not members:
        raise HTTPException(status_code=404, detail="No family members found")
    
    # Get region from first member (assuming all in same region)
    region = members[0].get("state", "India")
    
    # Process member data
    member_summaries = []
    element_totals = {"fire": 0, "water": 0, "earth": 0, "air": 0, "space": 0}
    members_with_elements = 0
    
    for m in members:
        prakriti_data = m.get("prakriti")
        if not prakriti_data:
            continue
        
        elements = prakriti_data.get("elements", {})
        if not elements:
            continue
        
        # Determine primary element
        element_values = {
            "fire": elements.get("fire", 0),
            "water": elements.get("water", 0),
            "earth": elements.get("earth", 0),
            "air": elements.get("air", 0),
            "space": elements.get("space", 0)
        }
        primary_element = max(element_values, key=element_values.get)
        
        member_summaries.append({
            "name": m.get("fullName", "Unknown"),
            "age": m.get("age", 0),
            "gender": m.get("gender", ""),
            "prakriti": prakriti_data.get("primaryDosha", ""),
            "primary_element": primary_element.capitalize(),
            "elements": element_values
        })
        
        # Add to totals
        for elem, val in element_values.items():
            element_totals[elem] += val
        members_with_elements += 1
    
    if members_with_elements == 0:
        raise HTTPException(
            status_code=400,
            detail="No family members have completed prakriti assessments"
        )
    
    # Calculate combined elements (average)
    combined_elements = {
        elem: round(total / members_with_elements, 1)
        for elem, total in element_totals.items()
    }
    
    strongest_element = max(combined_elements, key=combined_elements.get)
    weakest_element = min(combined_elements, key=combined_elements.get)
    
    return {
        "members": member_summaries,
        "member_count": len(member_summaries),
        "region": region,
        "combined_elements": combined_elements,
        "strongest_element": strongest_element.capitalize(),
        "weakest_element": weakest_element.capitalize(),
        "family_hash": compute_family_hash(members)
    }


class FamilyGuidanceResponse(BaseModel):
    """Response model for family guidance"""
    season: str
    year: int
    guidance: Dict[str, Any]
    generatedAt: str
    fromCache: bool


@router.get("/family-guidance/{user_id}", response_model=FamilyGuidanceResponse)
async def get_family_guidance_endpoint(user_id: str):
    """
    Get personalized family-level seasonal guidance.
    
    - Auto-detects current season
    - Checks cache first
    - Generates new guidance if needed
    - Considers all family members' prakritis and elements
    """
    try:
        logger.info(f"Family guidance requested for user_id: {user_id}")
        
        # Determine current season and year
        season = get_current_season()
        year = datetime.now().year
        logger.info(f"Current season: {season}, year: {year}")
        
        # Check cache first
        cached_guidance = await get_guidance_by_season(user_id, season, year)
        
        if cached_guidance:
            logger.info(f"Returning cached guidance for {season} {year}")
            return FamilyGuidanceResponse(
                season=season,
                year=year,
                guidance=cached_guidance["guidance"],
                generatedAt=cached_guidance["generatedAt"].isoformat() if isinstance(cached_guidance["generatedAt"], datetime) else cached_guidance["generatedAt"],
                fromCache=True
            )
        
        logger.info("No cached guidance found, fetching family data...")
        # Fetch family data
        family_data = await get_family_data(user_id)
        logger.info(f"Family data retrieved: {family_data['member_count']} members")
        
        # Get Claude LLM client
        logger.info("Getting Claude LLM client...")
        llm = get_claude_llm_client()
        logger.info("Claude LLM client obtained")
        
        # Generate new guidance using LLM
        logger.info(f"Generating new guidance for {season} {year}")
        guidance_result = await generate_family_guidance(
            llm=llm,
            season=season,
            region=family_data["region"],
            members=family_data["members"],
            member_count=family_data["member_count"],
            combined_elements=family_data["combined_elements"],
            strongest_element=family_data["strongest_element"],
            weakest_element=family_data["weakest_element"]
        )
        logger.info("Guidance generated successfully")
        
        # Save to database
        logger.info("Saving guidance to database...")
        saved = await save_guidance(
            user_id=user_id,
            season=season,
            year=year,
            family_hash=family_data["family_hash"],
            guidance_data=guidance_result
        )
        logger.info("Guidance saved successfully")
        
        return FamilyGuidanceResponse(
            season=season,
            year=year,
            guidance=saved["guidance"],
            generatedAt=saved["generatedAt"].isoformat() if isinstance(saved["generatedAt"], datetime) else saved["generatedAt"],
            fromCache=False
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting family guidance: {e}", exc_info=True)
        # Return more specific error message
        error_msg = str(e) if str(e) else "Failed to generate family guidance"
        raise HTTPException(status_code=500, detail=error_msg)


@router.post("/family-guidance/invalidate/{user_id}")
async def invalidate_family_guidance(user_id: str):
    """
    Mark all family guidance as stale.
    Called when family composition changes (member added/removed/updated).
    """
    try:
        count = await mark_all_guidance_stale(user_id)
        
        return {
            "message": "Family guidance invalidated",
            "updated_count": count
        }
    
    except Exception as e:
        logger.error(f"Error invalidating guidance: {e}")
        raise HTTPException(status_code=500, detail="Failed to invalidate guidance")
