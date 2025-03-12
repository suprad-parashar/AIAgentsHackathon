from sqlalchemy import Table, Column, Integer, String, Text, ForeignKey, MetaData, CheckConstraint

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255), nullable=False),
    Column("email", String(255), unique=True, nullable=False),
    Column("bio", Text),
    Column("department_or_major", String(255), nullable=False),
    Column("role", String(50), CheckConstraint("role IN ('student', 'professor')"), nullable=False),
)

courses = Table(
    "courses",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255), nullable=False),
    Column("course_number", String(50), unique=True, nullable=False),
    Column("structure", Text),
)

resources = Table(
    "resources",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("course_id", Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
    Column("link", Text, nullable=False),
)

enrollments = Table(
    "enrollments",
    metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("course_id", Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
)

teaches = Table(
    "teaches",
    metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("course_id", Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
)