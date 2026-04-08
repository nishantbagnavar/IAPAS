from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.subject import Subject
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.faculty_subject import FacultySubject

router = APIRouter(tags=["Subjects & Students"])


class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    department: str
    semester: int
    credits: int

    model_config = {"from_attributes": True}


class SubjectCreate(BaseModel):
    name: str
    code: str
    department: str
    semester: int
    credits: int


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


@router.post(
    "/api/subjects",
    response_model=SubjectOut,
    status_code=201,
    summary="Create a new subject (admin only)",
)
def create_subject(
    body: SubjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
):
    existing = db.query(Subject).filter(Subject.code == body.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Subject code '{body.code}' already exists")
    subject = Subject(**body.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete(
    "/api/subjects/{subject_id}",
    summary="Delete a subject (admin only)",
)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"message": f"Subject '{subject.name}' deleted successfully"}


@router.get(
    "/api/faculty/me/subjects",
    response_model=List[SubjectOut],
    summary="Get subjects assigned to the current faculty member",
)
def get_my_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.faculty)),
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    assignments = db.query(FacultySubject).filter(FacultySubject.faculty_id == faculty.id).all()
    subject_ids = [a.subject_id for a in assignments]
    if not subject_ids:
        return []
    return db.query(Subject).filter(Subject.id.in_(subject_ids)).order_by(Subject.code).all()


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
