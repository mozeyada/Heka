"""Pydantic schemas for API requests/responses."""

import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# Authentication Schemas
class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=2)
    age: int = Field(..., ge=16, le=120)
    accept_terms: bool = Field(False, description="Must accept Terms of Service")
    accept_privacy: bool = Field(False, description="Must accept Privacy Policy")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password complexity."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        common_passwords = [
            'Password123', 'Passw0rd', '12345678', 'Qwerty123',
            'Password1', 'Welcome123', 'Admin123', 'Letmein123'
        ]
        if v in common_passwords:
            raise ValueError('Password is too common. Please choose a more unique password')
        return v

    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        """Validate age is 16 or older."""
        if v < 16:
            raise ValueError('Must be 16 years or older')
        return v

    @field_validator('accept_terms')
    @classmethod
    def validate_terms(cls, v):
        """Validate Terms of Service acceptance."""
        if not v:
            raise ValueError('You must accept the Terms of Service to register')
        return v

    @field_validator('accept_privacy')
    @classmethod
    def validate_privacy(cls, v):
        """Validate Privacy Policy acceptance."""
        if not v:
            raise ValueError('You must accept the Privacy Policy to register')
        return v


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    """Request to send a password reset email."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request to reset a password using a token."""
    token: str
    new_password: str = Field(..., min_length=8)

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        """Validate password complexity."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        common_passwords = [
            'Password123', 'Passw0rd', '12345678', 'Qwerty123',
            'Password1', 'Welcome123', 'Admin123', 'Letmein123'
        ]
        if v in common_passwords:
            raise ValueError('Password is too common. Please choose a more unique password')
        return v


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    refresh_token: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token rotation request."""
    refresh_token: str
    device_id: Optional[str] = None


class DeviceTokenCreate(BaseModel):
    """Register device push token request."""

    platform: str = Field(..., description="ios or android")
    token: str = Field(..., min_length=10)
    device_id: str = Field(..., min_length=4)

    @field_validator("platform")
    @classmethod
    def validate_platform(cls, v):
        v = v.lower()
        if v not in {"ios", "android"}:
            raise ValueError("platform must be 'ios' or 'android'")
        return v


class NotificationChannelPreference(BaseModel):
    """Per-channel preference for a relationship notification category."""

    email: bool = True
    in_app: bool = True


class RelationshipNotificationPreferences(BaseModel):
    """Editable notification preferences for relationship activity."""

    invites: NotificationChannelPreference = Field(default_factory=NotificationChannelPreference)
    partner_activity: NotificationChannelPreference = Field(default_factory=NotificationChannelPreference)
    check_in_reminders: NotificationChannelPreference = Field(default_factory=NotificationChannelPreference)
    goal_updates: NotificationChannelPreference = Field(
        default_factory=lambda: NotificationChannelPreference(email=False, in_app=True)
    )
    ai_insights: NotificationChannelPreference = Field(
        default_factory=lambda: NotificationChannelPreference(email=False, in_app=True)
    )


class AccountEmailPreferences(BaseModel):
    """Always-on account-critical email categories."""

    security_and_recovery: bool = True
    billing_and_subscription: bool = True
    legal_and_policy: bool = True


class NotificationPreferencesResponse(BaseModel):
    """Current notification preferences shown in settings."""

    account_emails: AccountEmailPreferences = Field(default_factory=AccountEmailPreferences)
    relationship_notifications: RelationshipNotificationPreferences = Field(
        default_factory=RelationshipNotificationPreferences
    )
    can_edit_account_emails: bool = False


class NotificationPreferencesUpdate(BaseModel):
    """Editable notification preference payload."""

    relationship_notifications: RelationshipNotificationPreferences


class InAppNotificationResponse(BaseModel):
    """Stored in-app notification."""

    id: str
    category: str
    title: str
    body: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action_path: Optional[str] = None
    actor_user_id: Optional[str] = None
    metadata: dict = Field(default_factory=dict)
    is_read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime


class InAppNotificationListResponse(BaseModel):
    """Paginated notification feed."""

    items: List[InAppNotificationResponse]
    unread_count: int


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
    initial_perspective: str = Field(..., min_length=10, max_length=5000)


class ArgumentUpdate(BaseModel):
    """Update argument request."""
    status: Optional[str] = None  # Will be validated against ArgumentStatus enum



class ArgumentResponse(BaseModel):
    """Argument response."""
    id: str
    couple_id: str
    title: str
    category: str
    priority: str
    status: str
    created_by_user_id: Optional[str] = None
    perspective_count: int = 0
    current_user_has_perspective: bool = False
    partner_has_perspective: bool = False
    awaiting_response_from_user_id: Optional[str] = None
    needs_user_response: bool = False
    archived_for_current_user: bool = False
    insight_status: str = "not_ready"
    can_generate_insight: bool = False
    insight_generated_at: Optional[datetime] = None
    latest_context_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# Perspective Schemas
class PerspectiveCreate(BaseModel):
    """Create perspective request."""
    argument_id: str
    content: str = Field(..., min_length=10, max_length=5000)


class PerspectiveUpdate(BaseModel):
    """Update or extend a perspective with new context."""

    content: str = Field(..., min_length=10, max_length=5000)


class PerspectiveResponse(BaseModel):
    """Perspective response."""
    id: str
    argument_id: str
    user_id: str
    content: str
    created_at: datetime
    safety_notice: Optional[dict] = None


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
    journey_state: str
    
    # Dual tracking
    responses: Optional[dict] = None          # Current user's responses
    partner_responses: Optional[dict] = None  # Partner's responses (only shown if both completed)
    completed_by: list[str] = Field(default_factory=list)  # User IDs who completed it
    current_user_completed: bool = False
    partner_completed: bool = False
    needs_user_response: bool = False
    awaiting_response_from_user_id: Optional[str] = None
    next_step_title: str
    next_step_description: str
    focus_summary: Optional[str] = None
    open_argument_count: int = 0
    active_goal_count: int = 0
    completed_at: Optional[datetime] = None
    
    ai_harmony_report: Optional[str] = None
    safety_notice: Optional[dict] = None
    created_at: datetime


# Relationship Goal Schemas
class GoalCreate(BaseModel):
    """Create goal request."""
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    target_date: Optional[str] = None  # ISO date string
    first_step: str = Field(..., min_length=8, max_length=2000)


class GoalProgressUpdate(BaseModel):
    """Update goal progress."""
    notes: Optional[str] = None
    progress_value: Optional[float] = Field(None, ge=0.0, le=1.0)  # 0.0 to 1.0


class GoalReactionCreate(BaseModel):
    """Add a reaction to a progress update."""
    emoji: str = Field(..., description="The emoji to react with")


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
    current_user_has_progress: bool = False
    partner_has_progress: bool = False
    latest_progress_id: Optional[str] = None
    latest_progress_by_user_id: Optional[str] = None
    latest_progress_at: Optional[datetime] = None
    latest_progress_note: Optional[str] = None
    latest_progress_value: Optional[float] = None
    latest_progress_acknowledged_by_current_user: bool = True
    needs_user_progress: bool = False
    archived_for_current_user: bool = False
    next_action_type: str = "review"
    next_action_title: str
    next_action_description: str
    momentum_state: str = "new"
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
    tier: str  # "starter" or "premium"
    interval: str = "monthly"  # "monthly" or "annual"
    success_url: str
    cancel_url: str


# AI Suggestions Schemas

class AIGoalSuggestion(BaseModel):
    """A single AI-generated goal suggestion."""
    title: str
    description: str
    category: str = "General"

class AICheckInSuggestion(BaseModel):
    """A single AI-generated check-in question."""
    question: str
    category: str = "General"

class AIGoalsResponse(BaseModel):
    """Response for AI-generated goal suggestions."""
    suggestions: List[AIGoalSuggestion] = Field(default_factory=list)

class AICheckInsResponse(BaseModel):
    """Response for AI-generated check-in questions."""
    suggestions: List[AICheckInSuggestion] = Field(default_factory=list)

class InvitationPreviewResponse(BaseModel):
    """Public invitation preview response for invited partner."""
    inviter_name: str
    invitee_email: EmailStr
    message: str
    status: str
    is_expired: bool
    privacy_promise: str = "Your partner will not see your raw unedited writing—only Heka's balanced, neutral mediation summary."
