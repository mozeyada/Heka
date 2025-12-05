import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test the root endpoint returns correct status."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "version" in data

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint."""
    response = await client.get("/health")
    # Note: It might return 200 or 503 depending on DB mock status, 
    # but we just want to ensure it runs without crashing
    assert response.status_code in [200, 503]
    data = response.json()
    assert "checks" in data
