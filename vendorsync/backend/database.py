from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from pymongo import IndexModel, ASCENDING
from config import settings
import asyncio

client: AsyncIOMotorClient = None
db = None
gridfs_bucket: AsyncIOMotorGridFSBucket = None


async def connect_db():
    global client, db, gridfs_bucket
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    gridfs_bucket = AsyncIOMotorGridFSBucket(db, bucket_name="recordings")
    await create_indexes()
    print(f"[OK] Connected to MongoDB: {settings.DB_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("[--] Disconnected from MongoDB")


async def create_indexes():
    await db.users.create_index("email", unique=True)
    await db.meetings.create_index("created_by")
    await db.meetings.create_index("status")
    await db.transcripts.create_index("meeting_id")
    await db.analyses.create_index("meeting_id", unique=True)
    print("[OK] Indexes created")


def get_db():
    return db


def get_gridfs():
    return gridfs_bucket
