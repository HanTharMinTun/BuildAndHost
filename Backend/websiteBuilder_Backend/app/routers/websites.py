import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import (
    User,
    Project,
    GeneratedWebsite,
)
from ..schemas import (
    WebsiteCreate,
    WebsiteResponse,
    WebsiteContentUpdate,
)
from ..security import get_current_user


router = APIRouter(
    prefix="/api/websites",
    tags=["Generated Websites"],
)

@router.get(
    "",
    response_model=list[WebsiteResponse],
)
async def get_websites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.scalars(
        select(GeneratedWebsite)
        .where(
            GeneratedWebsite.user_id == current_user.id,
        )
        .order_by(
            GeneratedWebsite.created_at.desc()
        )
    )

    return result.all()

@router.post(
    "",
    response_model=WebsiteResponse,
    status_code=201,
)
async def save_website(
    data: WebsiteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    project = await db.scalar(
        select(Project).where(
            Project.id == data.project_id,
            Project.user_id == current_user.id,
        )
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    website = GeneratedWebsite(
        project_id=data.project_id,
        prompt_id=data.prompt_id,
        user_id=current_user.id,
        website_json=data.website_json,
        theme_json=data.theme_json,
        version=data.version,
    )

    db.add(website)

    await db.flush()
    await db.refresh(website)

    return website


@router.get(
    "/project/{project_id}",
    response_model=list[WebsiteResponse],
)
async def get_project_websites(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = await db.scalars(
        select(GeneratedWebsite)
        .where(
            GeneratedWebsite.project_id == project_id,
            GeneratedWebsite.user_id == current_user.id,
        )
        .order_by(
            GeneratedWebsite.version.desc()
        )
    )

    return result.all()


@router.get(
    "/{website_id}",
    response_model=WebsiteResponse,
)
async def get_website(
    website_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

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

    return website


@router.put(
    "/{website_id}",
    response_model=WebsiteResponse,
)
async def update_website_content(
    website_id: uuid.UUID,
    data: WebsiteContentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the website JSON content and theme.
    Only the authenticated owner can update their website.
    """
    # Find the website
    website = await db.scalar(
        select(GeneratedWebsite).where(
            GeneratedWebsite.id == website_id,
        )
    )

    if not website:
        raise HTTPException(
            status_code=404,
            detail="Website not found",
        )

    # Verify ownership
    if website.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this website",
        )

    # Update only the content fields
    website.website_json = data.website_json
    if data.theme_json is not None:
        website.theme_json = data.theme_json

    # Commit changes
    await db.commit()
    await db.refresh(website)

    return website


@router.delete(
    "/{website_id}",
    status_code=204,
)
async def delete_website(
    website_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    await db.delete(website)
    await db.commit()