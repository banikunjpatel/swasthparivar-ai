from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class FamilyModel(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    age: Optional[int]
    gender: Optional[str]
    dietaryPreferences: Optional[str]
    allergies: List[str] = []
    prakriti: Optional[str]
    isVerified: bool = False
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

class MemberModel(BaseModel):
    userId: str  # This links back to families._id as a string
    fullName: str
    age: Optional[int]
    gender: Optional[str]
    dietaryPreferences: Optional[str]
    allergies: List[str] = []
    prakriti: Optional[str]
    isVerified: bool = False
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)