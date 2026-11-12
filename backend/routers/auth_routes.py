from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from database import get_db
from models import UserLogin, UserCreate, UserResponse, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, password_hash, salt, full_name, email, role, created_at FROM users WHERE username = ?", (credentials.username,))
        user = cursor.fetchone()
        
        if not user or not verify_password(credentials.password, user["salt"], user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        token_payload = {
            "user_id": user["id"],
            "username": user["username"],
            "role": user["role"]
        }
        token = create_access_token(token_payload)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "full_name": user["full_name"],
                "email": user["email"],
                "role": user["role"],
                "created_at": user["created_at"]
            }
        }

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (user_in.username, user_in.email))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists"
            )
        
        pwd_hash, salt = hash_password(user_in.password)
        now_str = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO users (username, password_hash, salt, full_name, email, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_in.username, pwd_hash, salt, user_in.full_name, user_in.email, user_in.role, now_str))
        
        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "username": user_in.username,
            "full_name": user_in.full_name,
            "email": user_in.email,
            "role": user_in.role,
            "created_at": now_str
        }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

