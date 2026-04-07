from app.api.routes.auth import router as auth_router
from app.api.routes.attendance import router as attendance_router
from app.api.routes.marks import router as marks_router
from app.api.routes.performance import router as performance_router
from app.api.routes.admin import router as admin_router
from app.api.routes.subjects_students import router as subjects_students_router

__all__ = [
    "auth_router",
    "attendance_router",
    "marks_router",
    "performance_router",
    "admin_router",
    "subjects_students_router",
]
