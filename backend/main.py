import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from routers import intelligence
except ImportError:
    from backend.routers import intelligence

app = FastAPI(
    title="Jal Drishti Modular Intelligence API",
    description="Production-ready decoupled backend architecture for government water telemetry."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intelligence.router)

@app.get("/")
def read_root():
    return {"status": "online", "architecture": "Modular Microservice Ready", "engines": ["Reservoir", "Groundwater", "Leakage"]}