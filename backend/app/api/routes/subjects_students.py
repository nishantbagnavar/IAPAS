from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.subject import Subject
from app.models.student import Student

router = APIRouter(tags=["Subjects & Students"])


class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    department: str
    semester: int
    credits: int

    model_config = {"from_attributes": True}


class StudentOut(BaseModel):
    student_id: int
    user_id: int
    name: str
    email: str
    roll_number: str
    department: str
    semester: int
    year: int


@router.get("/api/subjects", response_model=List[SubjectOut], summary="List all subjects")
def get_subjects(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Subject).order_by(Subject.code).all()


@router.get(
    "/api/students",
    response_model=List[StudentOut],
    summary="List all students with basic profile (faculty/admin only)",
)
def get_students(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.faculty, UserRole.admin)),
):
    return [
        StudentOut(
            student_id=s.id,
            user_id=s.user_id,
            name=s.user.name,
            email=s.user.email,
            roll_number=s.roll_number,
            department=s.department,
            semester=s.semester,
            year=s.year,
        )
        for s in db.query(Student).order_by(Student.roll_number).all()
    ]
