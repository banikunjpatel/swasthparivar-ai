#!/usr/bin/env python3
"""
Script to completely delete a user and all associated data
"""
import asyncio
import sys
import os
from bson import ObjectId

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.mongo import db

async def delete_user_completely(user_id: str, email: str):
    """Delete user and all associated data"""
    try:
        print(f"🔍 Searching for user...")
        print(f"   User ID: {user_id}")
        print(f"   Email: {email}")
        print()
        
        # 1. Find and delete user
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            print(f"✅ Found user in users collection")
            print(f"   Email: {user.get('email')}")
            print(f"   Firebase UID: {user.get('firebase_uid')}")
            print(f"   Created: {user.get('created_at')}")
        else:
            print(f"⚠️  User not found in users collection")
        
        # 2. Find and delete members
        members = await db.members.find({"userId": user_id}).to_list(None)
        print(f"\n📋 Found {len(members)} member(s)")
        for member in members:
            print(f"   - {member.get('fullName')} (ID: {member['_id']})")
        
        # 3. Find and delete meal plans
        meal_plans = await db.meal_plans.find({"userId": user_id}).to_list(None)
        print(f"\n🍽️  Found {len(meal_plans)} meal plan(s)")
        
        # 4. Find and delete task completions
        task_completions = await db.user_task_completions.find({"userId": user_id}).to_list(None)
        print(f"\n✅ Found {len(task_completions)} task completion(s)")
        
        # 5. Find and delete grocery lists
        grocery_lists = await db.grocery_lists.find({"userId": user_id}).to_list(None)
        print(f"\n🛒 Found {len(grocery_lists)} grocery list(s)")
        
        # 6. Find and delete any other user-related data
        sessions = await db.sessions.find({"userId": user_id}).to_list(None)
        print(f"\n🔐 Found {len(sessions)} session(s)")
        
        # 7. Find and delete family guidance
        family_guidance = await db.family_guidance.find({"userId": user_id}).to_list(None)
        print(f"\n👨‍👩‍👧‍👦 Found {len(family_guidance)} family guidance(s)")
        
        # 8. Find and delete family meal plans
        family_meal_plans = await db.family_meal_plans.find({"userId": user_id}).to_list(None)
        print(f"\n🍽️  Found {len(family_meal_plans)} family meal plan(s)")
        
        # 9. Find and delete recipes
        recipes = await db.recipes.find({"userId": user_id}).to_list(None)
        print(f"\n📖 Found {len(recipes)} recipe(s)")
        
        # Confirm deletion
        print(f"\n{'='*60}")
        print(f"⚠️  WARNING: This will permanently delete:")
        print(f"   - 1 user account")
        print(f"   - {len(members)} member(s)")
        print(f"   - {len(meal_plans)} meal plan(s)")
        print(f"   - {len(task_completions)} task completion(s)")
        print(f"   - {len(grocery_lists)} grocery list(s)")
        print(f"   - {len(sessions)} session(s)")
        print(f"   - {len(family_guidance)} family guidance(s)")
        print(f"   - {len(family_meal_plans)} family meal plan(s)")
        print(f"   - {len(recipes)} recipe(s)")
        print(f"{'='*60}")
        
        confirm = input("\nType 'DELETE' to confirm: ")
        
        if confirm != 'DELETE':
            print("❌ Cancelled - no data was deleted")
            return
        
        print("\n🗑️  Deleting data...")
        
        # Delete in order
        deleted_counts = {}
        
        # 1. Delete user
        if user:
            result = await db.users.delete_one({"_id": ObjectId(user_id)})
            deleted_counts['users'] = result.deleted_count
            print(f"   ✅ Deleted user")
        
        # 2. Delete members
        result = await db.members.delete_many({"userId": user_id})
        deleted_counts['members'] = result.deleted_count
        print(f"   ✅ Deleted {result.deleted_count} member(s)")
        
        # 3. Delete meal plans
        result = await db.meal_plans.delete_many({"userId": user_id})
        deleted_counts['meal_plans'] = result.deleted_count
        print(f"   ✅ Deleted {result.deleted_count} meal plan(s)")
        
        # 4. Delete task completions
        result = await db.user_task_completions.delete_many({"userId": user_id})
        deleted_counts['task_completions'] = result.deleted_count
        print(f"   ✅ Deleted {result.deleted_count} task completion(s)")
        
        # 5. Delete grocery lists
        result = await db.grocery_lists.delete_many({"userId": user_id})
        deleted_counts['grocery_lists'] = result.deleted_count
        print(f"   ✅ Deleted {result.deleted_count} grocery list(s)")
        
        # 6. Delete sessions
        result = await db.sessions.delete_many({"userId": user_id})
        deleted_counts['sessions'] = result.deleted_count
        print(f"   ✅ Deleted {result.deleted_count} session(s)")
        
        # 7. Delete refresh tokens
        result = await db.refresh_tokens.delete_many({"userId": user_id})
        deleted_counts['refresh_tokens'] = result.deleted_count
        print(f"   ✅ Deleted {result.deleted_count} refresh token(s)")
        
        print(f"\n{'='*60}")
        print(f"✅ User completely deleted!")
        print(f"{'='*60}")
        print(f"\n📊 Summary:")
        for collection, count in deleted_counts.items():
            print(f"   {collection}: {count} deleted")
        
        print(f"\n📝 Note: Firebase authentication must be deleted separately")
        print(f"   Go to Firebase Console → Authentication → Users")
        print(f"   Search for: {email}")
        print(f"   Delete the user manually")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

async def main():
    # User to delete
    user_id = "6a05f2562d7bc18405ec5d7e"
    email = "unknown"  # Will be fetched from database
    
    # First, try to get the email from the database
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            email = user.get('email', 'unknown')
    except:
        pass
    
    await delete_user_completely(user_id, email)

if __name__ == "__main__":
    asyncio.run(main())
