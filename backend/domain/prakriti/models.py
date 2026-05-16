# domain/prakriti/models.py
from __future__ import annotations

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

Dosha = Literal["vata", "pitta", "kapha", "tridoshic"]

class Profile(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    region: Optional[str] = None

class PrakritiQuestion(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    question: str
    answer: str  # free text or option id

class GeneratePrakritiRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    profile: Profile
    questions: List[PrakritiQuestion] = Field(default_factory=list)
    model: Optional[str] = None
    prompt_version: Optional[int] = None
    force: bool = False

class PrakritiDistribution(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    vata: float
    pitta: float
    kapha: float

class ElementDistribution(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    fire: float
    water: float
    earth: float
    air: float
    space: float

class PrakritiGuidance(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    foods_to_favor: List[str]
    foods_to_avoid: List[str]
    lifestyle_tips: List[str]

class PrakritiMeta(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    model: Optional[str] = None
    prompt_version: Optional[int] = None
    cached: Optional[bool] = None

class GeneratePrakritiResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    primaryDosha: Dosha
    secondaryDosha: Optional[Dosha] = None
    distribution: PrakritiDistribution
    elements: ElementDistribution
    guidance: PrakritiGuidance
    notes: Optional[str] = None
    meta: PrakritiMeta = Field(default_factory=PrakritiMeta)
