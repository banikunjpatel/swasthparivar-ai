# db/repositories/meal_plan_repo.py
from __future__ import annotations

from typing import Any, Optional

class MealPlanRepository:
    """
    Minimal repository. Works if a Mongo DB instance is provided; else no-op stubs.
    """

    def __init__(self, db: Optional[Any]):
        self.db = db
        self.col = db["family_meal_plans"] if db is not None else None

    async def save(self, doc: dict) -> Optional[str]:
        if self.col is None:
            return None
        res = await self.col.insert_one(doc)
        return str(res.inserted_id)

    async def get(self, _id: str) -> Optional[dict]:
        if self.col is None:
            return None
        return await self.col.find_one({"_id": _id})

    async def get_by_user(self, user_id: str) -> list:
        if self.col is None:
            return []
        cursor = self.col.find({"userId": user_id}).sort("createdAt", -1)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results
