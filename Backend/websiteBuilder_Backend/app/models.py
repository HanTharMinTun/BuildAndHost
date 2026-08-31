import uuid

from sqlalchemy import (
    String,
    Text,
    Integer,
    BigInteger,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,  # Nullable for Google-only accounts
    )

    google_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )

    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    projects = relationship(
        "Project",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    prompts = relationship(
        "Prompt",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    uploads = relationship(
        "Upload",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    generated_websites = relationship(
        "GeneratedWebsite",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    deployments = relationship(
        "Deployment",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="draft",
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="projects",
    )

    prompts = relationship(
        "Prompt",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    uploads = relationship(
        "Upload",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    generated_websites = relationship(
        "GeneratedWebsite",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class Prompt(Base):
    __tablename__ = "prompts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    prompt_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    prompt_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="website",
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="pending",
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="prompts",
    )

    user = relationship(
        "User",
        back_populates="prompts",
    )

    generated_websites = relationship(
        "GeneratedWebsite",
        back_populates="prompt",
    )


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    file_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        server_default="0",
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="uploads",
    )

    project = relationship(
        "Project",
        back_populates="uploads",
    )


class GeneratedWebsite(Base):
    __tablename__ = "generated_websites"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    prompt_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prompts.id", ondelete="SET NULL"),
        nullable=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    website_json: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    theme_json: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="1",
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="generated_websites",
    )

    prompt = relationship(
        "Prompt",
        back_populates="generated_websites",
    )

    user = relationship(
        "User",
        back_populates="generated_websites",
    )

    deployments = relationship(
        "Deployment",
        back_populates="website",
        cascade="all, delete-orphan",
    )


class Deployment(Base):
    __tablename__ = "deployments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    website_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("generated_websites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    subdomain: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    domain: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    database_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    port: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=True,
        index=True,
    )

    systemd_service: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    backend_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="DEPLOYING",
        index=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    website = relationship(
        "GeneratedWebsite",
        back_populates="deployments",
    )

    user = relationship(
        "User",
        back_populates="deployments",
    )

    logs = relationship(
        "DeploymentLog",
        back_populates="deployment",
        cascade="all, delete-orphan",
        order_by="DeploymentLog.created_at",
    )


class DeploymentLog(Base):
    __tablename__ = "deployment_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    deployment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("deployments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="INFO",
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    deployment = relationship(
        "Deployment",
        back_populates="logs",
    )