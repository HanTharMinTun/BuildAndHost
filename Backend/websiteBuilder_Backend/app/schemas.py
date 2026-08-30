import uuid
from datetime import datetime
from typing import Any

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


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    status: str
    created_at: datetime
    updated_at: datetime


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