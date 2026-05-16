"""
User Task Progress Collection Setup Script

This script creates the user_task_progress collection with proper schema and indexes.
This collection stores only user-completed/interacted tasks (not all 365 tasks).
"""

import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "swasthparivar"  # Adjust if different


async def create_user_task_progress_collection():
    """Create user_task_progress collection with indexes"""
    
    print("=" * 60)
    print("USER TASK PROGRESS COLLECTION SETUP")
    print("=" * 60)
    print()
    
    # Connect to MongoDB
    print(f"Connecting to MongoDB: {MONGODB_URL}")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✓ MongoDB connection successful")
        print()
        
        # Create collection reference
        collection = db.user_task_progress
        
        # Step 1: Check if collection exists
        print("Step 1: Checking collection status...")
        collections = await db.list_collection_names()
        if "user_task_progress" in collections:
            print("⚠ Collection 'user_task_progress' already exists")
            existing_count = await collection.count_documents({})
            print(f"  Existing documents: {existing_count}")
        else:
            print("✓ Collection 'user_task_progress' will be created")
        print()
        
        # Step 2: Create indexes
        print("Step 2: Creating indexes...")
        
        try:
            # Drop existing indexes (except _id) to recreate them
            existing_indexes = await collection.index_information()
            for index_name in existing_indexes:
                if index_name != "_id_":
                    try:
                        await collection.drop_index(index_name)
                        print(f"  Dropped existing index: {index_name}")
                    except Exception as e:
                        print(f"  ⚠ Could not drop index {index_name}: {e}")
        except Exception as e:
            print(f"  ⚠ Index cleanup warning: {e}")
        
        # Create unique compound index on userId + taskDate
        # This ensures one task per user per day
        await collection.create_index(
            [("userId", 1), ("taskDate", 1)],
            unique=True,
            name="userId_taskDate_unique"
        )
        print("✓ Created unique index: { userId: 1, taskDate: 1 }")
        
        # Create additional indexes for queries
        await collection.create_index(
            [("userId", 1)],
            name="userId_idx"
        )
        print("✓ Created index: { userId: 1 }")
        
        await collection.create_index(
            [("taskDate", 1)],
            name="taskDate_idx"
        )
        print("✓ Created index: { taskDate: 1 }")
        
        await collection.create_index(
            [("taskId", 1)],
            name="taskId_idx"
        )
        print("✓ Created index: { taskId: 1 }")
        
        # Create compound index for completed tasks queries
        await collection.create_index(
            [("userId", 1), ("completed", 1)],
            name="userId_completed_idx"
        )
        print("✓ Created index: { userId: 1, completed: 1 }")
        
        # Create index for date range queries
        await collection.create_index(
            [("userId", 1), ("taskDate", -1)],
            name="userId_taskDate_desc_idx"
        )
        print("✓ Created index: { userId: 1, taskDate: -1 }")
        
        print()
        
        # Step 3: Verify indexes
        print("Step 3: Verifying indexes...")
        indexes = await collection.index_information()
        print(f"✓ Total indexes created: {len(indexes)}")
        for index_name, index_info in indexes.items():
            keys = index_info.get('key', [])
            unique = index_info.get('unique', False)
            unique_str = " (UNIQUE)" if unique else ""
            print(f"  - {index_name}: {keys}{unique_str}")
        print()
        
        # Step 4: Display schema documentation
        print("Step 4: Schema Documentation")
        print("-" * 60)
        print("Collection: user_task_progress")
        print()
        print("Schema:")
        print("  _id          : ObjectId (auto-generated)")
        print("  userId       : ObjectId (required) - Reference to users._id")
        print("  taskId       : ObjectId (required) - Reference to master_tasks._id")
        print("  taskDate     : Date (required) - Date when task was assigned/completed")
        print("  completed    : Boolean (default: false) - Task completion status")
        print("  completedAt  : Date (optional) - Timestamp when task was completed")
        print("  createdAt    : Date (auto) - Record creation timestamp")
        print("  updatedAt    : Date (auto) - Record update timestamp")
        print()
        print("Behavior:")
        print("  - Do NOT create rows on user signup/dashboard open")
        print("  - Create/upsert row ONLY when user completes a task")
        print("  - One task per user per day (enforced by unique index)")
        print()
        print("Indexes:")
        print("  - UNIQUE: { userId: 1, taskDate: 1 }")
        print("  - { userId: 1 }")
        print("  - { taskDate: 1 }")
        print("  - { taskId: 1 }")
        print("  - { userId: 1, completed: 1 }")
        print("  - { userId: 1, taskDate: -1 }")
        print()
        
        # Step 5: Example document
        print("Step 5: Example Document Structure")
        print("-" * 60)
        example_doc = {
            "_id": "ObjectId('...')",
            "userId": "ObjectId('690cb60b20e2fd8e4ad8e0e4')",
            "taskId": "ObjectId('...')",
            "taskDate": "ISODate('2025-01-15T00:00:00.000Z')",
            "completed": True,
            "completedAt": "ISODate('2025-01-15T10:30:00.000Z')",
            "createdAt": "ISODate('2025-01-15T10:30:00.000Z')",
            "updatedAt": "ISODate('2025-01-15T10:30:00.000Z')"
        }
        import json
        print(json.dumps(example_doc, indent=2))
        print()
        
        # Step 6: Final verification
        print("Step 6: Final Verification")
        print("-" * 60)
        doc_count = await collection.count_documents({})
        print(f"✓ Collection exists: user_task_progress")
        print(f"✓ Current document count: {doc_count}")
        print(f"✓ Indexes created: {len(indexes)}")
        print()
        
        # Final summary
        print("=" * 60)
        print("SETUP COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Collection 'user_task_progress' is ready to use.")
        print("Remember: Only create records when users complete tasks.")
        print()
        
    except Exception as e:
        print(f"✗ Setup failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close connection
        client.close()
        print("MongoDB connection closed.")


if __name__ == "__main__":
    asyncio.run(create_user_task_progress_collection())
