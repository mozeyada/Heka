"""Application configuration settings."""

from pydantic_settings import BaseSettings
from pydantic import validator, Field
from typing import List
import secrets


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    PROJECT_NAME: str = "Heka"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "heka_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"  # Cost-effective default (15-60x cheaper than GPT-4)
    
    # Google Gemini (beta testing)
    GEMINI_API_KEY: str = ""
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Email
    EMAIL_FROM: str = "noreply@heka.app"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # Sentry
    SENTRY_DSN: str = ""
    
    @validator('SECRET_KEY')
    def validate_secret_key(cls, v):
        """Validate SECRET_KEY strength."""
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        
        # Check for common weak values
        weak_keys = ['secret', 'changeme', '123456', 'password', '12345678', 'qwerty', 'heka']
        if v.lower() in weak_keys:
            raise ValueError('SECRET_KEY is too weak. Use a cryptographically secure random string.')
        
        # Check for minimum entropy (basic check)
        if len(set(v)) < 10:  # Too few unique characters
            raise ValueError('SECRET_KEY must contain sufficient randomness')
        
        return v
    
    @validator('MONGODB_URL')
    def validate_mongodb_url(cls, v, values):
        """Validate MongoDB URL security."""
        # In production, require SSL and authentication
        if values.get('ENVIRONMENT') == 'production':
            if 'mongodb+srv://' not in v and 'ssl=true' not in v:
                raise ValueError('Production MongoDB must use SSL (mongodb+srv:// or ssl=true)')
            if '@' not in v:
                raise ValueError('Production MongoDB must have authentication configured')
        return v
    
    @validator('ALLOWED_ORIGINS')
    def validate_cors_origins(cls, v, values):
        """Validate CORS origins."""
        if values.get('ENVIRONMENT') == 'production':
            # Must be HTTPS in production
            for origin in v:
                if not origin.startswith('https://'):
                    raise ValueError(f'Production CORS origin must use HTTPS: {origin}')
        return v
    
    @classmethod
    def generate_secret_key(cls) -> str:
        """Helper to generate secure secret key."""
        return secrets.token_urlsafe(32)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

