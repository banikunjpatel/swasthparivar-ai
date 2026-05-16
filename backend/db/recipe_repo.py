# db/repositories/recipe_repo.py
from __future__ import annotations

from typing import Any, Optional, List
from datetime import datetime

class RecipeRepository:
    def __init__(self, db: Optional[Any]):
        self.db = db
        self.col = db["recipes"] if db is not None else None

    async def save(self, doc: dict) -> Optional[str]:
        """Save a new recipe to the database"""
        if self.col is None:
            return None
        
        # Add timestamps
        doc["createdAt"] = datetime.utcnow()
        doc["updatedAt"] = datetime.utcnow()
        
        res = await self.col.insert_one(doc)
        return str(res.inserted_id)

    async def get(self, _id: str) -> Optional[dict]:
        """Get recipe by MongoDB _id"""
        if self.col is None:
            return None
        return await self.col.find_one({"_id": _id})

    async def find_by_dish(
        self, 
        dish: str, 
        region: str, 
        diet_type: str, 
        servings: int,
        user_id: Optional[str] = None
    ) -> Optional[dict]:
        """Find existing recipe by dish name, region, diet type, and servings"""
        if self.col is None:
            return None
        
        query = {
            "dish": dish,
            "region": region,
            "dietType": diet_type,
            "servings": servings
        }
        
        # Optionally filter by userId if provided
        if user_id:
            query["userId"] = user_id
        
        # Find the most recent matching recipe
        return await self.col.find_one(query, sort=[("createdAt", -1)])

    async def get_by_user(self, user_id: str, limit: int = 50) -> List[dict]:
        """Get all recipes for a specific user"""
        if self.col is None:
            return []
        
        cursor = self.col.find({"userId": user_id}).sort("createdAt", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_access_time(self, _id: str) -> bool:
        """Update the last accessed time for a recipe"""
        if self.col is None:
            return False
        
        result = await self.col.update_one(
            {"_id": _id},
            {"$set": {"lastAccessedAt": datetime.utcnow()}}
        )
        return result.modified_count > 0

