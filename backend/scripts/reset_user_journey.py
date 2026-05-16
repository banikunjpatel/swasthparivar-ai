#!/usr/bin/env python3
"""
Script to reset user's journey to Day 1 (today)
"""
import asyncio
import sys
import os
from datetime import datetime
from bson import ObjectId

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.mongo import db

async def reset_journey(user_id: str):
    """Reset user's journey to start from today"""
    try:
        # Get user
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            print(f"❌ User {user_id} not found")
            return
        
        print(f"✅ User found: {user_id}")
        print(f"   Current created_at: {user.get('created_at')}")
        
        # Update created_at to today
        now = datetime.now()
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "created_at": now,
                "journey_reset_at": now,
                "updated_at": now
            }}
        )
        
        if result.modified_count > 0:
            print(f"\n✅ Journey reset successfully!")
            print(f"   New created_at: {now}")
            print(f"   You will now see Day 1 tasks")
        else:
            print(f"\n⚠️  No changes made")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

async def main():
    if len(sys.argv) < 2:
        print("Usage: python reset_user_journey.py <user_id>")
        sys.exit(1)
    
    user_id = sys.argv[1]
    
    # Confirm
    print(f"⚠️  This will reset the journey for user {user_id} to Day 1")
    print(f"   Their created_at will be updated to today's date")
    confirm = input("Continue? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Cancelled")
        return
    
    await reset_journey(user_id)

if __name__ == "__main__":
    asyncio.run(main())
