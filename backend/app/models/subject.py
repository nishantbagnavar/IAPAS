from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    credits = Column(Integer, nullable=False)

    # Relationships
    attendance_records = relationship("Attendance", back_populates="subject", cascade="all, delete-orphan")
    marks_records = relationship("Marks", back_populates="subject", cascade="all, delete-orphan")
    performance_insights = relationship("PerformanceInsight", back_populates="subject", cascade="all, delete-orphan")
    assigned_faculty = relationship("FacultySubject", back_populates="subject", cascade="all, delete-orphan")
