from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.db.mongo import users_collection
from app.services.auth import hash_password, verify_password, create_access_token

router = APIRouter()

class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserSignup):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    await users_collection.insert_one({"email": user.email, "password": hashed})
    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "expires_in_days": 7}