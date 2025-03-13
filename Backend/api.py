from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import database
from models import users
from sqlalchemy import select
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
    name: str
    email: str
    role: str = None

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

    query = users.insert().values(name=user.name, email=user.email, role=None)
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
