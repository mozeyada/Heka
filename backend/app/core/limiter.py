"""Rate limiter instance for use across the application."""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Create a single limiter instance that can be imported by routes
limiter = Limiter(key_func=get_remote_address)

