from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class PerformanceInsight(Base):
    __tablename__ = "performance_insights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_grade = Column(String(5), nullable=False)
    learning_gap = Column(Text, nullable=True)
    suggestion = Column(Text, nullable=True)
    generated_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="performance_insights")
    subject = relationship("Subject", back_populates="performance_insights")
