"""
Seasonal Tasks Database Migration Script

This script migrates seasonal tasks from JSON file to MongoDB.
Creates master_tasks collection with proper schema and indexes.
"""

import asyncio
import json
import os
from datetime import datetime
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "swasthparivar"  # Adjust if different

# File path
DATA_FILE = Path(__file__).parent.parent / "data" / "prakriti_365_cards.json"


async def migrate_seasonal_tasks():
    """Execute the seasonal tasks migration"""
    
    print("=" * 60)
    print("SEASONAL TASKS DATABASE MIGRATION")
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
        collection = db.master_tasks
        
        # Step 1: Create indexes
        print("Step 1: Creating indexes...")
        try:
            # Create unique compound index on season + dayNumber
            await collection.create_index(
                [("season", 1), ("dayNumber", 1)],
                unique=True,
                name="season_dayNumber_unique"
            )
            print("✓ Created unique index: { season: 1, dayNumber: 1 }")
            
            # Create additional indexes for queries
            await collection.create_index([("season", 1)], name="season_idx")
            await collection.create_index([("element", 1)], name="element_idx")
            await collection.create_index([("isActive", 1)], name="isActive_idx")
            print("✓ Created additional indexes for queries")
        except Exception as e:
            print(f"⚠ Index creation warning: {e}")
        print()
        
        # Step 2: Load JSON data
        print("Step 2: Loading JSON data...")
        if not DATA_FILE.exists():
            print(f"✗ Error: File not found at {DATA_FILE}")
            return
        
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            tasks_data = json.load(f)
        
        print(f"✓ Loaded {len(tasks_data)} tasks from JSON file")
        print()
        
        # Step 3: Validate data
        print("Step 3: Validating data...")
        valid_seasons = {"Winter", "Spring", "Summer", "Monsoon", "Autumn"}
        valid_elements = {"Fire", "Water", "Air", "Space", "Earth"}
        
        validation_errors = []
        for idx, task in enumerate(tasks_data):
            if task.get("season") not in valid_seasons:
                validation_errors.append(f"Task {idx}: Invalid season '{task.get('season')}'")
            if task.get("element") not in valid_elements:
                validation_errors.append(f"Task {idx}: Invalid element '{task.get('element')}'")
            if not isinstance(task.get("dayNumber"), int):
                validation_errors.append(f"Task {idx}: Invalid dayNumber")
        
        if validation_errors:
            print("✗ Validation errors found:")
            for error in validation_errors[:10]:  # Show first 10 errors
                print(f"  - {error}")
            return
        
        print("✓ All tasks validated successfully")
        print()
        
        # Step 4: Prepare documents for insertion
        print("Step 4: Preparing documents...")
        now = datetime.utcnow()
        documents = []
        
        for task in tasks_data:
            doc = {
                "season": task["season"],
                "dayNumber": task["dayNumber"],
                "element": task["element"],
                "title": task["title"],
                "description": task["description"],
                "isActive": True,
                "createdAt": now,
                "updatedAt": now
            }
            # Include optional fields if present
            if "globalDay" in task:
                doc["globalDay"] = task["globalDay"]
            if "cycle" in task:
                doc["cycle"] = task["cycle"]
            
            documents.append(doc)
        
        print(f"✓ Prepared {len(documents)} documents for insertion")
        print()
        
        # Step 5: Bulk insert with duplicate handling
        print("Step 5: Inserting documents...")
        inserted_count = 0
        skipped_count = 0
        failed_count = 0
        
        # Use ordered=False to continue on duplicate key errors
        try:
            result = await collection.insert_many(documents, ordered=False)
            inserted_count = len(result.inserted_ids)
            print(f"✓ Inserted {inserted_count} documents")
        except Exception as e:
            # Handle bulk write errors (duplicates)
            if hasattr(e, 'details'):
                inserted_count = e.details.get('nInserted', 0)
                write_errors = e.details.get('writeErrors', [])
                
                for error in write_errors:
                    if error.get('code') == 11000:  # Duplicate key error
                        skipped_count += 1
                    else:
                        failed_count += 1
                
                print(f"✓ Inserted {inserted_count} documents")
                if skipped_count > 0:
                    print(f"⚠ Skipped {skipped_count} duplicates")
                if failed_count > 0:
                    print(f"✗ Failed {failed_count} documents")
            else:
                print(f"✗ Error during insertion: {e}")
                failed_count = len(documents)
        print()
        
        # Step 6: Verify insertion
        print("Step 6: Verifying insertion...")
        total_count = await collection.count_documents({})
        print(f"✓ Total documents in collection: {total_count}")
        print()
        
        # Step 7: Season-wise counts
        print("Step 7: Season-wise verification...")
        season_counts = {}
        for season in valid_seasons:
            count = await collection.count_documents({"season": season})
            season_counts[season] = count
            print(f"  {season:10s}: {count:3d} tasks")
        print()
        
        # Step 8: Element-wise counts
        print("Step 8: Element-wise verification...")
        element_counts = {}
        for element in valid_elements:
            count = await collection.count_documents({"element": element})
            element_counts[element] = count
            print(f"  {element:10s}: {count:3d} tasks")
        print()
        
        # Final summary
        print("=" * 60)
        print("MIGRATION SUMMARY")
        print("=" * 60)
        print(f"Total records in JSON:     {len(tasks_data)}")
        print(f"Successfully inserted:     {inserted_count}")
        print(f"Skipped (duplicates):      {skipped_count}")
        print(f"Failed:                    {failed_count}")
        print(f"Total in database:         {total_count}")
        print()
        
        # Expected counts validation
        expected_counts = {
            "Winter": 90,
            "Spring": 61,
            "Summer": 61,
            "Monsoon": 92,
            "Autumn": 61
        }
        
        print("Season Count Validation:")
        all_valid = True
        for season, expected in expected_counts.items():
            actual = season_counts.get(season, 0)
            status = "✓" if actual == expected else "✗"
            print(f"  {status} {season:10s}: {actual:3d} / {expected:3d} expected")
            if actual != expected:
                all_valid = False
        print()
        
        if all_valid and total_count == 365:
            print("✓ MIGRATION COMPLETED SUCCESSFULLY!")
        else:
            print("⚠ MIGRATION COMPLETED WITH WARNINGS")
        
        print("=" * 60)
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close connection
        client.close()
        print("\nMongoDB connection closed.")


if __name__ == "__main__":
    asyncio.run(migrate_seasonal_tasks())
