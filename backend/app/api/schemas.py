"""Pydantic schemas for API requests/responses."""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re


# Authentication Schemas
class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=2)
    age: int = Field(..., ge=16, le=120)
    accept_terms: bool = Field(False, description="Must accept Terms of Service")
    accept_privacy: bool = Field(False, description="Must accept Privacy Policy")
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password complexity."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        # Check for uppercase letter
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        # Check for lowercase letter
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        # Check for digit
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        
        # Check for common passwords
        common_passwords = [
            'Password123', 'Passw0rd', '12345678', 'Qwerty123',
            'Password1', 'Welcome123', 'Admin123', 'Letmein123'
        ]
        if v in common_passwords:
            raise ValueError('Password is too common. Please choose a more unique password')
        
        return v
    
    @validator('age')
    def validate_age(cls, v):
        """Validate age is 16 or older."""
        if v < 16:
            raise ValueError('Must be 16 years or older')
        return v
    
    @validator('accept_terms')
    def validate_terms(cls, v):
        """Validate Terms of Service acceptance."""
        if not v:
            raise ValueError('You must accept the Terms of Service to register')
        return v
    
    @validator('accept_privacy')
    def validate_privacy(cls, v):
        """Validate Privacy Policy acceptance."""
        if not v:
            raise ValueError('You must accept the Privacy Policy to register')
        return v


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


class UserResponse(BaseModel):
    """User response (public info only)."""
    id: str
    email: EmailStr
    name: str
    age: int
    is_active: bool
    created_at: datetime
    terms_accepted_at: Optional[datetime] = None
    privacy_accepted_at: Optional[datetime] = None
    terms_version: Optional[str] = None
    privacy_version: Optional[str] = None
    
    class Config:
        from_attributes = True


# Couple Schemas
class CoupleCreate(BaseModel):
    """Create couple profile request."""
    partner_email: EmailStr  # Email of partner to invite


class CoupleResponse(BaseModel):
    """Couple profile response."""
    id: str
    user1_id: str
    user2_id: str
    status: str
    created_at: datetime


# Argument Schemas
class ArgumentCreate(BaseModel):
    """Create argument request."""
    title: str = Field(..., min_length=5, max_length=255)
    category: str  # Will be validated against ArgumentCategory enum
    priority: str = "medium"  # Will be validated against ArgumentPriority enum


class ArgumentResponse(BaseModel):
    """Argument response."""
    id: str
    couple_id: str
    title: str
    category: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime


# Perspective Schemas
class PerspectiveCreate(BaseModel):
    """Create perspective request."""
    argument_id: str
    content: str = Field(..., min_length=10, max_length=5000)


class PerspectiveResponse(BaseModel):
    """Perspective response."""
    id: str
    argument_id: str
    user_id: str
    content: str
    created_at: datetime


# Relationship Check-in Schemas
class CheckInCreate(BaseModel):
    """Create check-in request."""
    responses: dict  # {"question1": "answer1", "question2": "answer2"}


class CheckInResponse(BaseModel):
    """Check-in response."""
    id: str
    couple_id: str
    week_start_date: str  # ISO date string
    status: str
    responses: Optional[dict] = None
    completed_by_user_id: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


# Relationship Goal Schemas
class GoalCreate(BaseModel):
    """Create goal request."""
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    target_date: Optional[str] = None  # ISO date string


class GoalProgressUpdate(BaseModel):
    """Update goal progress."""
    notes: Optional[str] = None
    progress_value: Optional[float] = Field(None, ge=0.0, le=1.0)  # 0.0 to 1.0


class GoalResponse(BaseModel):
    """Goal response."""
    id: str
    couple_id: str
    title: str
    description: Optional[str] = None
    status: str
    target_date: Optional[str] = None
    progress: list
    created_by_user_id: str
    progress_updates: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


# Subscription Schemas
class SubscriptionResponse(BaseModel):
    """Subscription response."""
    id: str
    couple_id: str
    tier: str
    status: str
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancel_at_period_end: bool = False


class UsageResponse(BaseModel):
    """Usage response."""
    usage_count: int
    limit: int
    is_unlimited: bool
    period_start: str
    period_end: str


class CreateCheckoutSessionRequest(BaseModel):
    """Create Stripe checkout session request."""
    tier: str  # "basic" or "premium"
    success_url: str
    cancel_url: str

