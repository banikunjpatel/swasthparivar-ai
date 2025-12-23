# backend/db/mongo.py
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv, find_dotenv
import os

# ensure .env loads no matter where run from
load_dotenv(find_dotenv())

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncIOMotorClient(MONGODB_URL)

db = client["swasthparivar"]

async def init_mongo(MONGODB_URL, db):
    pass

async def close_mongo():
  pass
families_collection = db["families"]
members_collection = db["members"]
grocery_collection = db["grocery_lists"]
users_collection = db["users"]
family_meal_collection = db["family_meal_plans"]
recipes_collection = db["recipes"]
wellness_logs_collection = db["wellness_logs"]
members_collection = db["members"]
