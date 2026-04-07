"""
Seed script: creates the iapas_db database (if not exists), creates all tables,
and inserts realistic dummy data.

Run with:  python seed.py   (from backend/ with venv activated)
"""

import os
import sys
import random
from datetime import date, timedelta, datetime

import pymysql
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

# ── 1. Ensure the database itself exists ─────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/iapas_db")

# Parse host / port / db name from the URL
# Format: mysql+pymysql://user:pass@host:port/dbname
_parts = DATABASE_URL.split("//")[1]          # user:pass@host:port/dbname
_credentials, _rest = _parts.split("@")
_user_pass = _credentials.split(":")
_db_user = _user_pass[0]
_db_pass = _user_pass[1] if len(_user_pass) > 1 else ""
_host_port, _db_name = _rest.split("/")
_host_parts = _host_port.split(":")
_db_host = _host_parts[0]
_db_port = int(_host_parts[1]) if len(_host_parts) > 1 else 3306

print(f"Connecting to MySQL at {_db_host}:{_db_port} as '{_db_user}' ...")

conn = pymysql.connect(host=_db_host, port=_db_port, user=_db_user, password=_db_pass)
with conn.cursor() as cur:
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{_db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
conn.close()
print(f"Database '{_db_name}' ready.")

# ── 2. Import models (after DB exists) & create all tables ───────────────────
from app.db.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.subject import Subject
from app.models.attendance import Attendance, AttendanceStatus
from app.models.marks import Marks, ExamType
from app.models.performance_insight import PerformanceInsight
import bcrypt

# Drop all and recreate — disable FK checks first so MySQL allows it
with engine.connect() as _con:
    _con.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
    Base.metadata.drop_all(bind=_con)
    Base.metadata.create_all(bind=_con)
    _con.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    _con.commit()
print("All tables dropped and recreated.")


# ── 3. Helper ─────────────────────────────────────────────────────────────────
def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# ── 4. Open session ───────────────────────────────────────────────────────────
db = SessionLocal()

def wipe():
    pass  # tables are freshly created above

wipe()

# ── 5. Departments & subjects data ───────────────────────────────────────────
DEPT = "Computer Science"

SUBJECTS_DATA = [
    ("Data Structures & Algorithms", "CS301", DEPT, 3, 4),
    ("Database Management Systems", "CS302", DEPT, 3, 4),
    ("Operating Systems",           "CS303", DEPT, 3, 3),
    ("Computer Networks",           "CS304", DEPT, 3, 3),
    ("Machine Learning",            "CS305", DEPT, 3, 4),
]

# ── 6. Insert Subjects ────────────────────────────────────────────────────────
subjects = []
for name, code, dept, sem, credits in SUBJECTS_DATA:
    s = Subject(name=name, code=code, department=dept, semester=sem, credits=credits)
    db.add(s)
    subjects.append(s)
db.flush()
print(f"Inserted {len(subjects)} subjects.")

# ── 7. Insert Admin ───────────────────────────────────────────────────────────
admin_user = User(
    name="Dr. Admin Kumar",
    email="admin@iapas.edu",
    password_hash=hash_pw("Admin@123"),
    role=UserRole.admin,
)
db.add(admin_user)
db.flush()
print("Inserted admin.")

# ── 8. Insert Faculty ─────────────────────────────────────────────────────────
FACULTY_DATA = [
    ("Prof. Anita Sharma",   "anita.sharma@iapas.edu",   "Data Structures & Algorithms, Machine Learning"),
    ("Prof. Rajesh Gupta",   "rajesh.gupta@iapas.edu",   "Database Management Systems, Operating Systems"),
    ("Prof. Priya Nair",     "priya.nair@iapas.edu",     "Computer Networks, Machine Learning"),
]

faculty_list = []
for f_name, f_email, f_spec in FACULTY_DATA:
    u = User(
        name=f_name,
        email=f_email,
        password_hash=hash_pw("Faculty@123"),
        role=UserRole.faculty,
    )
    db.add(u)
    db.flush()
    f = Faculty(user_id=u.id, department=DEPT, subject_specialization=f_spec)
    db.add(f)
    faculty_list.append(f)
db.flush()
print(f"Inserted {len(faculty_list)} faculty.")

# ── 9. Insert Students ────────────────────────────────────────────────────────
STUDENT_DATA = [
    ("Aarav Mehta",     "aarav.mehta@student.iapas.edu",     "CS2301"),
    ("Diya Patel",      "diya.patel@student.iapas.edu",      "CS2302"),
    ("Karan Singh",     "karan.singh@student.iapas.edu",     "CS2303"),
    ("Sneha Reddy",     "sneha.reddy@student.iapas.edu",     "CS2304"),
    ("Vikram Joshi",    "vikram.joshi@student.iapas.edu",    "CS2305"),
    ("Pooja Iyer",      "pooja.iyer@student.iapas.edu",      "CS2306"),
    ("Arjun Kapoor",    "arjun.kapoor@student.iapas.edu",    "CS2307"),
    ("Nisha Verma",     "nisha.verma@student.iapas.edu",     "CS2308"),
    ("Rohit Das",       "rohit.das@student.iapas.edu",       "CS2309"),
    ("Meera Nambiar",   "meera.nambiar@student.iapas.edu",   "CS2310"),
]

students = []
for s_name, s_email, roll in STUDENT_DATA:
    u = User(
        name=s_name,
        email=s_email,
        password_hash=hash_pw("Student@123"),
        role=UserRole.student,
    )
    db.add(u)
    db.flush()
    st = Student(
        user_id=u.id,
        roll_number=roll,
        department=DEPT,
        semester=3,
        year=2,
    )
    db.add(st)
    students.append(st)
db.flush()
print(f"Inserted {len(students)} students.")

# ── 10. Attendance — last 30 weekdays ─────────────────────────────────────────
today = date.today()
weekdays = []
delta = 0
while len(weekdays) < 30:
    d = today - timedelta(days=delta)
    if d.weekday() < 5:   # Mon–Fri only
        weekdays.append(d)
    delta += 1

# Realistic per-student attendance probability
STUDENT_PRESENCE_PROB = [
    0.95, 0.92, 0.78, 0.88, 0.60,   # students 0-4
    0.97, 0.85, 0.70, 0.90, 0.82,   # students 5-9
]

attendance_rows = []
for st_idx, student in enumerate(students):
    prob = STUDENT_PRESENCE_PROB[st_idx]
    for subject in subjects:
        for day in weekdays:
            roll = random.random()
            if roll < prob:
                status = AttendanceStatus.present
            elif roll < prob + 0.05:
                status = AttendanceStatus.late
            else:
                status = AttendanceStatus.absent
            attendance_rows.append(Attendance(
                student_id=student.id,
                subject_id=subject.id,
                date=day,
                status=status,
            ))

db.bulk_save_objects(attendance_rows)
db.flush()
print(f"Inserted {len(attendance_rows)} attendance records.")

# ── 11. Marks ─────────────────────────────────────────────────────────────────
# Each student × subject gets: 2 internals, 1 external, 2 assignments
EXAM_CONFIGS = [
    (ExamType.internal,   30.0, "IA1"),
    (ExamType.internal,   30.0, "IA2"),
    (ExamType.external,  100.0, "End-Sem"),
    (ExamType.assignment, 10.0, "Asgn1"),
    (ExamType.assignment, 10.0, "Asgn2"),
]

# Per-student performance tier: (mean_pct, std_dev)
STUDENT_PERF = [
    (0.88, 0.05),  # Aarav   — high performer
    (0.82, 0.06),  # Diya
    (0.65, 0.10),  # Karan   — average
    (0.78, 0.07),  # Sneha
    (0.52, 0.12),  # Vikram  — struggling
    (0.91, 0.04),  # Pooja   — top performer
    (0.74, 0.08),  # Arjun
    (0.60, 0.11),  # Nisha
    (0.85, 0.05),  # Rohit
    (0.70, 0.09),  # Meera
]

marks_rows = []
recorded_base = datetime.now() - timedelta(days=10)

for st_idx, student in enumerate(students):
    mean_pct, std = STUDENT_PERF[st_idx]
    for subject in subjects:
        for exam_type, max_marks, _ in EXAM_CONFIGS:
            pct = min(1.0, max(0.20, random.gauss(mean_pct, std)))
            obtained = round(pct * max_marks, 1)
            marks_rows.append(Marks(
                student_id=student.id,
                subject_id=subject.id,
                exam_type=exam_type,
                marks_obtained=obtained,
                max_marks=max_marks,
                recorded_at=recorded_base + timedelta(hours=random.randint(0, 240)),
            ))

db.bulk_save_objects(marks_rows)
db.flush()
print(f"Inserted {len(marks_rows)} marks records.")

# ── 12. Performance Insights ──────────────────────────────────────────────────
GRADE_THRESHOLDS = [
    (0.90, "A+"), (0.80, "A"), (0.70, "B+"),
    (0.60, "B"),  (0.50, "C"), (0.00, "F"),
]

LEARNING_GAPS = {
    "A+": "No significant gaps identified.",
    "A":  "Minor gaps in advanced problem-solving topics.",
    "B+": "Some difficulty with complex algorithmic concepts.",
    "B":  "Needs to strengthen understanding of core theory.",
    "C":  "Significant gaps in fundamentals; requires focused review.",
    "F":  "Critical gaps across most topics; immediate intervention needed.",
}

SUGGESTIONS = {
    "A+": "Continue current study habits. Explore research papers and competitive coding.",
    "A":  "Review edge-case scenarios in recent exams. Participate in peer study groups.",
    "B+": "Practice additional problem sets. Focus on time-management during exams.",
    "B":  "Revisit lecture notes on weak areas. Schedule faculty consultation sessions.",
    "C":  "Attend extra help sessions. Complete all assignments and missed work immediately.",
    "F":  "Urgent: meet with faculty advisor. Consider remedial coursework and tutoring support.",
}

def compute_avg_pct(student_id: int, subject_id: int) -> float:
    rows = [
        m for m in marks_rows
        if m.student_id == student_id and m.subject_id == subject_id
    ]
    if not rows:
        return 0.0
    total_obtained = sum(m.marks_obtained for m in rows)
    total_max = sum(m.max_marks for m in rows)
    return total_obtained / total_max if total_max else 0.0

def grade_from_pct(pct: float) -> str:
    for threshold, g in GRADE_THRESHOLDS:
        if pct >= threshold:
            return g
    return "F"

insight_rows = []
for student in students:
    for subject in subjects:
        avg = compute_avg_pct(student.id, subject.id)
        grade = grade_from_pct(avg)
        insight_rows.append(PerformanceInsight(
            student_id=student.id,
            subject_id=subject.id,
            predicted_grade=grade,
            learning_gap=LEARNING_GAPS[grade],
            suggestion=SUGGESTIONS[grade],
            generated_at=datetime.now(),
        ))

db.bulk_save_objects(insight_rows)
db.commit()
print(f"Inserted {len(insight_rows)} performance insights.")

# ── 13. Summary ───────────────────────────────────────────────────────────────
print("\n" + "=" * 50)
print("  Seed completed successfully!")
print("=" * 50)
print(f"  Users    : 1 admin + {len(faculty_list)} faculty + {len(students)} students")
print(f"  Subjects : {len(subjects)}")
print(f"  Attendance: {len(attendance_rows)} rows  ({len(weekdays)} days × {len(students)} students × {len(subjects)} subjects)")
print(f"  Marks    : {len(marks_rows)} rows")
print(f"  Insights : {len(insight_rows)} rows")
print("=" * 50)
print("\nDefault credentials:")
print("  Admin   : admin@iapas.edu        / Admin@123")
print("  Faculty : anita.sharma@iapas.edu / Faculty@123")
print("  Student : aarav.mehta@student.iapas.edu / Student@123")

db.close()
