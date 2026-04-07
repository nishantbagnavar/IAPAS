"""
Performance prediction service.

Uses scikit-learn (RandomForestClassifier) to predict a student's grade per subject
from two features:
  - attendance_pct  : % of classes marked present or late
  - avg_marks_pct   : weighted average % across all exam types

The model is trained on all student-subject data points available in the DB
(typically 50 rows from seed: 10 students × 5 subjects) and immediately used
for inference.  Grade labels are derived from the actual weighted marks average.
"""

from datetime import datetime
from typing import List, Dict, Tuple

import numpy as np
from fastapi import HTTPException, status
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sqlalchemy.orm import Session

from app.models.attendance import Attendance, AttendanceStatus
from app.models.marks import Marks, ExamType
from app.models.performance_insight import PerformanceInsight
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.performance import (
    DashboardResponse,
    GradeDistribution,
    StudentPredictionResponse,
    SubjectDashboardStat,
    SubjectPrediction,
    TopPerformer,
)

# ── Grade thresholds ──────────────────────────────────────────────────────────
GRADE_THRESHOLDS = [
    (90.0, "A+"),
    (80.0, "A"),
    (70.0, "B+"),
    (60.0, "B"),
    (50.0, "C"),
    (0.0,  "F"),
]

LEARNING_GAPS: Dict[str, str] = {
    "A+": "No significant gaps identified.",
    "A":  "Minor gaps in advanced problem-solving topics.",
    "B+": "Some difficulty with complex algorithmic concepts.",
    "B":  "Needs to strengthen understanding of core theory.",
    "C":  "Significant gaps in fundamentals; requires focused review.",
    "F":  "Critical gaps across most topics; immediate intervention needed.",
}

SUGGESTIONS: Dict[str, str] = {
    "A+": "Continue current study habits. Explore research papers and competitive coding.",
    "A":  "Review edge-case scenarios. Participate in peer study groups.",
    "B+": "Practice additional problem sets. Focus on time-management during exams.",
    "B":  "Revisit lecture notes on weak areas. Schedule faculty consultation sessions.",
    "C":  "Attend extra help sessions. Complete all assignments and missed work immediately.",
    "F":  "Urgent: meet with faculty advisor. Consider remedial coursework and tutoring.",
}


def _grade_from_pct(pct: float) -> str:
    for threshold, grade in GRADE_THRESHOLDS:
        if pct >= threshold:
            return grade
    return "F"


def _overall_grade(grades: List[str]) -> str:
    """Return the most common predicted grade; ties broken by worst."""
    if not grades:
        return "F"
    order = ["A+", "A", "B+", "B", "C", "F"]
    counts = {g: grades.count(g) for g in order}
    return max(counts, key=lambda g: (counts[g], -order.index(g)))


def _compute_features_for_all(db: Session) -> Tuple[List[List[float]], List[str], Dict]:
    """
    Returns:
        X          : feature matrix  [[att_pct, avg_marks_pct], ...]
        y          : grade labels     ["A+", "B", ...]
        student_subject_map : { student_id: { subject_id: (features, grade) } }
    """
    students = db.query(Student).all()
    subjects = db.query(Subject).all()

    X, y = [], []
    student_subject_map: Dict[int, Dict[int, Tuple[List[float], str]]] = {}

    for student in students:
        student_subject_map[student.id] = {}
        for subj in subjects:
            # — Attendance —
            att_records = (
                db.query(Attendance)
                .filter(
                    Attendance.student_id == student.id,
                    Attendance.subject_id == subj.id,
                )
                .all()
            )
            total_att = len(att_records)
            present_att = sum(
                1 for r in att_records
                if r.status in (AttendanceStatus.present, AttendanceStatus.late)
            )
            att_pct = (present_att / total_att * 100) if total_att > 0 else 0.0

            # — Marks (weighted average across all exam types) —
            mark_records = (
                db.query(Marks)
                .filter(
                    Marks.student_id == student.id,
                    Marks.subject_id == subj.id,
                )
                .all()
            )
            total_obtained = sum(m.marks_obtained for m in mark_records)
            total_max = sum(m.max_marks for m in mark_records)
            avg_marks_pct = (total_obtained / total_max * 100) if total_max > 0 else 0.0

            features = [att_pct, avg_marks_pct]
            grade = _grade_from_pct(avg_marks_pct)

            X.append(features)
            y.append(grade)
            student_subject_map[student.id][subj.id] = (features, grade)

    return X, y, student_subject_map


def _build_model(X: List[List[float]], y: List[str]):
    """Train a RandomForestClassifier and return (model, label_encoder)."""
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=4,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(np.array(X), y_enc)
    return clf, le


def predict_student(student_id: int, db: Session) -> StudentPredictionResponse:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    subjects = {s.id: s for s in db.query(Subject).all()}

    X, y, ssmap = _compute_features_for_all(db)

    if len(set(y)) < 2:
        # Not enough label diversity to train; fall back to rule-based
        subject_predictions = []
        for subj_id, (features, grade) in ssmap.get(student_id, {}).items():
            subj = subjects[subj_id]
            subject_predictions.append(
                SubjectPrediction(
                    subject_id=subj_id,
                    subject_name=subj.name,
                    subject_code=subj.code,
                    attendance_pct=round(features[0], 2),
                    avg_marks_pct=round(features[1], 2),
                    predicted_grade=grade,
                    learning_gap=LEARNING_GAPS[grade],
                    suggestion=SUGGESTIONS[grade],
                )
            )
    else:
        clf, le = _build_model(X, y)

        subject_predictions = []
        for subj_id, (features, _) in ssmap.get(student_id, {}).items():
            subj = subjects[subj_id]
            pred_enc = clf.predict(np.array([features]))[0]
            grade = le.inverse_transform([pred_enc])[0]
            subject_predictions.append(
                SubjectPrediction(
                    subject_id=subj_id,
                    subject_name=subj.name,
                    subject_code=subj.code,
                    attendance_pct=round(features[0], 2),
                    avg_marks_pct=round(features[1], 2),
                    predicted_grade=grade,
                    learning_gap=LEARNING_GAPS[grade],
                    suggestion=SUGGESTIONS[grade],
                )
            )

    overall = _overall_grade([sp.predicted_grade for sp in subject_predictions])
    now = datetime.now()

    # Persist / refresh insights in DB
    for sp in subject_predictions:
        existing = (
            db.query(PerformanceInsight)
            .filter(
                PerformanceInsight.student_id == student_id,
                PerformanceInsight.subject_id == sp.subject_id,
            )
            .first()
        )
        if existing:
            existing.predicted_grade = sp.predicted_grade
            existing.learning_gap = sp.learning_gap
            existing.suggestion = sp.suggestion
            existing.generated_at = now
        else:
            db.add(
                PerformanceInsight(
                    student_id=student_id,
                    subject_id=sp.subject_id,
                    predicted_grade=sp.predicted_grade,
                    learning_gap=sp.learning_gap,
                    suggestion=sp.suggestion,
                    generated_at=now,
                )
            )
    db.commit()

    return StudentPredictionResponse(
        student_id=student_id,
        student_name=student.user.name,
        roll_number=student.roll_number,
        department=student.department,
        semester=student.semester,
        predictions=subject_predictions,
        overall_predicted_grade=overall,
        generated_at=now,
    )


def get_dashboard(db: Session) -> DashboardResponse:
    students = db.query(Student).all()
    subjects = db.query(Subject).all()

    X, y, ssmap = _compute_features_for_all(db)

    # Build predictions for all students
    if len(set(y)) >= 2:
        clf, le = _build_model(X, y)
    else:
        clf = le = None

    student_stats: List[Dict] = []  # {student, avg_att, avg_marks, grade}
    subject_att_totals: Dict[int, List[float]] = {s.id: [] for s in subjects}
    subject_marks_totals: Dict[int, List[float]] = {s.id: [] for s in subjects}
    all_grades: List[str] = []

    for student in students:
        atts, marks_pcts, grades = [], [], []
        for subj in subjects:
            data = ssmap.get(student.id, {}).get(subj.id)
            if not data:
                continue
            features, _ = data
            att_pct, avg_marks_pct = features

            if clf and le:
                pred_enc = clf.predict(np.array([features]))[0]
                grade = le.inverse_transform([pred_enc])[0]
            else:
                grade = _grade_from_pct(avg_marks_pct)

            atts.append(att_pct)
            marks_pcts.append(avg_marks_pct)
            grades.append(grade)
            subject_att_totals[subj.id].append(att_pct)
            subject_marks_totals[subj.id].append(avg_marks_pct)

        overall_grade = _overall_grade(grades)
        all_grades.append(overall_grade)
        student_stats.append(
            {
                "student": student,
                "avg_att": round(float(np.mean(atts)), 2) if atts else 0.0,
                "avg_marks": round(float(np.mean(marks_pcts)), 2) if marks_pcts else 0.0,
                "grade": overall_grade,
            }
        )

    # Aggregate stats
    avg_att = round(float(np.mean([s["avg_att"] for s in student_stats])), 2) if student_stats else 0.0
    avg_marks = round(float(np.mean([s["avg_marks"] for s in student_stats])), 2) if student_stats else 0.0

    grade_order = ["A+", "A", "B+", "B", "C", "F"]
    grade_dist = [
        GradeDistribution(grade=g, count=all_grades.count(g)) for g in grade_order
    ]

    subject_stats_list = [
        SubjectDashboardStat(
            subject_id=subj.id,
            subject_name=subj.name,
            avg_attendance_pct=round(float(np.mean(subject_att_totals[subj.id])), 2)
            if subject_att_totals[subj.id]
            else 0.0,
            avg_marks_pct=round(float(np.mean(subject_marks_totals[subj.id])), 2)
            if subject_marks_totals[subj.id]
            else 0.0,
            pass_rate=round(
                sum(1 for g in [_grade_from_pct(p) for p in subject_marks_totals[subj.id]] if g != "F")
                / max(len(subject_marks_totals[subj.id]), 1)
                * 100,
                2,
            ),
        )
        for subj in subjects
    ]

    sorted_by_marks = sorted(student_stats, key=lambda s: s["avg_marks"], reverse=True)

    def _to_performer(s: dict) -> TopPerformer:
        return TopPerformer(
            student_id=s["student"].id,
            student_name=s["student"].user.name,
            roll_number=s["student"].roll_number,
            overall_marks_pct=s["avg_marks"],
            overall_attendance_pct=s["avg_att"],
            predicted_grade=s["grade"],
        )

    return DashboardResponse(
        total_students=len(students),
        total_subjects=len(subjects),
        avg_attendance_pct=avg_att,
        avg_marks_pct=avg_marks,
        grade_distribution=grade_dist,
        subject_stats=subject_stats_list,
        top_performers=[_to_performer(s) for s in sorted_by_marks[:3]],
        low_performers=[_to_performer(s) for s in sorted_by_marks[-3:]],
    )
