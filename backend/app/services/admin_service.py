from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.faculty import Faculty
from app.schemas.admin import AdminCreateUserRequest, UserListResponse, UserDetailResponse


def list_users(db: Session) -> List[UserDetailResponse]:
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        detail = UserDetailResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            created_at=u.created_at,
        )
        if u.student_profile:
            p = u.student_profile
            detail.roll_number = p.roll_number
            detail.department = p.department
            detail.semester = p.semester
            detail.year = p.year
        elif u.faculty_profile:
            p = u.faculty_profile
            detail.department = p.department
            detail.subject_specialization = p.subject_specialization
        result.append(detail)
    return result


def create_user(req: AdminCreateUserRequest, db: Session) -> UserDetailResponse:
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.flush()

    detail = UserDetailResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
    )

    if req.role == UserRole.student:
        if not req.roll_number:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="roll_number is required for student role",
            )
        profile = Student(
            user_id=user.id,
            roll_number=req.roll_number,
            department=req.department or "Unassigned",
            semester=req.semester or 1,
            year=req.year or 1,
        )
        db.add(profile)
        detail.roll_number = profile.roll_number
        detail.department = profile.department
        detail.semester = profile.semester
        detail.year = profile.year

    elif req.role == UserRole.faculty:
        profile = Faculty(
            user_id=user.id,
            department=req.department or "Unassigned",
            subject_specialization=req.subject_specialization or "General",
        )
        db.add(profile)
        detail.department = profile.department
        detail.subject_specialization = profile.subject_specialization

    db.commit()
    return detail


def delete_user(user_id: int, db: Session) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == UserRole.admin:
        # Count remaining admins
        admin_count = db.query(User).filter(User.role == UserRole.admin).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last admin account",
            )
    db.delete(user)
    db.commit()
    return {"message": f"User '{user.name}' deleted successfully"}
