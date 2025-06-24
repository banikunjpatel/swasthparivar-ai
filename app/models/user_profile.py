from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    fullName: str
    age: int
    gender: str
    weight: Optional[float]
    height: Optional[float]
    prakriti: str
    fitnessGoals: str
    activityLevel: str
    dietaryPreferences: str
    medicalConditions: List[str]
    allergies: List[str]