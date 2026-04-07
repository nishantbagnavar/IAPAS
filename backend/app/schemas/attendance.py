from datetime import date
from typing import List, Optional
from pydantic import BaseModel

from app.models.attendance import AttendanceStatus


class AttendanceMarkRequest(BaseModel):
    student_id: int
    subject_id: int
    date: date
    status: AttendanceStatus = AttendanceStatus.present


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    subject_id: int
    date: date
    status: AttendanceStatus

    model_config = {"from_attributes": True}


class SubjectAttendanceSummary(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    total_classes: int
    present: int
    absent: int
    late: int
    attendance_pct: float


class StudentAttendanceReport(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    subjects: List[SubjectAttendanceSummary]
    overall_attendance_pct: float


class AttendanceReportResponse(BaseModel):
    total_students: int
    total_subjects: int
    report: List[StudentAttendanceReport]
