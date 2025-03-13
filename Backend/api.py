from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import database
from models import users
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserDetails(BaseModel):
    id: str
    name: str
    email: str
    role: str = None
    bio: str = None
    department_or_major: str = None

class Course(BaseModel):
    id: int
    name: str
    course_number: str
    structure: str = None

@app.on_event("startup")
async def startup():
    if not database.is_connected:
        await database.connect()

@app.on_event("shutdown")
async def shutdown():
    if database.is_connected:
        await database.disconnect()

@app.post("/auth/google")
async def store_user(user: UserDetails):
    if not database.is_connected:
        await database.connect()  # Ensure database connection is available

    query = users.select().where(users.c.email == user.email)
    existing_user = await database.fetch_one(query)

    if existing_user:
        return JSONResponse(status_code=200, content={"message": "User already exists"})

    query = users.insert().values(id=user.id, name=user.name, email=user.email, role=None)
    await database.execute(query)
    return JSONResponse(status_code=201, content={"message": "User stored successfully"})

@app.get("/users/role")
async def get_user_role(email: str = Query(...)):
    if not database.is_connected:
        await database.connect()

    query = users.select().where(users.c.email == email)
    user = await database.fetch_one(query)

    if not user:
        return JSONResponse(status_code=200, content={"role": None})  # Return None if no role

    return {"role": user["role"]}

@app.post("/users/role")
async def store_role(user: UserDetails):
    if not database.is_connected:
        await database.connect()

    query = users.update().where(users.c.email == user.email).values(role=user.role)
    await database.execute(query)
    return {"message": "Role stored successfully"}

@app.put("/users/profile")
async def update_user_profile(user: UserDetails):
    if not database.is_connected:
        await database.connect()

    # Check if the user exists
    query = users.select().where(users.c.email == user.email)
    existing_user = await database.fetch_one(query)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user details
    query = users.update().where(users.c.email == user.email).values(
        name=user.name,
        bio=user.bio,
        department_or_major=user.department_or_major
    )
    await database.execute(query)

    return {"message": "User profile updated successfully"}

@app.get("/users/details")
async def get_user_details(email: str = Query(...)):
    if not database.is_connected:
        await database.connect()

    query = users.select().where(users.c.email == email)
    user = await database.fetch_one(query)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "bio": user["bio"],
        "department_or_major": user["department_or_major"]
    }

@app.get("/users/{user_id}/enrolled_courses")
async def get_enrolled_courses(user_id: str):
    if not database.is_connected:
        await database.connect()

    query = """
    SELECT courses.id, courses.name, courses.course_number, courses.structure
    FROM courses
    JOIN enrollments ON courses.id = enrollments.course_id
    WHERE enrollments.user_id = :user_id
    """
    courses = await database.fetch_all(query, values={"user_id": user_id})

    courses_list = [dict(course) for course in courses]
    print("Enrolled courses:", courses_list)

    return JSONResponse(status_code=200, content=courses_list)
@app.get("/users/{user_id}/taught_courses")
async def get_taught_courses(user_id: str):
    if not database.is_connected:
        await database.connect()

    query = """
    SELECT courses.id, courses.name, courses.course_number, courses.structure
    FROM courses
    JOIN teaches ON courses.id = teaches.course_id
    WHERE teaches.user_id = :user_id
    """
    courses = await database.fetch_all(query, values={"user_id": user_id})

    # ✅ Convert Record objects to dictionaries
    courses_list = [dict(course) for course in courses]
    print("These are courses:", courses_list)

    return JSONResponse(status_code=200, content=courses_list)