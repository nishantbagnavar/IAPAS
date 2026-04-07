from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import require_roles
from app.models.user import UserRole
from app.schemas.admin import AdminCreateUserRequest, UserDetailResponse
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])

_admin_only = require_roles(UserRole.admin)


@router.get(
    "/users",
    response_model=List[UserDetailResponse],
    summary="List all users with profile details (admin only)",
)
def list_users(
    db: Session = Depends(get_db),
    _: None = Depends(_admin_only),
):
    return admin_service.list_users(db)


@router.post(
    "/create-user",
    response_model=UserDetailResponse,
    status_code=201,
    summary="Create a new user with profile (admin only)",
)
def create_user(
    req: AdminCreateUserRequest,
    db: Session = Depends(get_db),
    _: None = Depends(_admin_only),
):
    return admin_service.create_user(req, db)


@router.delete(
    "/user/{user_id}",
    summary="Delete a user by ID (admin only)",
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(_admin_only),
):
    return admin_service.delete_user(user_id, db)
