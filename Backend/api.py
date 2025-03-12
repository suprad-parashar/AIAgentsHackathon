from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from database import database
from models import users, courses, resources, enrollments, teaches
from sqlalchemy import select

app = FastAPI()

class UserDetails(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    bio: str = None
    department_or_major: str = None
    role: str

class CourseDetails(BaseModel):
    name: str
    course_number: str
    structure: str = None

class ResourceDetails(BaseModel):
    course_id: int
    link: str

class EnrollmentDetails(BaseModel):
    user_id: int
    course_id: int

class TeachesDetails(BaseModel):
    user_id: int
    course_id: int

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/store-user")
async def store_user(user: UserDetails):
    query = users.select().where(users.c.email == user.email)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    query = users.insert().values(**user.model_dump())
    await database.execute(query)
    return {"message": "User stored successfully"}
