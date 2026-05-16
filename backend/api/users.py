# backend/api/users.py
from __future__ import annotations
import os
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, Field, EmailStr
from jose import jwt
from firebase_admin import auth as fb_auth, credentials, initialize_app, _apps
from db.mongo import db  # your Motor global db
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/users", tags=["users"])

# JWT env
JWT_SECRET   = os.getenv("JWT_SECRET", "change-me")
JWT_ALG      = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_MIN   = int(os.getenv("ACCESS_TOKEN_MIN", "30"))
REFRESH_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))
ISSUER       = os.getenv("JWT_ISSUER", "swasthparivar-ai")

if not _apps:
    cred_env = os.getenv("FIREBASE_CREDENTIALS")
    # repo_backend_dir points to backend/
    repo_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    # repo_root is project root (one level above backend/)
    repo_root = os.path.abspath(os.path.join(repo_backend_dir, ".."))
    default_cred = os.path.join(repo_backend_dir, "credentials", "firebase-service-account.json")

    if cred_env:
        # if absolute path provided, use it; if relative, resolve relative to project root
        cred_path = cred_env if os.path.isabs(cred_env) else os.path.abspath(os.path.join(repo_root, cred_env))
    else:
        cred_path = default_cred

    if not os.path.exists(cred_path):
        raise RuntimeError(
            f"Firebase credentials not found at: {cred_path}. "
            "Set FIREBASE_CREDENTIALS env to the absolute path of your service account JSON."
        )

    initialize_app(credentials.Certificate(cred_path))
    
def _now(): return datetime.now(timezone.utc)
def _make_token(sub: str, minutes: int, typ: str) -> str:
    n = _now()
    payload = {
        "sub": sub, "typ": typ, "iss": ISSUER,
        "iat": int(n.timestamp()),
        "exp": int((n + timedelta(minutes=minutes)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

class RegisterBody(BaseModel):
    # REQUIRED Firebase idToken proves the phone
    idToken: Optional[str] = None
    uid: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    createdAt: Optional[str] = None  # RFC1123 string expected like "Thu, 06 Nov 2025 04:21:40 GMT"
    emailVerified: Optional[bool] = None
    season: Optional[str] = None

@router.post("/register")
async def register_user(body: RegisterBody, authorization: Optional[str] = Header(None)):
    print("Register user called with:", body.dict())
    # 1) Verify Firebase token
    token = body.idToken
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]

    firebase_uid = None
    phone = None
    email = None
    email_verified = False
    created_at = None

    name = None
    if token:
        # verify firebase id token with clock skew tolerance
        try:
            # Add 60 seconds clock skew tolerance to handle time sync issues
            decoded = fb_auth.verify_id_token(token, clock_skew_seconds=60)
            firebase_uid = decoded.get("uid")
            phone = decoded.get("phone_number")
            email = decoded.get("email")
            email_verified = decoded.get("email_verified", False)
            name = decoded.get("name")  # Google/social providers include display name
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Firebase token: {e}")
    else:
        # Use payload fields sent from client
        firebase_uid = body.uid
        phone = body.phoneNumber or None
        email = body.email or None
        email_verified = bool(body.emailVerified)

    # Prefer token name, fall back to payload name
    if not name and body.name:
        name = body.name

    # parse createdAt if present
    if body.createdAt:
        try:
            created_at = parsedate_to_datetime(body.createdAt)
        except Exception:
            created_at = None

    now = _now()

    # 2) Find existing user by firebase_uid or email
    query = {}
    if firebase_uid:
        query = {"firebase_uid": firebase_uid}
    elif email:
        query = {"email": email.lower()}
    else:
        # no identifier provided
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing uid or idToken or email")

    user = await db.users.find_one(query)

    # Prepare update doc only with fields provided
    updates = {"updated_at": now}
    
    # Only set created_at for new users, never update it for existing users
    # This preserves the user's journey start date
    if not user and created_at is not None:
        # New user with provided created_at
        pass  # Will be set in doc creation below
    
    if name:
        updates["name"] = name
    if email:
        updates["email"] = email.lower()
    updates["emailVerified"] = email_verified
    if phone:
        updates["phone"] = phone
    if firebase_uid:
        updates["firebase_uid"] = firebase_uid
    if body.season:
        updates["season"] = body.season
        updates["seasonLastUpdated"] = now

    is_new_user = False
    if not user:
        doc = {
            "created_at": created_at or now,
            **updates
        }
        ins = await db.users.insert_one(doc)
        user_id = str(ins.inserted_id)
        user_doc = {"_id": ins.inserted_id, **doc}
        is_new_user = True
    else:
        # Existing user - update fields but NEVER update created_at
        await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
        user_id = str(user["_id"])
        user_doc = {**user, **updates}

    # 3) Auto-create self member for new users
    if is_new_user:
        # Check if member already exists (safety check)
        existing_member = await db.members.find_one({"userId": user_id})
        
        if not existing_member:
            # Get user data for member creation
            # Fetch the complete user document to get all fields
            complete_user = await db.users.find_one({"_id": user_doc["_id"]})
            
            # Create self member entry with user data
            self_member = {
                "userId": user_id,
                "fullName": complete_user.get("name") or "Me",  # Use user's name or default to "Me"
                "age": complete_user.get("age"),  # Will be None if not set
                "gender": None,  # Gender not collected during registration
                "dietaryPreferences": complete_user.get("preference") or "vegetarian",  # Default to vegetarian
                "state": complete_user.get("region"),  # Use user's region
                "isPrimary": True,  # Mark as primary member
                "createdAt": now,
                "updatedAt": now,
            }
            
            result = await db.members.insert_one(self_member)
            print(f"Auto-created self member for user {user_id} with ID {result.inserted_id}")
            print(f"Member details: name={self_member['fullName']}, region={self_member['state']}, diet={self_member['dietaryPreferences']}")
    
    # Also create member when user completes onboarding (if not exists)
    # This handles the case where user was created before this fix
    elif not is_new_user:
        # Check if member exists for existing user
        existing_member = await db.members.find_one({"userId": user_id})
        
        if not existing_member:
            # Get complete user data
            complete_user = await db.users.find_one({"_id": user_doc["_id"]})
            
            # Create self member for existing user
            self_member = {
                "userId": user_id,
                "fullName": complete_user.get("name") or "Me",
                "age": complete_user.get("age"),
                "gender": None,
                "dietaryPreferences": complete_user.get("preference") or "vegetarian",
                "state": complete_user.get("region"),
                "isPrimary": True,
                "createdAt": now,
                "updatedAt": now,
            }
            
            result = await db.members.insert_one(self_member)
            print(f"Created missing self member for existing user {user_id}")

    # 4) Return created/updated user
    user_out = {
        "id": user_id,
        "phone": user_doc.get("phone"),
        "email": user_doc.get("email"),
        "emailVerified": user_doc.get("emailVerified"),
        "firebase_uid": user_doc.get("firebase_uid"),
        "created_at": user_doc.get("created_at"),
        "updated_at": user_doc.get("updated_at"),
        "season": user_doc.get("season"),
        "seasonLastUpdated": user_doc.get("seasonLastUpdated"),
    }
    return {"success": True, "user": user_out}


class LoginBody(BaseModel):
    uId: str  # Firebase UID from frontend
    season: Optional[str] = None


@router.post("/login")
async def login_user(body: LoginBody):
    # Lookup user in MongoDB
    user = await db.users.find_one({"firebase_uid": body.uId})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not exist. Please sign up first."
        )

    # Update season on every login so it stays current
    if body.season:
        now = _now()
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"season": body.season, "seasonLastUpdated": now, "updated_at": now}},
        )
        user["season"] = body.season
        user["seasonLastUpdated"] = now

    user_out = {
        "userId": str(user["_id"]),
        "firebase_uid": user["firebase_uid"],
        "email": user.get("email"),
        "phone": user.get("phone"),
        "name": user.get("name"),
        "isVerified": user.get("emailVerified", False),
        "onboardingCompleted": user.get("onboardingCompleted", False),
        "region": user.get("region"),
        "preference": user.get("preference"),
        "age": user.get("age"),
        "season": user.get("season"),
        "seasonLastUpdated": user.get("seasonLastUpdated"),
    }

    return {
        "success": True,
        "user": user_out,
    }


VALID_SEASONS = {"spring", "summer", "monsoon", "autumn", "pre-winter", "winter"}

class UpdateUserProfileBody(BaseModel):
    name: Optional[str] = None
    phoneNumber: Optional[str] = None
    age: Optional[int] = None
    preference: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    onboardingCompleted: Optional[bool] = None
    season: Optional[str] = None


def _validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number format: 10 digits starting with 6-9"""
    if not phone:
        return False
    # Remove any non-digit characters
    digits = ''.join(c for c in phone if c.isdigit())
    # Check if it's 10 digits and starts with 6-9
    if len(digits) != 10:
        return False
    if digits[0] not in '6789':
        return False
    return True


def _validate_age(age: int) -> bool:
    """Validate age is in range 1-120"""
    return isinstance(age, int) and 1 <= age <= 120


def _validate_preference(preference: str) -> bool:
    """Validate preference is one of the allowed values"""
    return preference in ["vegetarian", "satvic"]


@router.put("/{user_id}")
async def update_user_profile(user_id: str, body: UpdateUserProfileBody):
    """Update user profile with onboarding data"""
    from bson import ObjectId
    
    # Validate user_id is a valid MongoDB ObjectId
    try:
        user_oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Find user
    user = await db.users.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prepare updates
    updates = {"updated_at": _now()}
    
    # Validate and add fields if provided
    if body.name is not None:
        updates["name"] = body.name.strip() if body.name else None
    
    if body.phoneNumber is not None:
        if body.phoneNumber and not _validate_phone_number(body.phoneNumber):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format. Must be 10-digit Indian format starting with 6-9"
            )
        # Store only digits
        updates["phoneNumber"] = ''.join(c for c in body.phoneNumber if c.isdigit()) if body.phoneNumber else None
    
    if body.age is not None:
        if body.age is not None and not _validate_age(body.age):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid age. Must be between 1 and 120"
            )
        updates["age"] = body.age
    
    if body.preference is not None:
        if body.preference and not _validate_preference(body.preference):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid preference. Must be 'vegetarian' or 'satvic'"
            )
        updates["preference"] = body.preference
    
    if body.region is not None:
        if body.region and not body.region.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Region cannot be empty"
            )
        updates["region"] = body.region.strip() if body.region else None
    
    if body.latitude is not None:
        updates["latitude"] = body.latitude
    
    if body.longitude is not None:
        updates["longitude"] = body.longitude
    
    if body.onboardingCompleted is not None:
        updates["onboardingCompleted"] = body.onboardingCompleted

    if body.season is not None:
        if body.season not in VALID_SEASONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid season. Must be one of: {', '.join(sorted(VALID_SEASONS))}"
            )
        updates["season"] = body.season
        updates["seasonLastUpdated"] = _now()

    # Update user document
    await db.users.update_one({"_id": user_oid}, {"$set": updates})
    
    # Fetch updated user
    updated_user = await db.users.find_one({"_id": user_oid})
    
    # Sync primary member with user profile updates
    # Find the primary member (isPrimary: true) or any member for this user
    primary_member = await db.members.find_one({"userId": user_id, "isPrimary": True})
    if not primary_member:
        # Fallback: find any member for this user
        primary_member = await db.members.find_one({"userId": user_id})
    
    if primary_member:
        # Update member with user profile data
        member_updates = {"updatedAt": _now()}
        
        if body.name is not None and body.name:
            member_updates["fullName"] = body.name.strip()
        
        if body.age is not None:
            member_updates["age"] = body.age
        
        if body.region is not None and body.region:
            member_updates["state"] = body.region.strip()
        
        if body.preference is not None and body.preference:
            member_updates["dietaryPreferences"] = body.preference
        
        # Update the member
        await db.members.update_one(
            {"_id": primary_member["_id"]},
            {"$set": member_updates}
        )
        print(f"Synced primary member {primary_member['_id']} with user profile updates")
    else:
        # Create member if it doesn't exist (handles users created before auto-member feature)
        self_member = {
            "userId": user_id,
            "fullName": updated_user.get("name") or "Me",
            "age": updated_user.get("age"),
            "gender": None,
            "dietaryPreferences": updated_user.get("preference") or "vegetarian",
            "state": updated_user.get("region"),
            "isPrimary": True,
            "createdAt": _now(),
            "updatedAt": _now(),
        }
        result = await db.members.insert_one(self_member)
        print(f"Created missing primary member {result.inserted_id} during profile update")
    
    # Return updated user object
    user_out = {
        "userId": str(updated_user["_id"]),
        "firebase_uid": updated_user.get("firebase_uid"),
        "email": updated_user.get("email"),
        "phone": updated_user.get("phone"),
        "isVerified": updated_user.get("emailVerified", False),
        "name": updated_user.get("name"),
        "phoneNumber": updated_user.get("phoneNumber"),
        "age": updated_user.get("age"),
        "preference": updated_user.get("preference"),
        "region": updated_user.get("region"),
        "latitude": updated_user.get("latitude"),
        "longitude": updated_user.get("longitude"),
        "onboardingCompleted": updated_user.get("onboardingCompleted", False),
        "season": updated_user.get("season"),
        "seasonLastUpdated": updated_user.get("seasonLastUpdated"),
        "created_at": updated_user.get("created_at"),
        "updated_at": updated_user.get("updated_at"),
    }

    return {
        "success": True,
        "user": user_out,
    }