from datetime import timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.faculty import Faculty
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


def login(req: LoginRequest, db: Session) -> TokenResponse:
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    profile_id = None
    if user.student_profile:
        profile_id = user.student_profile.id
    elif user.faculty_profile:
        profile_id = user.faculty_profile.id
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        profile_id=profile_id,
        name=user.name,
    )


def register(req: RegisterRequest, db: Session) -> TokenResponse:
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.flush()

    if req.role == UserRole.student:
        # Create a bare student profile; caller can fill details via admin API
        student = Student(
            user_id=user.id,
            roll_number=f"STU{user.id:04d}",
            department="Unassigned",
            semester=1,
            year=1,
        )
        db.add(student)
    elif req.role == UserRole.faculty:
        faculty = Faculty(
            user_id=user.id,
            department="Unassigned",
            subject_specialization="General",
        )
        db.add(faculty)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    profile_id = None
    if user.student_profile:
        profile_id = user.student_profile.id
    elif user.faculty_profile:
        profile_id = user.faculty_profile.id
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, profile_id=profile_id, name=user.name)
