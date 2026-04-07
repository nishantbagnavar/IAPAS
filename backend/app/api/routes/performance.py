from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.student import Student
from app.schemas.performance import StudentPredictionResponse, DashboardResponse
from app.services import performance_service

router = APIRouter(prefix="/api/performance", tags=["AI/ML Performance"])


@router.get(
    "/predict/{student_id}",
    response_model=StudentPredictionResponse,
    summary="Predict grades for a student using ML (scikit-learn RandomForest)",
)
def predict(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Students can only view their own prediction
    if current_user.role == UserRole.student:
        profile = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not profile or profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only view their own predictions",
            )
    return performance_service.predict_student(student_id, db)


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    summary="Aggregate performance stats for the faculty dashboard (faculty/admin only)",
)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.faculty, UserRole.admin)),
):
    return performance_service.get_dashboard(db)
