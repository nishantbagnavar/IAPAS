from datetime import date
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.attendance import Attendance, AttendanceStatus
from app.models.student import Student
from app.models.subject import Subject
from app.models.user import User
from app.schemas.attendance import (
    AttendanceMarkRequest,
    AttendanceResponse,
    AttendanceReportResponse,
    StudentAttendanceReport,
    SubjectAttendanceSummary,
)


def _get_student_or_404(student_id: int, db: Session) -> Student:
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return s


def _get_subject_or_404(subject_id: int, db: Session) -> Subject:
    s = db.query(Subject).filter(Subject.id == subject_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return s


def mark_attendance(req: AttendanceMarkRequest, db: Session) -> AttendanceResponse:
    _get_student_or_404(req.student_id, db)
    _get_subject_or_404(req.subject_id, db)

    # Upsert: update existing record for same student/subject/date
    existing = (
        db.query(Attendance)
        .filter(
            Attendance.student_id == req.student_id,
            Attendance.subject_id == req.subject_id,
            Attendance.date == req.date,
        )
        .first()
    )
    if existing:
        existing.status = req.status
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = Attendance(
            student_id=req.student_id,
            subject_id=req.subject_id,
            date=req.date,
            status=req.status,
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return AttendanceResponse.model_validate(record)


def get_student_attendance(student_id: int, db: Session) -> StudentAttendanceReport:
    student = _get_student_or_404(student_id, db)
    subjects = db.query(Subject).all()
    subject_summaries = []

    total_present = 0
    total_classes = 0

    for subj in subjects:
        records = (
            db.query(Attendance)
            .filter(
                Attendance.student_id == student_id,
                Attendance.subject_id == subj.id,
            )
            .all()
        )
        present = sum(1 for r in records if r.status in (AttendanceStatus.present, AttendanceStatus.late))
        absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
        late = sum(1 for r in records if r.status == AttendanceStatus.late)
        total = len(records)
        pct = round((present / total * 100), 2) if total > 0 else 0.0

        total_present += present
        total_classes += total

        subject_summaries.append(
            SubjectAttendanceSummary(
                subject_id=subj.id,
                subject_name=subj.name,
                subject_code=subj.code,
                total_classes=total,
                present=present,
                absent=absent,
                late=late,
                attendance_pct=pct,
            )
        )

    overall_pct = round((total_present / total_classes * 100), 2) if total_classes > 0 else 0.0
    return StudentAttendanceReport(
        student_id=student_id,
        student_name=student.user.name,
        roll_number=student.roll_number,
        subjects=subject_summaries,
        overall_attendance_pct=overall_pct,
    )


def get_subject_attendance(subject_id: int, db: Session) -> List[AttendanceResponse]:
    _get_subject_or_404(subject_id, db)
    records = db.query(Attendance).filter(Attendance.subject_id == subject_id).all()
    return [AttendanceResponse.model_validate(r) for r in records]


def get_attendance_report(db: Session) -> AttendanceReportResponse:
    students = db.query(Student).all()
    subjects = db.query(Subject).all()
    report = []

    for student in students:
        subject_summaries = []
        total_present = total_classes = 0

        for subj in subjects:
            records = (
                db.query(Attendance)
                .filter(
                    Attendance.student_id == student.id,
                    Attendance.subject_id == subj.id,
                )
                .all()
            )
            present = sum(1 for r in records if r.status in (AttendanceStatus.present, AttendanceStatus.late))
            absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
            late = sum(1 for r in records if r.status == AttendanceStatus.late)
            total = len(records)
            pct = round((present / total * 100), 2) if total > 0 else 0.0

            total_present += present
            total_classes += total

            subject_summaries.append(
                SubjectAttendanceSummary(
                    subject_id=subj.id,
                    subject_name=subj.name,
                    subject_code=subj.code,
                    total_classes=total,
                    present=present,
                    absent=absent,
                    late=late,
                    attendance_pct=pct,
                )
            )

        overall_pct = round((total_present / total_classes * 100), 2) if total_classes > 0 else 0.0
        report.append(
            StudentAttendanceReport(
                student_id=student.id,
                student_name=student.user.name,
                roll_number=student.roll_number,
                subjects=subject_summaries,
                overall_attendance_pct=overall_pct,
            )
        )

    return AttendanceReportResponse(
        total_students=len(students),
        total_subjects=len(subjects),
        report=report,
    )
