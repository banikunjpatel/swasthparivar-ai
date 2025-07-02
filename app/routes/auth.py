from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.db.mongo import users_collection,families_collection
from fastapi import Depends, status
from app.services.auth import create_refresh_token, hash_password, verify_password, create_access_token

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
    db_user = await families_collection.find_one({"email": user.email})
    # print("Provided password:", user.password)
    # print("Stored hashed password:", db_user.get("password"))
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    response_data = {
            "userId": str(db_user["_id"]),
            "email": db_user["email"],
            "name": db_user.get("name"),
            "isVerified": db_user.get("isVerified", False),
            "createdAt": db_user.get("createdAt", None),
            "updatedAt": db_user.get("updatedAt", None)
        }
    tokens = {
            "accessToken": token,
            "refreshToken": refresh_token
    }
    
    return {"status": 200,"message": "User login successfully","user": response_data,"tokens": tokens, "expires_in_days": 7}

# @router.post("/logout", status_code=status.HTTP_200_OK)
# async def logout(current_user: str = Depends(get_current_user)):
#     return {"message": f"User '{current_user}' logged out (client should discard token)."}