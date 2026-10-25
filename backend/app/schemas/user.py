from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserProfileBase(BaseModel):
    biography: Optional[str] = None
    preferred_programming_languages: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None
    learning_goals: Optional[str] = None
    timezone: str = "UTC"


class UserProfileUpdate(BaseModel):
    biography: Optional[str] = None
    preferred_programming_languages: Optional[List[str]] = None
    experience_level: Optional[str] = None
    learning_goals: Optional[str] = None
    timezone: Optional[str] = None


class UserProfileResponse(UserProfileBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    display_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="candidate")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    role: str
    account_status: str
    created_at: datetime
    updated_at: datetime
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True
