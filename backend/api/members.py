# backend/api/members.py

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from db.mongo import members_collection

logger = logging.getLogger("uvicorn")
router = APIRouter(tags=["members"])


# ---- Pydantic models (aligned with member.json schema) ----

class DoshaDistribution(BaseModel):
    """Dosha percentage distribution"""
    vata: float = Field(ge=0, le=100)
    pitta: float = Field(ge=0, le=100)
    kapha: float = Field(ge=0, le=100)


class ElementDistribution(BaseModel):
    """Element percentage distribution"""
    fire: float = Field(ge=0, le=100)
    water: float = Field(ge=0, le=100)
    earth: float = Field(ge=0, le=100)
    air: float = Field(ge=0, le=100)
    space: float = Field(ge=0, le=100)


class PrakritiGuidance(BaseModel):
    """Ayurvedic guidance based on prakriti"""
    foods_to_favor: List[str] = Field(default_factory=list)
    foods_to_avoid: List[str] = Field(default_factory=list)
    lifestyle_tips: List[str] = Field(default_factory=list)


class PrakritiAssessment(BaseModel):
    """Prakriti assessment result structure"""
    primaryDosha: str = Field(..., description="Primary dosha: vata, pitta, kapha, or tridoshic")
    secondaryDosha: Optional[str] = Field(None, description="Secondary dosha if applicable")
    distribution: DoshaDistribution
    elements: Optional[ElementDistribution] = None
    guidance: PrakritiGuidance
    notes: Optional[str] = None
    assessedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    version: Optional[str] = Field("1.0", description="Assessment version/algorithm")


class MemberCreate(BaseModel):
    userId: str
    fullName: str
    age: int = None
    birthdate: Optional[str] = None
    gender: str = None
    dietaryPreferences: str = None
    state: Optional[str] = None


class MemberUpdate(BaseModel):
    fullName: Optional[str] = None
    age: Optional[int] = None
    birthdate: Optional[str] = None
    gender: Optional[str] = None
    dietaryPreferences: Optional[str] = None
    state: Optional[str] = None
    prakriti: Optional[PrakritiAssessment] = None


# ---- Routes ----

@router.post("/member", summary="Create a new member")
async def create_member(member: MemberCreate):
    try:
        doc = member.model_dump()
        now = datetime.utcnow()
        doc["createdAt"] = now
        doc["updatedAt"] = now

        result = await members_collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)

        return {"member": doc}

    except Exception as e:
        logger.error(f"Failed to create member: {e}")
        raise HTTPException(status_code=500, detail="Creation failed")


@router.get("/members/{user_id}", summary="Get all members for a user")
async def get_members(user_id: str) -> List[dict]:
    try:
        cursor = members_collection.find({"userId": user_id})
        members = []

        async for m in cursor:
            m["_id"] = str(m["_id"])
            members.append(m)

        return members

    except Exception as e:
        logger.error(f"Failed to fetch members: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/members/{member_id}", summary="Update a member by ID")
async def update_member(member_id: str, payload: MemberUpdate):
    try:
        # Convert Pydantic model to dict, handling nested models properly
        update_doc = payload.model_dump(exclude_unset=True, exclude_none=True, mode="json")
        
        # Handle prakriti assessment separately to ensure proper serialization
        if "prakriti" in update_doc and update_doc["prakriti"]:
            # Ensure assessedAt is set if not provided
            if "assessedAt" not in update_doc["prakriti"] or not update_doc["prakriti"]["assessedAt"]:
                update_doc["prakriti"]["assessedAt"] = datetime.utcnow()
        
        if not update_doc:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_doc["updatedAt"] = datetime.utcnow()

        result = await members_collection.update_one(
            {"_id": ObjectId(member_id)},
            {"$set": update_doc}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        # Return updated member
        updated_member = await members_collection.find_one({"_id": ObjectId(member_id)})
        if updated_member:
            updated_member["_id"] = str(updated_member["_id"])
            # Convert datetime objects to ISO strings for JSON response
            if "prakriti" in updated_member and updated_member["prakriti"]:
                if "assessedAt" in updated_member["prakriti"] and isinstance(updated_member["prakriti"]["assessedAt"], datetime):
                    updated_member["prakriti"]["assessedAt"] = updated_member["prakriti"]["assessedAt"].isoformat()
            if "createdAt" in updated_member and isinstance(updated_member["createdAt"], datetime):
                updated_member["createdAt"] = updated_member["createdAt"].isoformat()
            if "updatedAt" in updated_member and isinstance(updated_member["updatedAt"], datetime):
                updated_member["updatedAt"] = updated_member["updatedAt"].isoformat()
        
        return {"message": "Member updated successfully", "member": updated_member}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update member: {e}")
        raise HTTPException(status_code=500, detail="Update failed")


@router.delete("/members/{member_id}", summary="Delete a member by ID")
async def delete_member(member_id: str):
    try:
        result = await members_collection.delete_one({"_id": ObjectId(member_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Member not found")

        return {"message": "Member deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete member: {e}")
        raise HTTPException(status_code=500, detail="Deletion failed")


# ---- Response models for family nature ----

class FamilyMemberSummary(BaseModel):
    """Summary of a family member for nature map"""
    name: str
    age: Optional[int] = None
    prakriti: Optional[str] = None
    element: Optional[str] = None


class CombinedElements(BaseModel):
    """Combined element percentages for the family"""
    fire: float = Field(ge=0, le=100)
    water: float = Field(ge=0, le=100)
    earth: float = Field(ge=0, le=100)
    air: float = Field(ge=0, le=100)
    space: float = Field(ge=0, le=100)


class FamilyNatureResponse(BaseModel):
    """Family nature map response"""
    familyName: str
    memberCount: int
    createdAt: Optional[str] = None
    members: List[FamilyMemberSummary]
    combinedElements: Optional[CombinedElements] = None
    strongest: Optional[str] = None
    weakest: Optional[str] = None


@router.get("/members/family-nature/{user_id}", summary="Get family nature map", response_model=FamilyNatureResponse)
async def get_family_nature(user_id: str):
    """
    Get aggregated family nature data including:
    - Family name (derived from primary member)
    - Member count
    - Member summaries (name, age, prakriti, primary element)
    - Combined element percentages (average across all members)
    - Strongest and weakest elements
    """
    try:
        # Fetch all members for the user
        cursor = members_collection.find({"userId": user_id})
        members = []
        
        async for m in cursor:
            m["_id"] = str(m["_id"])
            members.append(m)
        
        if not members:
            # Return empty family structure
            return FamilyNatureResponse(
                familyName="Your Family",
                memberCount=0,
                createdAt=None,
                members=[],
                combinedElements=None,
                strongest=None,
                weakest=None
            )
        
        # Find primary member for family name
        primary_member = next((m for m in members if m.get("isPrimary")), members[0])
        family_name = primary_member.get("fullName", "Your Family").split()[0] if primary_member.get("fullName") else "Your Family"
        
        # Get earliest creation date
        creation_dates = [m.get("createdAt") for m in members if m.get("createdAt")]
        earliest_date = min(creation_dates) if creation_dates else None
        created_at_str = earliest_date.isoformat() if isinstance(earliest_date, datetime) else str(earliest_date) if earliest_date else None
        
        # Build member summaries
        member_summaries = []
        element_totals = {"fire": 0, "water": 0, "earth": 0, "air": 0, "space": 0}
        members_with_elements = 0
        
        for m in members:
            prakriti_data = m.get("prakriti")
            prakriti_str = None
            element_str = None
            
            if prakriti_data:
                prakriti_str = prakriti_data.get("primaryDosha")
                
                # Get elements if available
                elements = prakriti_data.get("elements")
                if elements:
                    # Determine primary element (highest percentage)
                    element_values = {
                        "fire": elements.get("fire", 0),
                        "water": elements.get("water", 0),
                        "earth": elements.get("earth", 0),
                        "air": elements.get("air", 0),
                        "space": elements.get("space", 0)
                    }
                    primary_element = max(element_values, key=element_values.get)
                    element_str = primary_element.capitalize()
                    
                    # Add to totals for averaging
                    for elem, val in element_values.items():
                        element_totals[elem] += val
                    members_with_elements += 1
            
            member_summaries.append(FamilyMemberSummary(
                name=m.get("fullName", "Unknown"),
                age=m.get("age"),
                prakriti=prakriti_str,
                element=element_str
            ))
        
        # Calculate combined elements (average)
        combined_elements = None
        strongest = None
        weakest = None
        
        if members_with_elements > 0:
            avg_elements = {
                elem: round(total / members_with_elements, 1)
                for elem, total in element_totals.items()
            }
            
            combined_elements = CombinedElements(**avg_elements)
            strongest = max(avg_elements, key=avg_elements.get)
            weakest = min(avg_elements, key=avg_elements.get)
        
        return FamilyNatureResponse(
            familyName=f"The {family_name} Family",
            memberCount=len(members),
            createdAt=created_at_str,
            members=member_summaries,
            combinedElements=combined_elements,
            strongest=strongest,
            weakest=weakest
        )
    
    except Exception as e:
        logger.error(f"Failed to get family nature: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve family nature data")
