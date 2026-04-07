from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole = UserRole.student


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    profile_id: Optional[int] = None  # student.id or faculty.id
    name: str


class UserMeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime
    profile_id: Optional[int] = None

    model_config = {"from_attributes": True}
