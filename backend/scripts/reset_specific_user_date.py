#!/usr/bin/env python3
"""
Script to reset a specific user's created_at to today
Use this to fix users who were created during testing
"""
import asyncio
import sys
import os
from datetime import datetime
from bson import ObjectId

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.mongo import db

async def reset_user_date(user_id: str):
    """Reset user's created_at to today"""
    try:
        # Get user
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            print(f"❌ User {user_id} not found")
            return
        
        print(f"✅ User found: {user_id}")
        print(f"   Email: {user.get('email')}")
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
            print(f"\n✅ User date reset successfully!")
            print(f"   New created_at: {now}")
            print(f"   Journey will now start from Day 1")
            print(f"\n📝 Note: Log out and log back in to see the changes")
        else:
            print(f"\n⚠️  No changes made")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

async def main():
    # Your user ID
    user_id = "6a0022865e467d1d86c5ee87"
    
    print(f"⚠️  This will reset the created_at date for user {user_id}")
    print(f"   Current: 2026-05-07")
    print(f"   New: {datetime.now().date()}")
    print(f"   This will restart your journey from Day 1")
    
    confirm = input("\nContinue? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Cancelled")
        return
    
    await reset_user_date(user_id)

if __name__ == "__main__":
    asyncio.run(main())
