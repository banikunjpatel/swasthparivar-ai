# backend/db/family_guidance_repo.py

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

from db.mongo import db

logger = logging.getLogger("uvicorn")

family_guidance_collection = db["family_guidance"]


async def get_guidance_by_season(user_id: str, season: str, year: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve family guidance for a specific season and year.
    Returns None if not found or if marked as stale.
    """
    try:
        guidance = await family_guidance_collection.find_one({
            "userId": user_id,
            "season": season.lower(),
            "year": year,
            "isStale": False
        })
        
        if guidance:
            guidance["_id"] = str(guidance["_id"])
        
        return guidance
    except Exception as e:
        logger.error(f"Error fetching guidance: {e}")
        return None


async def save_guidance(
    user_id: str,
    season: str,
    year: int,
    family_hash: str,
    guidance_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Save or update family guidance for a season.
    """
    try:
        doc = {
            "userId": user_id,
            "season": season.lower(),
            "year": year,
            "familyHash": family_hash,
            "guidance": guidance_data,
            "generatedAt": datetime.utcnow(),
            "isStale": False
        }
        
        # Upsert: update if exists, insert if not
        result = await family_guidance_collection.update_one(
            {
                "userId": user_id,
                "season": season.lower(),
                "year": year
            },
            {"$set": doc},
            upsert=True
        )
        
        # Fetch the saved document
        saved = await family_guidance_collection.find_one({
            "userId": user_id,
            "season": season.lower(),
            "year": year
        })
        
        if saved:
            saved["_id"] = str(saved["_id"])
        
        return saved
    except Exception as e:
        logger.error(f"Error saving guidance: {e}")
        raise


async def mark_all_guidance_stale(user_id: str) -> int:
    """
    Mark all guidance for a user as stale.
    Returns the number of documents updated.
    """
    try:
        result = await family_guidance_collection.update_many(
            {"userId": user_id, "isStale": False},
            {"$set": {"isStale": True}}
        )
        return result.modified_count
    except Exception as e:
        logger.error(f"Error marking guidance stale: {e}")
        return 0


async def delete_guidance(user_id: str, season: str, year: int) -> bool:
    """
    Delete guidance for a specific season and year.
    """
    try:
        result = await family_guidance_collection.delete_one({
            "userId": user_id,
            "season": season.lower(),
            "year": year
        })
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error deleting guidance: {e}")
        return False
