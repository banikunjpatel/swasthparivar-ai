from pydantic import BaseModel, EmailStr, Field
from pydantic import StringConstraints
from typing import Annotated, Optional, List
from datetime import datetime

StrippedStr = Annotated[str, StringConstraints(strip_whitespace=True)]
PasswordStr = Annotated[str, StringConstraints(min_length=6)]

class FamilyModel(BaseModel):
    email: EmailStr
    password: PasswordStr
    fullName: StrippedStr
    isVerified: bool = False
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

class DoshaStats(BaseModel):
    vata: int = Field(ge=0, le=100)
    pitta: int = Field(ge=0, le=100)
    kapha: int = Field(ge=0, le=100)

class MemberModel(BaseModel):
    userId: str
    fullName: StrippedStr
    age: Optional[int]
    gender: Optional[str]
    dietaryPreferences: Optional[str]
    medicalConditions: List[str]
    allergies: List[str] = []
    prakriti: Optional[str]
    state: Optional[str]
    doshaStats: Optional[DoshaStats] = None
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)