from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.student import Student
from app.schemas.attendance import (
    AttendanceMarkRequest,
    AttendanceResponse,
    AttendanceReportResponse,
    StudentAttendanceReport,
)
from app.services import attendance_service

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post(
    "/mark",
    response_model=AttendanceResponse,
    status_code=201,
    summary="Mark attendance for a student (faculty/admin only)",
)
def mark_attendance(
    req: AttendanceMarkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.faculty, UserRole.admin)),
):
    return attendance_service.mark_attendance(req, db)


@router.get(
    "/student/{student_id}",
    response_model=StudentAttendanceReport,
    summary="Get attendance summary for a student",
)
def student_attendance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Students can only view their own attendance
    if current_user.role == UserRole.student:
        profile = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not profile or profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only view their own attendance",
            )
    return attendance_service.get_student_attendance(student_id, db)


@router.get(
    "/subject/{subject_id}",
    response_model=list[AttendanceResponse],
    summary="Get all attendance records for a subject (faculty/admin only)",
)
def subject_attendance(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.faculty, UserRole.admin)),
):
    return attendance_service.get_subject_attendance(subject_id, db)


@router.get(
    "/report",
    response_model=AttendanceReportResponse,
    summary="Overall attendance report across all students and subjects (faculty/admin only)",
)
def attendance_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.faculty, UserRole.admin)),
):
    return attendance_service.get_attendance_report(db)
