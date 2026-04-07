from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.student import Student
from app.schemas.marks import MarksAddRequest, MarksResponse, StudentMarksReport
from app.services import marks_service

router = APIRouter(prefix="/api/marks", tags=["Marks"])


@router.post(
    "/add",
    response_model=MarksResponse,
    status_code=201,
    summary="Add a marks entry (faculty/admin only)",
)
def add_marks(
    req: MarksAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.faculty, UserRole.admin)),
):
    return marks_service.add_marks(req, db)


@router.get(
    "/student/{student_id}",
    response_model=StudentMarksReport,
    summary="Get all marks for a student",
)
def student_marks(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Students can only view their own marks
    if current_user.role == UserRole.student:
        profile = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not profile or profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only view their own marks",
            )
    return marks_service.get_student_marks(student_id, db)


@router.get(
    "/subject/{subject_id}",
    response_model=List[MarksResponse],
    summary="Get all marks entries for a subject (faculty/admin only)",
)
def subject_marks(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.faculty, UserRole.admin)),
):
    return marks_service.get_subject_marks(subject_id, db)
