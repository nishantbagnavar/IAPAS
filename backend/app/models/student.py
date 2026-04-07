from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number = Column(String(20), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    marks_records = relationship("Marks", back_populates="student", cascade="all, delete-orphan")
    performance_insights = relationship("PerformanceInsight", back_populates="student", cascade="all, delete-orphan")
