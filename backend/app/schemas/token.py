from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    email: Optional[str] = None
    identifier: Optional[str] = None
    username: Optional[str] = None
    user_id: Optional[str] = None
    password: str

    @property
    def login_identifier(self) -> str:
        return (self.identifier or self.email or self.username or self.user_id or "").strip()


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class PasswordRecoveryResponse(BaseModel):
    message: str
    recovery_token_id: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GoogleAuthRequest(BaseModel):
    credential: str
    role: Optional[str] = "candidate"
