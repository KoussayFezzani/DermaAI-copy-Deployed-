from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserPreferences(BaseModel):
    darkMode: bool = False
    language: str = 'en'

class UserSchema(BaseModel):
    email: EmailStr
    password: str
    role: str = 'user'
    username: str = ''
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_verified: bool = False  # Set to false globally

class ScanHistorySchema(BaseModel):
    user_email: EmailStr
    image_url: str
    body_part: Optional[str] = None
    diagnosis: str
    confidence: float
    diagnosis_2: Optional[str] = None
    confidence_2: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
