from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base


class FacultySubject(Base):
    __tablename__ = "faculty_subjects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (UniqueConstraint("faculty_id", "subject_id", name="uq_faculty_subject"),)

    faculty = relationship("Faculty", back_populates="assigned_subjects")
    subject = relationship("Subject", back_populates="assigned_faculty")
