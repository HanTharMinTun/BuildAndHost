from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    projects,
    websites,
    deployments,
)


app = FastAPI(
    title="AI Website Builder API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://onlinegif.shop",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(websites.router)
app.include_router(deployments.router)


@app.get("/api/health")
async def health():
    return {
        "status": "ok"
    }