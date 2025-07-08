from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MealGenerationRequest(BaseModel):
    weekStart: datetime
    force: Optional[bool] = False
    season: Optional[str] = None