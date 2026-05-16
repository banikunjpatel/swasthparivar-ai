#!/usr/bin/env python3
"""
Script to check all collections for user references
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.mongo import db

async def check_collections():
    """Check all collections for user references"""
    try:
        # Get all collection names
        collections = await db.list_collection_names()
        print(f"📚 Found {len(collections)} collections:\n")
        
        for collection_name in sorted(collections):
            collection = db[collection_name]
            count = await collection.count_documents({})
            print(f"   {collection_name}: {count} documents")
        
        print("\n" + "="*60)
        print("Checking for user references...")
        print("="*60 + "\n")
        
        # Check each collection for userId or user_id fields
        for collection_name in sorted(collections):
            collection = db[collection_name]
            
            # Check for userId field
            user_id_docs = await collection.count_documents({"userId": {"$exists": True}})
            if user_id_docs > 0:
                print(f"✓ {collection_name}: {user_id_docs} docs with 'userId' field")
            
            # Check for user_id field
            user_id_underscore = await collection.count_documents({"user_id": {"$exists": True}})
            if user_id_underscore > 0:
                print(f"✓ {collection_name}: {user_id_underscore} docs with 'user_id' field")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_collections())
