from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime

class FamilyMealPlanModel(BaseModel):
    userId: str
    plan: Dict[str, Any]  # Each day → meals → base + customizations
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    weekStart: datetime
    wellnessTips: Optional[Dict[str, List[str]]] = Field(default_factory=dict)