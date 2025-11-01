from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from app.services.openai_client import generate_response_streaming
from dotenv import load_dotenv
import json
import time
import logging
import sys

load_dotenv()

# ─────────────────────────────────────────────
# 📋 Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("swasthparivar")
logger.info("🚀 SwasthParivar API is initializing...")
sys.stdout.reconfigure(encoding='utf-8')

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
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",  # ✅ React/Vite frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# 🧾 Audit Logger
class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        body = await request.body()
        masked = body.decode("utf-8").replace("password", "***")
        logger.info(f"📥 {request.method} {request.url.path} | Payload: {masked}")
        response = await call_next(request)
        logger.info(f"📤 Response status: {response.status_code}")
        return response
app.add_middleware(AuditLogMiddleware)

# ⏱️ Timer Middleware
class TimerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        response.headers["X-Process-Time"] = str(round(duration, 4))
        return response
app.add_middleware(TimerMiddleware)

# ─────────────────────────────────────────────
# 🔗 Register All Routers
from app.routes.meal import router as meal_router
from app.routes.grocery import router as grocery_router
from app.routes.dosha import router as dosha_router
from app.routes.family import router as family_router
from app.routes.members import router as member_router
from app.routes.auth import router as auth_router
from app.routes.wellness import router as wellness_router

app.include_router(meal_router, prefix="/api", tags=["Meal Plan"])
app.include_router(grocery_router, prefix="/api", tags=["Grocery List"])
app.include_router(dosha_router, prefix="/api", tags=["Dosha Detection"])
app.include_router(family_router, prefix="/api", tags=["Family Plan"])
app.include_router(member_router, prefix="/api", tags=["Member"])
app.include_router(auth_router, prefix="/api", tags=["Auth"])
app.include_router(wellness_router, prefix="/api", tags=["Wellness Tips"])

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

# 🩺 Healthcheck
@app.get("/healthcheck", tags=["Monitoring"])
def healthcheck():
    return {"status": "healthy"}

# ❌ 404 Not Found
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Endpoint not found."})

# ❌ 500 Internal Error
@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal server error occurred."})

# ─────────────────────────────────────────────
# 🚀 Streaming Endpoint (Test/Debug)
class GenerateStreamRequest(BaseModel):
    prompt: str
    task_type: str = "default"

@app.post("/api/stream_generate", tags=["Streaming"])
async def stream_generate(request_data: GenerateStreamRequest):
    prompt = request_data.prompt
    task_type = request_data.task_type

    async def token_stream():
        async for chunk in generate_response_streaming(prompt, task_type):
            yield chunk

    return StreamingResponse(token_stream(), media_type="text/plain")

# ─────────────────────────────────────────────
# ✅ Confirm Startup
logger.info("✅ SwasthParivar AI is ready and running at http://localhost:8000")