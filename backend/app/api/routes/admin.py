from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import require_roles
from app.models.user import UserRole
from app.models.faculty import Faculty
from app.models.subject import Subject
from app.models.faculty_subject import FacultySubject
from app.schemas.admin import AdminCreateUserRequest, UserDetailResponse
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])

_admin_only = require_roles(UserRole.admin)


class FacultySubjectOut(BaseModel):
    faculty_id: int
    faculty_name: str
    subject_id: int
    subject_name: str
    subject_code: str


class SubjectWithFacultyOut(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    department: str
    semester: int
    credits: int
    assigned_faculty: List[dict]


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


@router.get(
    "/subjects-overview",
    summary="Get all subjects with their assigned faculty (admin only)",
)
def get_subjects_overview(
    db: Session = Depends(get_db),
    _: None = Depends(_admin_only),
):
    subjects = db.query(Subject).order_by(Subject.code).all()
    result = []
    for subj in subjects:
        assignments = db.query(FacultySubject).filter(FacultySubject.subject_id == subj.id).all()
        faculty_list = []
        for a in assignments:
            f = db.query(Faculty).filter(Faculty.id == a.faculty_id).first()
            if f:
                faculty_list.append({"faculty_id": f.id, "name": f.user.name, "department": f.department})
        result.append({
            "subject_id": subj.id,
            "subject_name": subj.name,
            "subject_code": subj.code,
            "department": subj.department,
            "semester": subj.semester,
            "credits": subj.credits,
            "assigned_faculty": faculty_list,
        })
    return result


@router.get(
    "/faculty-list",
    summary="Get all faculty with basic info (admin only)",
)
def get_faculty_list(
    db: Session = Depends(get_db),
    _: None = Depends(_admin_only),
):
    faculty_list = db.query(Faculty).all()
    return [
        {"faculty_id": f.id, "name": f.user.name, "department": f.department}
        for f in faculty_list
    ]


@router.post(
    "/faculty/{faculty_id}/subjects/{subject_id}",
    summary="Assign a subject to a faculty member (admin only)",
    status_code=201,
)
def assign_subject_to_faculty(
    faculty_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(_admin_only),
):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    existing = db.query(FacultySubject).filter(
        FacultySubject.faculty_id == faculty_id,
        FacultySubject.subject_id == subject_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Faculty is already assigned to this subject")
    assignment = FacultySubject(faculty_id=faculty_id, subject_id=subject_id)
    db.add(assignment)
    db.commit()
    return {"message": f"{faculty.user.name} assigned to {subject.name}"}


@router.delete(
    "/faculty/{faculty_id}/subjects/{subject_id}",
    summary="Remove a subject assignment from a faculty member (admin only)",
)
def unassign_subject_from_faculty(
    faculty_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(_admin_only),
):
    assignment = db.query(FacultySubject).filter(
        FacultySubject.faculty_id == faculty_id,
        FacultySubject.subject_id == subject_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment removed"}
