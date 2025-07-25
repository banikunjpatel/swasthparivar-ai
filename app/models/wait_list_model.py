from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class WaitlistEntry(BaseModel):
    email: EmailStr = Field(..., description="User email address to join the waitlist")
    name: Optional[str] = Field(None, description="Optional name of the user")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Timestamp of joining")
