import uuid
import subprocess
import asyncio

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

# Port range for deployments
PORT_RANGE_START = 8000
PORT_RANGE_END = 8999


router = APIRouter(
    prefix="/api/deployments",
    tags=["Deployments"],
)


def is_port_in_use(port: int) -> bool:
    """Check if port is in use on the system"""
    try:
        result = subprocess.run(
            ["ss", "-tuln"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return f":{port}" in result.stdout
    except Exception:
        return False


async def allocate_port_for_deployment(db: AsyncSession) -> int:
    """
    Allocate a unique port for a new deployment.
    Uses SELECT FOR UPDATE to prevent race conditions.
    """
    # Get all allocated ports from ALL deployments (including FAILED ones)
    # Use FOR UPDATE to lock the rows and prevent concurrent allocation
    result = await db.execute(
        select(Deployment.port)
        .with_for_update()
    )
    allocated_ports = set(row[0] for row in result.fetchall() if row[0] is not None and row[0] != 0)
    
    # Find first available port
    for port in range(PORT_RANGE_START, PORT_RANGE_END + 1):
        if port not in allocated_ports:
            # Double-check port is not in use by system
            if not is_port_in_use(port):
                return port
    
    raise HTTPException(
        status_code=503,
        detail="No available ports in range 8000-8999"
    )


async def run_deployment(deployment_id: uuid.UUID, subdomain: str):
    """Background task to run deployment"""
    from ..database import AsyncSessionLocal
    import traceback
    
    print(f"[DEPLOYMENT] Starting deployment task for {deployment_id}")
    
    async with AsyncSessionLocal() as session:
        try:
            print(f"[DEPLOYMENT] Creating DeploymentManager for {subdomain}")
            manager = DeploymentManager(session, deployment_id)
            
            print(f"[DEPLOYMENT] Calling deploy() method")
            result = await manager.deploy(subdomain)
            
            print(f"[DEPLOYMENT] Deploy completed with result: {result}")
            await session.commit()
            print(f"[DEPLOYMENT] Session committed successfully")
            
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"[DEPLOYMENT ERROR] Deployment failed for {deployment_id}")
            print(f"[DEPLOYMENT ERROR] Error: {e}")
            print(f"[DEPLOYMENT ERROR] Traceback:\n{error_trace}")
            await session.rollback()
            print(f"[DEPLOYMENT ERROR] Session rolled back")


def start_deployment_task(deployment_id: uuid.UUID, subdomain: str):
    """Start deployment as a proper asyncio task"""
    try:
        print(f"[TASK] Creating asyncio task for deployment {deployment_id}")
        loop = asyncio.get_event_loop()
        task = loop.create_task(run_deployment(deployment_id, subdomain))
        print(f"[TASK] Task created: {task}")
    except Exception as e:
        print(f"[TASK ERROR] Failed to create task: {e}")
        import traceback
        print(traceback.format_exc())


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
    
    # Check if subdomain is available or has a failed deployment
    existing_deployment = await db.scalar(
        select(Deployment).where(Deployment.subdomain == subdomain)
    )
    
    if existing_deployment:
        # If there's an existing deployment that's DEPLOYING or RUNNING, reject
        if existing_deployment.status in ["DEPLOYING", "RUNNING"]:
            raise HTTPException(
                status_code=409,
                detail=f"Subdomain '{subdomain}' is already in use",
            )
        
        # If there's a FAILED deployment, reuse it
        if existing_deployment.status == "FAILED":
            # Verify it belongs to the same website
            if existing_deployment.website_id != website_id:
                raise HTTPException(
                    status_code=409,
                    detail=f"Subdomain '{subdomain}' was previously used by a different website",
                )
            
            # Reset the failed deployment for retry
            existing_deployment.status = "DEPLOYING"
            existing_deployment.error_message = None
            existing_deployment.database_name = ""
            existing_deployment.systemd_service = ""
            existing_deployment.backend_path = ""
            
            # Reuse existing port (no need to allocate a new one)
            # The port is already allocated and held by this deployment record
            
            await db.flush()
            await db.refresh(existing_deployment)
            deployment = existing_deployment
        else:
            raise HTTPException(
                status_code=409,
                detail=f"Subdomain '{subdomain}' has unexpected status: {existing_deployment.status}",
            )
    else:
        # No existing deployment, create new one
        port = await allocate_port_for_deployment(db)
        
        deployment = Deployment(
            website_id=website_id,
            user_id=current_user.id,
            subdomain=subdomain,
            domain=f"https://{subdomain}.onlinegif.shop",
            database_name="",
            port=port,
            systemd_service="",
            backend_path="",
            status="DEPLOYING",
        )
        
        db.add(deployment)
        await db.flush()
        await db.refresh(deployment)
    
    # Start deployment in background using asyncio.create_task
    print(f"[API] Initiating deployment task for {deployment.id}")
    try:
        # Create the task directly in the current event loop
        asyncio.create_task(run_deployment(deployment.id, subdomain))
        print(f"[API] Deployment task created successfully")
    except Exception as e:
        print(f"[API ERROR] Failed to create deployment task: {e}")
        import traceback
        print(traceback.format_exc())
    
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
