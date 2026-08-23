import uuid

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import (
    User,
    GeneratedWebsite,
    Deployment,
    DeploymentLog,
)
from ..schemas import (
    DeploymentCreate,
    DeploymentResponse,
    DeploymentLogResponse,
)
from ..security import get_current_user
from ..deployment_manager import DeploymentManager


router = APIRouter(
    prefix="/api/deployments",
    tags=["Deployments"],
)


async def run_deployment(deployment_id: uuid.UUID, subdomain: str, db_url: str):
    """Background task to run deployment"""
    from ..database import engine, AsyncSessionLocal
    
    async with AsyncSessionLocal() as session:
        try:
            manager = DeploymentManager(session, deployment_id)
            await manager.deploy(subdomain)
            await session.commit()
        except Exception as e:
            print(f"Deployment error: {e}")
            await session.rollback()


@router.post(
    "/websites/{website_id}",
    response_model=DeploymentResponse,
    status_code=201,
)
async def deploy_website(
    website_id: uuid.UUID,
    data: DeploymentCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deploy a generated website to a subdomain
    """
    # Verify website exists and belongs to user
    website = await db.scalar(
        select(GeneratedWebsite).where(
            GeneratedWebsite.id == website_id,
            GeneratedWebsite.user_id == current_user.id,
        )
    )
    
    if not website:
        raise HTTPException(
            status_code=404,
            detail="Website not found",
        )
    
    # Validate and sanitize subdomain
    try:
        subdomain = DeploymentManager.sanitize_subdomain(data.subdomain)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
    
    # Check if subdomain is available
    manager = DeploymentManager(db, uuid.uuid4())  # Temporary manager for validation
    if not await manager.check_subdomain_available(subdomain):
        raise HTTPException(
            status_code=409,
            detail=f"Subdomain '{subdomain}' is already taken",
        )
    
    # Create deployment record
    deployment = Deployment(
        website_id=website_id,
        user_id=current_user.id,
        subdomain=subdomain,
        domain=f"https://{subdomain}.onlinegif.shop",
        database_name="",  # Will be set during deployment
        port=0,  # Will be allocated during deployment
        systemd_service="",  # Will be set during deployment
        backend_path="",  # Will be set during deployment
        status="DEPLOYING",
    )
    
    db.add(deployment)
    await db.flush()
    await db.refresh(deployment)
    
    # Start deployment in background
    from ..database import settings
    background_tasks.add_task(
        run_deployment,
        deployment.id,
        subdomain,
        settings.DATABASE_URL,
    )
    
    return deployment


@router.get(
    "/{deployment_id}",
    response_model=DeploymentResponse,
)
async def get_deployment(
    deployment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get deployment details"""
    deployment = await db.scalar(
        select(Deployment).where(
            Deployment.id == deployment_id,
            Deployment.user_id == current_user.id,
        )
    )
    
    if not deployment:
        raise HTTPException(
            status_code=404,
            detail="Deployment not found",
        )
    
    return deployment


@router.get(
    "/{deployment_id}/logs",
    response_model=list[DeploymentLogResponse],
)
async def get_deployment_logs(
    deployment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get deployment logs"""
    # Verify deployment belongs to user
    deployment = await db.scalar(
        select(Deployment).where(
            Deployment.id == deployment_id,
            Deployment.user_id == current_user.id,
        )
    )
    
    if not deployment:
        raise HTTPException(
            status_code=404,
            detail="Deployment not found",
        )
    
    # Get logs
    result = await db.scalars(
        select(DeploymentLog)
        .where(DeploymentLog.deployment_id == deployment_id)
        .order_by(DeploymentLog.created_at.asc())
    )
    
    return result.all()


@router.get(
    "/website/{website_id}",
    response_model=list[DeploymentResponse],
)
async def get_website_deployments(
    website_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all deployments for a website"""
    # Verify website belongs to user
    website = await db.scalar(
        select(GeneratedWebsite).where(
            GeneratedWebsite.id == website_id,
            GeneratedWebsite.user_id == current_user.id,
        )
    )
    
    if not website:
        raise HTTPException(
            status_code=404,
            detail="Website not found",
        )
    
    # Get deployments
    result = await db.scalars(
        select(Deployment)
        .where(Deployment.website_id == website_id)
        .order_by(Deployment.created_at.desc())
    )
    
    return result.all()
