from sqlalchemy import Column, Integer, ForeignKey, Enum, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.database import Base


class ExamType(str, enum.Enum):
    internal = "internal"
    external = "external"
    assignment = "assignment"


class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_type = Column(Enum(ExamType), nullable=False)
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False)
    recorded_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="marks_records")
    subject = relationship("Subject", back_populates="marks_records")
