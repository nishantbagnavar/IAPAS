from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import text
from app.db.database import engine, Base
import app.models  # noqa: F401 — registers all ORM models with Base

with engine.connect() as _con:
    _con.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
    Base.metadata.create_all(bind=_con)
    _con.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    _con.commit()

from app.api.routes import (
    auth_router,
    attendance_router,
    marks_router,
    performance_router,
    admin_router,
    subjects_students_router,
)

app = FastAPI(
    title="IAPAS API",
    description="Intelligent Academic Process Automation System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(attendance_router)
app.include_router(marks_router)
app.include_router(performance_router)
app.include_router(admin_router)
app.include_router(subjects_students_router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "IAPAS API is running", "docs": "/docs"}
