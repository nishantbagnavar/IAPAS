from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.models.user import UserRole


class AdminCreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole
    # Optional student profile fields
    roll_number: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    year: Optional[int] = None
    # Optional faculty profile fields
    subject_specialization: Optional[str] = None


class UserListResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class UserDetailResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime
    # Profile details (only one will be present based on role)
    roll_number: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    year: Optional[int] = None
    subject_specialization: Optional[str] = None
