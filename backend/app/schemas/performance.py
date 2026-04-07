from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class SubjectPrediction(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    attendance_pct: float
    avg_marks_pct: float
    predicted_grade: str
    learning_gap: str
    suggestion: str


class StudentPredictionResponse(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    department: str
    semester: int
    predictions: List[SubjectPrediction]
    overall_predicted_grade: str
    generated_at: datetime


class SubjectDashboardStat(BaseModel):
    subject_id: int
    subject_name: str
    avg_attendance_pct: float
    avg_marks_pct: float
    pass_rate: float


class TopPerformer(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    overall_marks_pct: float
    overall_attendance_pct: float
    predicted_grade: str


class GradeDistribution(BaseModel):
    grade: str
    count: int


class DashboardResponse(BaseModel):
    total_students: int
    total_subjects: int
    avg_attendance_pct: float
    avg_marks_pct: float
    grade_distribution: List[GradeDistribution]
    subject_stats: List[SubjectDashboardStat]
    top_performers: List[TopPerformer]
    low_performers: List[TopPerformer]
