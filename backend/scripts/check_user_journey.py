#!/usr/bin/env python3
"""
Script to check user's journey day calculation
"""
import asyncio
import sys
import os
from datetime import datetime
from bson import ObjectId

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.mongo import db

async def check_user_journey(user_id: str):
    """Check user's journey day calculation"""
    try:
        # Get user
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            print(f"❌ User {user_id} not found")
            return
        
        print(f"✅ User found: {user_id}")
        print(f"   Firebase UID: {user.get('firebase_uid')}")
        print(f"   Email: {user.get('email')}")
        print(f"   Phone: {user.get('phone')}")
        
        # Check created_at
        created_at = user.get("created_at")
        print(f"\n📅 Created At: {created_at}")
        print(f"   Type: {type(created_at)}")
        
        if not created_at:
            print("   ⚠️  No created_at field - will use calendar-based tasks")
            return
        
        # Calculate days since registration
        now = datetime.now()
        print(f"\n🕐 Current Time: {now}")
        
        # Handle different types
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            print(f"   Parsed from string: {created_at}")
        
        # Calculate difference
        days_since_registration = (now.date() - created_at.date()).days + 1
        print(f"\n📊 Journey Calculation:")
        print(f"   Registration Date: {created_at.date()}")
        print(f"   Current Date: {now.date()}")
        print(f"   Days Since Registration: {days_since_registration}")
        
        # Get season info
        m, d = now.month, now.day
        if m == 5:
            season = "Summer"
        elif m == 6:
            season = "Summer"
        else:
            season = "Unknown"
        
        # Get task count
        season_tasks_count = await db.master_tasks.count_documents({"season": season})
        print(f"\n🌞 Season Info:")
        print(f"   Current Season: {season}")
        print(f"   Total Tasks: {season_tasks_count}")
        
        # Calculate day number
        day_number = ((days_since_registration - 1) % season_tasks_count) + 1
        print(f"\n🎯 Task Day Number: {day_number}")
        
        # Get the actual task
        task = await db.master_tasks.find_one({"season": season, "dayNumber": day_number})
        if task:
            print(f"\n✅ Task Found:")
            print(f"   Title: {task.get('title')}")
            print(f"   Element: {task.get('element')}")
            print(f"   Description: {task.get('description')}")
        else:
            print(f"\n❌ No task found for {season} Day {day_number}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

async def main():
    if len(sys.argv) < 2:
        print("Usage: python check_user_journey.py <user_id>")
        sys.exit(1)
    
    user_id = sys.argv[1]
    await check_user_journey(user_id)

if __name__ == "__main__":
    asyncio.run(main())
