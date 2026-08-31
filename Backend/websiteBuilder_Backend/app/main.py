from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    projects,
    websites,
    deployments,
    public,
    uploads,
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
        "http://localhost:8001",  # Allow direct backend access for testing
        "http://127.0.0.1:8001",  # Allow direct backend access for testing
        "https://webcreator.site",
    ],
    # Allow all subdomains of webcreator.site for published sites
    allow_origin_regex=r"https://.*\.webcreator\.site",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(websites.router)
app.include_router(deployments.router)
app.include_router(public.router)
app.include_router(uploads.router)


@app.get("/api/health")
async def health():
    return {
        "status": "ok"
    }