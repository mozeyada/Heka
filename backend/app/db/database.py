"""MongoDB database configuration."""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from typing import Optional
from app.db import indexes

# Async client for FastAPI
client: Optional[AsyncIOMotorClient] = None
database = None


async def connect_to_mongo():
    """Create database connection."""
    global client, database
    try:
        # MongoDB connection string format: mongodb://user:password@host:port/dbname
        # For mongodb+srv://, SSL/TLS is automatically enabled
        # Explicitly configure SSL for better compatibility
        
        # Determine if using mongodb+srv:// (Atlas) or regular mongodb://
        use_ssl = 'mongodb+srv://' in settings.MONGODB_URL or settings.ENVIRONMENT == 'production'
        
        client_options = {
            'maxPoolSize': 50,
            'minPoolSize': 10,
        }
        
        # Configure SSL/TLS for production/Atlas connections
        if use_ssl:
            client_options['tls'] = True
            client_options['tlsAllowInvalidCertificates'] = False
            # Use system default CA certificates
            client_options['tlsCAFile'] = None  # Use system default
        
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            **client_options
        )
        database = client[settings.MONGODB_DB_NAME]
        # Test connection
        await client.admin.command('ping')
        print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        
        # Create indexes
        await indexes.create_indexes(database)
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance."""
    return database


