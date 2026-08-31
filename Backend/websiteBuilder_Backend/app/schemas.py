import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, ConfigDict


# =========================
# USER
# =========================

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    """Request schema for Google OAuth login"""
    credential: str  # Google ID token from frontend


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    username: str
    full_name: str | None
    created_at: datetime


# =========================
# PROJECT
# =========================

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None


# Upload schema for nested responses
class UploadInfo(BaseModel):
    """Simplified upload info for nested responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    filename: str
    file_type: str | None
    file_size: int
    created_at: datetime


# Deployment info for nested responses
class DeploymentInfo(BaseModel):
    """Simplified deployment info for nested responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    subdomain: str
    domain: str
    status: str
    created_at: datetime
    updated_at: datetime


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    
    # Enhanced fields for MVP
    prompt: Optional[str] = None  # Latest or creation prompt text
    attachments: list[UploadInfo] = []  # Files attached to this project
    deployment_url: Optional[str] = None  # Full deployment URL if deployed
    deployment_status: Optional[str] = None  # Deployment status
    deployment_info: Optional[DeploymentInfo] = None  # Full deployment details


# =========================
# PROMPT
# =========================

class PromptCreate(BaseModel):
    project_id: uuid.UUID
    prompt_text: str
    prompt_type: str = "website"


class PromptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    user_id: uuid.UUID
    prompt_text: str
    prompt_type: str
    status: str
    created_at: datetime


# =========================
# GENERATED WEBSITE
# =========================

class WebsiteCreate(BaseModel):
    project_id: uuid.UUID
    prompt_id: uuid.UUID | None = None
    website_json: dict[str, Any]
    theme_json: dict[str, Any] | None = None
    version: int = 1


class WebsiteContentUpdate(BaseModel):
    """Schema for updating website JSON content only"""
    website_json: dict[str, Any]
    theme_json: dict[str, Any] | None = None


class WebsiteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    prompt_id: uuid.UUID | None
    user_id: uuid.UUID
    website_json: dict[str, Any]
    theme_json: dict[str, Any] | None
    version: int
    created_at: datetime


# =========================
# DEPLOYMENT
# =========================

class DeploymentCreate(BaseModel):
    subdomain: str


class DeploymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    website_id: uuid.UUID
    user_id: uuid.UUID
    subdomain: str
    domain: str
    database_name: str
    port: int
    systemd_service: str
    backend_path: str
    status: str
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class DeploymentLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    deployment_id: uuid.UUID
    level: str
    message: str
    created_at: datetime


from pydantic import BaseModel, EmailStr, Field


from uuid import UUID


class ContactFormRequest(BaseModel):
    project_id: UUID
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=5000)


class ContactFormResponse(BaseModel):
    success: bool
    message: str


# =========================
# AI THEME GENERATION
# =========================

class ThemeGenerationRequest(BaseModel):
    """Request schema for AI theme generation"""
    website_id: uuid.UUID
    brief: str = "Create a polished, modern theme with subtle animations and responsive adjustments."


class ThemeGenerationResponse(BaseModel):
    """Response schema for AI theme generation"""
    theme: dict[str, Any]
    website_id: uuid.UUID