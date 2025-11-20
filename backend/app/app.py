from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.config import app_meta, cors_config
from app.lifespan import lifespan

# Routers
from api.health_check import router as health_router
from api.meal_plan_generate import router as meal_router
from api.recipe_generate import router as recipe_router
from api.grocery_generate import router as grocery_list_router
from api.grocery_category_generate import router as grocery_categories_router
from api.dosha_detector import router as prakriti_router
from api.members import router as members_router
# from api.firebase_auth import router as firebase_router
from  api.users import router as users_router
from dotenv import load_dotenv
import os

load_dotenv()

def create_app() -> FastAPI:
    meta = app_meta()

    app = FastAPI(
        title=meta.get("name", "Swasth Backend"),
        version=meta.get("version", "0.1.0"),
        lifespan=lifespan,
        docs_url="/docs", redoc_url="/redoc"
    )

    cors = cors_config()
    allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o]
    print(allowed_origins)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors.get("allow_origins", allowed_origins),
        allow_methods=cors.get("allow_methods", ["*"]),
        allow_headers=cors.get("allow_headers", ["*"]),
        allow_credentials=cors.get("allow_credentials", True),
    )
    
    # Public health check
    app.include_router(health_router, prefix="")

    # API v1
    app.include_router(meal_router, prefix="/v1")
    app.include_router(recipe_router, prefix="/v1")
    app.include_router(grocery_list_router, prefix="/v1")
    app.include_router(grocery_categories_router, prefix="/v1")
    app.include_router(prakriti_router, prefix="/v1")
    # app.include_router(firebase_router, prefix="/api/v1")
    app.include_router(users_router, prefix="/api/v1")
    app.include_router(members_router, prefix="/api/v1")

    return app

app = create_app()

@app.get("/")
async def root():
    return {"status": "ok"}