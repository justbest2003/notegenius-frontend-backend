import motor.motor_asyncio
from config import settings


class MongoDB:
    """MongoDB connection manager using motor (async driver)"""

    client: motor.motor_asyncio.AsyncIOMotorClient = None
    db = None

    async def connect(self):
        """Connect to MongoDB Atlas"""
        self.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
        self.db = self.client[settings.MONGODB_DB_NAME]

        # Create indexes
        await self.db.notes.create_index("user_id")
        await self.db.notes.create_index([("title", "text"), ("content", "text")])
        await self.db.users.create_index("firebase_uid", unique=True)
        await self.db.categories.create_index("user_id")
        await self.db.usage_stats.create_index("user_id")

        print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")

    async def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("🔌 MongoDB connection closed")

    def get_collection(self, name: str):
        """Get a collection by name"""
        return self.db[name]


# Singleton instance
mongodb = MongoDB()


def get_db():
    """Get database instance"""
    return mongodb.db
