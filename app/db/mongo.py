from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["ayurmeal"]
families_collection = db["families"]
members_collection = db["members"]
grocery_collection = db["grocery_lists"]
users_collection = db["users"]
family_meal_collection = db["family_meal_plans"]
recipes_collection = db["recipes"]
wellness_logs_collection = db["wellness_logs"]