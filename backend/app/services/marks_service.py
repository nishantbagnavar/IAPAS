from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.marks import Marks
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.marks import (
    MarksAddRequest,
    MarksResponse,
    StudentMarksReport,
    SubjectMarksSummary,
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


def _to_response(m: Marks) -> MarksResponse:
    return MarksResponse(
        id=m.id,
        student_id=m.student_id,
        subject_id=m.subject_id,
        exam_type=m.exam_type,
        marks_obtained=m.marks_obtained,
        max_marks=m.max_marks,
        percentage=round((m.marks_obtained / m.max_marks * 100), 2) if m.max_marks > 0 else 0.0,
        recorded_at=m.recorded_at,
    )


def add_marks(req: MarksAddRequest, db: Session) -> MarksResponse:
    _get_student_or_404(req.student_id, db)
    _get_subject_or_404(req.subject_id, db)

    if req.marks_obtained > req.max_marks:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="marks_obtained cannot exceed max_marks",
        )

    record = Marks(
        student_id=req.student_id,
        subject_id=req.subject_id,
        exam_type=req.exam_type,
        marks_obtained=req.marks_obtained,
        max_marks=req.max_marks,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_response(record)


def get_student_marks(student_id: int, db: Session) -> StudentMarksReport:
    student = _get_student_or_404(student_id, db)
    records = db.query(Marks).filter(Marks.student_id == student_id).all()

    subjects = {s.id: s for s in db.query(Subject).all()}
    summaries = []
    total_obtained = total_max = 0.0

    for m in records:
        subj = subjects.get(m.subject_id)
        pct = round((m.marks_obtained / m.max_marks * 100), 2) if m.max_marks > 0 else 0.0
        total_obtained += m.marks_obtained
        total_max += m.max_marks
        summaries.append(
            SubjectMarksSummary(
                subject_id=m.subject_id,
                subject_name=subj.name if subj else "Unknown",
                subject_code=subj.code if subj else "N/A",
                exam_type=m.exam_type,
                marks_obtained=m.marks_obtained,
                max_marks=m.max_marks,
                percentage=pct,
            )
        )

    overall_pct = round((total_obtained / total_max * 100), 2) if total_max > 0 else 0.0
    return StudentMarksReport(
        student_id=student_id,
        student_name=student.user.name,
        roll_number=student.roll_number,
        marks=summaries,
        overall_percentage=overall_pct,
    )


def get_subject_marks(subject_id: int, db: Session) -> List[MarksResponse]:
    _get_subject_or_404(subject_id, db)
    records = db.query(Marks).filter(Marks.subject_id == subject_id).all()
    return [_to_response(m) for m in records]
