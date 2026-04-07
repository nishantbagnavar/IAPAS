from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator

from app.models.marks import ExamType


class MarksAddRequest(BaseModel):
    student_id: int
    subject_id: int
    exam_type: ExamType
    marks_obtained: float
    max_marks: float

    @field_validator("marks_obtained")
    @classmethod
    def obtained_lte_max(cls, v, info):
        # We validate against max_marks in the service layer
        if v < 0:
            raise ValueError("marks_obtained cannot be negative")
        return v

    @field_validator("max_marks")
    @classmethod
    def max_marks_positive(cls, v):
        if v <= 0:
            raise ValueError("max_marks must be positive")
        return v


class MarksResponse(BaseModel):
    id: int
    student_id: int
    subject_id: int
    exam_type: ExamType
    marks_obtained: float
    max_marks: float
    percentage: float
    recorded_at: datetime

    model_config = {"from_attributes": True}


class SubjectMarksSummary(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    exam_type: ExamType
    marks_obtained: float
    max_marks: float
    percentage: float


class StudentMarksReport(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    marks: List[SubjectMarksSummary]
    overall_percentage: float
