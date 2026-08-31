import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import Project, User, Prompt, Upload, GeneratedWebsite, Deployment
from ..schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    UploadInfo,
    DeploymentInfo,
)
from ..security import get_current_user


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=201,
)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = Project(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
    )

    db.add(project)

    await db.flush()
    await db.refresh(project)

    return project


@router.get(
    "",
    response_model=list[ProjectResponse],
)
async def get_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all projects for the current user with enhanced data:
    - Latest/creation prompt
    - Attached files (uploads)
    - Latest deployment info
    """
    
    # Fetch projects
    result = await db.scalars(
        select(Project)
        .where(Project.user_id == current_user.id)
        .order_by(Project.updated_at.desc())
    )
    projects = result.all()
    
    # Enrich each project with related data
    enriched_projects = []
    
    for project in projects:
        # Get latest prompt for this project
        prompt_result = await db.scalar(
            select(Prompt.prompt_text)
            .where(Prompt.project_id == project.id)
            .order_by(Prompt.created_at.desc())
            .limit(1)
        )
        
        # Get all uploads for this project
        uploads_result = await db.scalars(
            select(Upload)
            .where(Upload.project_id == project.id)
            .order_by(Upload.created_at.desc())
        )
        uploads = uploads_result.all()
        
        # Get latest generated website for this project
        latest_website = await db.scalar(
            select(GeneratedWebsite)
            .where(GeneratedWebsite.project_id == project.id)
            .order_by(GeneratedWebsite.created_at.desc())
            .limit(1)
        )
        
        # Get latest deployment if website exists
        deployment = None
        deployment_url = None
        deployment_status = None
        
        if latest_website:
            deployment = await db.scalar(
                select(Deployment)
                .where(Deployment.website_id == latest_website.id)
                .order_by(Deployment.created_at.desc())
                .limit(1)
            )
            
            if deployment:
                deployment_url = deployment.domain if deployment.status == "RUNNING" else None
                deployment_status = deployment.status
        
        # Build enriched response
        project_dict = {
            "id": project.id,
            "user_id": project.user_id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "prompt": prompt_result,
            "attachments": [
                UploadInfo(
                    id=upload.id,
                    filename=upload.filename,
                    file_type=upload.file_type,
                    file_size=upload.file_size,
                    created_at=upload.created_at,
                )
                for upload in uploads
            ],
            "deployment_url": deployment_url,
            "deployment_status": deployment_status,
            "deployment_info": DeploymentInfo(
                id=deployment.id,
                subdomain=deployment.subdomain,
                domain=deployment.domain,
                status=deployment.status,
                created_at=deployment.created_at,
                updated_at=deployment.updated_at,
            ) if deployment else None,
        }
        
        enriched_projects.append(ProjectResponse(**project_dict))
    
    return enriched_projects


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
async def get_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = await db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


@router.patch(
    "/{project_id}",
    response_model=ProjectResponse,
)
async def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = await db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(project, key, value)

    await db.flush()
    await db.refresh(project)

    return project


@router.delete(
    "/{project_id}",
    status_code=204,
)
async def delete_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = await db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    await db.delete(project)