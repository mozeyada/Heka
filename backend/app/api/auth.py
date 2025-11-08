"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from app.api.schemas import UserRegister, UserLogin, Token, UserResponse
from app.api.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.sanitization import sanitize_text, sanitize_email
from app.db.database import get_database
from app.models.user import UserInDB
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from app.core.limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")  # 3 registrations per hour per IP
async def register(
    request: Request,
    user_data: UserRegister,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Register a new user."""
    
    # Sanitize inputs
    try:
        sanitized_email = sanitize_email(user_data.email)
        sanitized_name = sanitize_text(user_data.name, max_length=100)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": sanitized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login instead."
        )
    
    # Validate age (16+) - already validated by schema, but double-check
    if user_data.age < 16:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must be 16 years or older"
        )
    
    try:
        # Create user document
        user = UserInDB(
            email=sanitized_email,
            password_hash=get_password_hash(user_data.password),
            name=sanitized_name,
            age=user_data.age,
            is_active=True,
            is_verified=False,
            terms_accepted_at=datetime.utcnow(),
            privacy_accepted_at=datetime.utcnow(),
            terms_version="1.0",  # Update when terms change
            privacy_version="1.0",  # Update when privacy policy changes
        )
        
        # Insert into database
        result = await db.users.insert_one(user.to_mongo())
        user.id = str(result.inserted_id)
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            age=user.age,
            is_active=user.is_active,
            created_at=user.created_at
        )
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # 5 login attempts per minute per IP
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Login and get access token."""
    
    # Sanitize email input
    try:
        sanitized_email = sanitize_email(form_data.username)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Find user by email
    user_doc = await db.users.find_one({"email": sanitized_email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    user = UserInDB.from_mongo(user_doc)
    
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        email=user.email
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserInDB = Depends(get_current_user)
):
    """Get current user information."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        age=current_user.age,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )
