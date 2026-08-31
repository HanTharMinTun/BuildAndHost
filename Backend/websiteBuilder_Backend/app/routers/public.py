"""
Public API endpoints that don't require authentication.
Used for serving published websites to end users.
"""

from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from ..database import get_db
from ..models import Deployment, GeneratedWebsite
from ..schemas import WebsiteResponse


router = APIRouter(
    prefix="/api/public",
    tags=["Public"],
)


@router.get("/sites/by-subdomain/{subdomain}")
async def get_website_by_subdomain(
    subdomain: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a published website's JSON by its subdomain (no authentication required).
    This endpoint is used for rendering published sites on custom subdomains.
    """
    # Find the deployment by subdomain
    deployment = await db.scalar(
        select(Deployment).where(
            Deployment.subdomain == subdomain,
            Deployment.status == "RUNNING",  # Only serve running deployments
        )
    )
    
    if not deployment:
        raise HTTPException(
            status_code=404,
            detail=f"No published website found for subdomain: {subdomain}",
        )
    
    # Get the associated website JSON
    website = await db.scalar(
        select(GeneratedWebsite).where(
            GeneratedWebsite.id == deployment.website_id,
        )
    )
    
    if not website:
        raise HTTPException(
            status_code=404,
            detail="Website data not found",
        )
    
    # Return the website JSON, theme, and metadata
    return {
        "id": str(website.id),
        "project_id": str(website.project_id),
        "website_json": website.website_json,
        "theme_json": website.theme_json,
        "subdomain": deployment.subdomain,
        "domain": deployment.domain,
        "version": website.version,
    }


@router.get("/sites/by-hostname")
async def get_website_by_hostname(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a published website's JSON by detecting the hostname from the request origin.
    This is useful when the frontend doesn't know the subdomain in advance.
    """
    # Extract hostname from the origin header (where the request came from)
    # The 'host' header contains the API server, but 'origin' contains the client's domain
    origin = request.headers.get("origin", "")
    
    if not origin:
        raise HTTPException(
            status_code=400,
            detail="Missing origin header - cannot determine subdomain",
        )
    
    # Remove protocol (https://) and port if present
    # origin format: https://subdomain.webcreator.site or https://subdomain.webcreator.site:443
    hostname = origin.replace("https://", "").replace("http://", "").split(":")[0]
    
    # Extract subdomain from hostname
    # Expected format: subdomain.webcreator.site
    parts = hostname.split(".")
    
    # If it's localhost or doesn't match subdomain pattern, reject
    if "localhost" in hostname or len(parts) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid hostname for published site: {hostname}",
        )
    
    # Extract subdomain (first part)
    subdomain = parts[0]
    
    # Reuse the subdomain lookup logic
    return await get_website_by_subdomain(subdomain, db)
