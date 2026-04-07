from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserMeResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse, summary="Login and receive JWT token")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(req, db)


@router.post("/register", response_model=TokenResponse, status_code=201, summary="Register new user")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(req, db)


@router.get("/me", response_model=UserMeResponse, summary="Get current logged-in user")
def me(current_user: User = Depends(get_current_user)):
    profile_id = None
    if current_user.student_profile:
        profile_id = current_user.student_profile.id
    elif current_user.faculty_profile:
        profile_id = current_user.faculty_profile.id
    resp = UserMeResponse.model_validate(current_user)
    resp.profile_id = profile_id
    return resp
