"""Logging configuration."""

import logging
import sys
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("heka")

# Set specific log levels
logging.getLogger("uvicorn").setLevel(logging.INFO)
logging.getLogger("motor").setLevel(logging.WARNING)

