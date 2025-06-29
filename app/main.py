from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

# Import routers from your routes folder
from app.routes.meal import router as meal_router
from app.routes.grocery import router as grocery_router
from app.routes.dosha import router as dosha_router
from app.routes.family import router as family_router
from app.routes.members import router as member_router
from app.routes.auth import router as auth_router

# ─────────────────────────────────────────────
# 📋 Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("swasthparivar")
logger.info("🚀 SwasthParivar API is initializing...")

# ─────────────────────────────────────────────
# ⚙️ FastAPI App Config
app = FastAPI(
    title="SwasthParivar AI",
    description="AI-powered Indian family nutrition and wellness assistant based on Ayurveda.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ─────────────────────────────────────────────
# 🌐 CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔐 Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────
class TimerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        response.headers["X-Process-Time"] = str(round(duration, 4))
        return response

app.add_middleware(TimerMiddleware)

# ─────────────────────────────────────────────
# 🔗 Router Registration
app.include_router(meal_router, prefix="/api", tags=["Meal Plan"])
app.include_router(grocery_router, prefix="/api", tags=["Grocery List"])
app.include_router(dosha_router, prefix="/api", tags=["Dosha Detection"])
app.include_router(family_router, prefix="/api", tags=["Family Plan"])
app.include_router(member_router, prefix="/api", tags=["Member"])
app.include_router(auth_router, prefix="/api", tags=["Auth"])

# ─────────────────────────────────────────────
# ✅ Root Endpoint
@app.get("/", tags=["Welcome"])
def read_root():
    return {
        "message": "Welcome to SwasthParivar AI – Family Wellness API is running.",
        "docs": "/docs",
        "healthcheck": "/healthcheck",
        "status": "✅ OK"
    }

# ─────────────────────────────────────────────
# 🩺 Healthcheck Endpoint
@app.get("/healthcheck", tags=["Monitoring"])
def healthcheck():
    return {"status": "healthy"}

# ─────────────────────────────────────────────
# ❌ Custom 404 Error
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Endpoint not found."})

# ❌ Custom 500 Error
@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal server error occurred."})

# ─────────────────────────────────────────────
# ✅ Confirm Initialization
logger.info("✅ SwasthParivar AI is ready and running at http://localhost:8000")