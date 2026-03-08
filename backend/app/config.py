"""Application configuration settings."""

import json
import secrets
from typing import List, Union

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

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
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS — includes both localhost ports and production Vercel URL
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://heka-nine.vercel.app",
    ]

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"

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

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        """Parse ALLOWED_ORIGINS from JSON string or comma-separated string."""
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass
            if ',' in v:
                return [origin.strip() for origin in v.split(',') if origin.strip()]
            return [v.strip()] if v.strip() else []
        return v if isinstance(v, list) else [v]

    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v):
        """Validate SECRET_KEY strength."""
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        weak_keys = ['secret', 'changeme', '123456', 'password', '12345678', 'qwerty', 'heka']
        if v.lower() in weak_keys:
            raise ValueError('SECRET_KEY is too weak. Use a cryptographically secure random string.')
        if len(set(v)) < 10:
            raise ValueError('SECRET_KEY must contain sufficient randomness')
        return v

    @model_validator(mode='after')
    def validate_production_settings(self):
        """Validate production-specific constraints."""
        if self.ENVIRONMENT == 'production':
            if 'mongodb+srv://' not in self.MONGODB_URL and 'ssl=true' not in self.MONGODB_URL:
                raise ValueError('Production MongoDB must use SSL (mongodb+srv:// or ssl=true)')
            if '@' not in self.MONGODB_URL:
                raise ValueError('Production MongoDB must have authentication configured')
            origins = self.ALLOWED_ORIGINS if isinstance(self.ALLOWED_ORIGINS, list) else [self.ALLOWED_ORIGINS]
            for origin in origins:
                if not origin.startswith('https://'):
                    raise ValueError(f'Production CORS origin must use HTTPS: {origin}')
        return self

    @classmethod
    def generate_secret_key(cls) -> str:
        """Helper to generate secure secret key."""
        return secrets.token_urlsafe(32)


settings = Settings()
