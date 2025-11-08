"""Dependencies for API endpoints."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from app.core.security import verify_token
from app.db.database import get_database
from app.models.user import UserInDB
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserInDB:
    """Get current authenticated user from JWT token."""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    try:
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception
    
    if user_doc is None:
        raise credentials_exception
    
    user = UserInDB.from_mongo(user_doc)
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user

