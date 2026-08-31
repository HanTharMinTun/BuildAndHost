from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from app.routers import (
    auth, personal_info, projects, skills, experiences,
    education, testimonials, blog, contact, public_website
)
from app.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Portfolio API",
    description="Portfolio website backend API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Update with your domain in production
)

# Include routers
app.include_router(public_website.router)  # Public website endpoint (no auth required)
app.include_router(auth.router)
app.include_router(personal_info.router)
app.include_router(projects.router)
app.include_router(skills.router)
app.include_router(experiences.router)
app.include_router(education.router)
app.include_router(testimonials.router)
app.include_router(blog.router)
app.include_router(contact.router)

@app.get("/")
async def root():
    return {
        "message": "Portfolio API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)