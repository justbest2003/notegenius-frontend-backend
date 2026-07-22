from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating/updating user profile"""
    firebase_uid: str
    email: str
    display_name: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response"""
    firebase_uid: str
    email: str
    display_name: str = ""
    created_at: datetime
    last_login: datetime


class UserInDB(BaseModel):
    """Schema for user stored in MongoDB"""
    firebase_uid: str
    email: str
    display_name: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)
