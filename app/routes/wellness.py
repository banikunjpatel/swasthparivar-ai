from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.logic.wellness import get_member_wellness_tips

from app.db import members_collection, families_collection

router = APIRouter()

@router.get("/wellness-tips", summary="Get wellness tips for a family or a single member")
async def get_wellness_tips(season: str, user_id: str = None, member_id: str = None):
    if not season:
        raise HTTPException(status_code=400, detail="Season is required.")

    if (user_id and member_id) or (not user_id and not member_id):
        raise HTTPException(
            status_code=400,
            detail="Provide either user_id (for family) or member_id (for single member), not both."
        )

    suggestions = []

    if member_id:
        # Single Member Case
        member = await members_collection.find_one({"_id": ObjectId(member_id)})
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        prakriti = member.get("prakriti")
        conditions = member.get("medicalConditions", [])
        name = member.get("fullName")

        if not prakriti:
            raise HTTPException(status_code=400, detail="Prakriti not defined for this member")

        tips = get_member_wellness_tips(prakriti, season, conditions)

        suggestions.append({
            "memberId": member_id,
            "fullName": name,
            "prakriti": prakriti,
            "medicalConditions": conditions,
            "tips": tips
        })

    elif user_id:
        # Family Case
        family = await families_collection.find_one({"_id": ObjectId(user_id)})
        if not family:
            raise HTTPException(status_code=404, detail="Family not found")

        async for member in members_collection.find({"userId": user_id}):
            prakriti = member.get("prakriti")
            conditions = member.get("medicalConditions", [])
            name = member.get("fullName")

            if prakriti:
                tips = get_member_wellness_tips(prakriti, season, conditions)
                suggestions.append({
                    "memberId": str(member["_id"]),
                    "fullName": name,
                    "prakriti": prakriti,
                    "medicalConditions": conditions,
                    "tips": tips
                })

    return {
        "season": season,
        "suggestions": suggestions
    }