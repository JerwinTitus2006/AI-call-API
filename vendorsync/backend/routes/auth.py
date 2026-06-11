from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from config import settings
from database import get_db
from models.user import UserCreate, UserLogin
from middleware.auth_middleware import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def get_initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper()


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "org_name": user["org_name"],
        "role": user["role"],
        "avatar_initials": user.get("avatar_initials", "??"),
        "created_at": user["created_at"].isoformat(),
        "last_login": user.get("last_login", "").isoformat() if user.get("last_login") else None,
    }


@router.post("/register")
async def register(data: UserCreate):
    db = get_db()
    
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    if data.role not in ["distributor", "vendor", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user_doc = {
        "name": data.name,
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "org_name": data.org_name,
        "role": data.role,
        "avatar_initials": get_initials(data.name),
        "meetings": [],
        "created_at": datetime.utcnow(),
        "last_login": None,
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    token = create_token(str(result.inserted_id))
    return {"token": token, "user": serialize_user(user_doc)}


@router.post("/login")
async def login(data: UserLogin):
    db = get_db()
    
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    token = create_token(str(user["_id"]))
    return {"token": token, "user": serialize_user(user)}


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)
