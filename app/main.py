from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers from your routes folder
from app.routes.meal import router as meal_router
from app.routes.grocery import router as grocery_router
from app.routes.dosha import router as dosha_router
from app.routes.family import router as family_router

app = FastAPI(
    title="SwasthParivar AI",
    description="AI-powered Indian family nutrition and wellness assistant based on Ayurveda.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local frontend or testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(meal_router, prefix="/api", tags=["Meal Plan"])
app.include_router(grocery_router, prefix="/api", tags=["Grocery List"])
app.include_router(dosha_router, prefix="/api", tags=["Dosha Detection"])
app.include_router(family_router, prefix="/api", tags=["Family Plan"])

# Simple root route
@app.get("/")
def read_root():
    return {
        "message": "Welcome to SwasthParivar AI – Family Wellness API is running.",
        "docs": "/docs",
        "status": "✅ OK"
    }