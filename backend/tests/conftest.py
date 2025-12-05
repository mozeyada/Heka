import pytest
import os
from unittest.mock import MagicMock
from httpx import AsyncClient
from typing import AsyncGenerator, Generator

# Set environment for testing BEFORE importing app
os.environ["ENVIRONMENT"] = "testing"
os.environ["MONGODB_URL"] = "mongodb://localhost:27017"
os.environ["MONGODB_DB_NAME"] = "heka_test_db"
os.environ["SECRET_KEY"] = "test_secret_key_needs_to_be_at_least_32_chars_long"
os.environ["OPENAI_API_KEY"] = "sk-test-key-mock"

from app.main import app
from app.db.database import get_database

@pytest.fixture
def mock_db() -> Generator[MagicMock, None, None]:
    """Mock database dependency."""
    mock_db = MagicMock()
    # Mock collections
    mock_db.users = MagicMock()
    mock_db.couples = MagicMock()
    mock_db.arguments = MagicMock()
    mock_db.perspectives = MagicMock()
    mock_db.ai_insights = MagicMock()
    
    # Configure common async methods
    async def mock_find_one(*args, **kwargs):
        return None
    
    mock_db.users.find_one.side_effect = mock_find_one
    mock_db.couples.find_one.side_effect = mock_find_one
    
    yield mock_db

@pytest.fixture
async def client(mock_db: MagicMock) -> AsyncGenerator[AsyncClient, None]:
    """Async client for testing API."""
    from httpx import ASGITransport
    
    # Override dependency
    app.dependency_overrides[get_database] = lambda: mock_db
    
    # Create transport for the app
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    # Cleanup
    app.dependency_overrides.clear()
