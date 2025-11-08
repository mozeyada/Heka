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
        # For mongodb+srv://, SSL/TLS is automatically enabled by pymongo/motor
        # Don't explicitly set TLS options for mongodb+srv:// as it's handled automatically
        
        client_options = {
            'maxPoolSize': 50,
            'minPoolSize': 10,
        }
        
        # For mongodb+srv://, pymongo automatically handles TLS
        # Only configure TLS explicitly for non-SRV connections if needed
        if 'mongodb+srv://' not in settings.MONGODB_URL:
            # For regular mongodb:// connections, configure TLS if in production
            if settings.ENVIRONMENT == 'production':
                client_options['tls'] = True
                client_options['tlsAllowInvalidCertificates'] = False
        
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


