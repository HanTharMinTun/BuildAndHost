"""
AI-powered endpoints for theme generation and other AI features
"""
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User, GeneratedWebsite
from ..schemas import ThemeGenerationRequest, ThemeGenerationResponse
from ..security import get_current_user
from ..ai_service import generate_theme_with_ai, get_default_theme


# Configure logging
logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Features"],
)


@router.post(
    "/design_theme",
    response_model=ThemeGenerationResponse,
)
async def generate_design_theme(
    data: ThemeGenerationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a design theme for a website using AI.
    
    This endpoint:
    1. Fetches the specified website from the database
    2. Verifies the authenticated user owns the website
    3. Uses AI to generate a theme based on the website structure and user brief
    4. Persists the generated theme to the database
    5. Returns the generated theme
    
    Args:
        data: ThemeGenerationRequest containing website_id and brief
        db: Database session
        current_user: Authenticated user
        
    Returns:
        ThemeGenerationResponse with the generated theme
        
    Raises:
        HTTPException 404: Website not found
        HTTPException 403: User doesn't own the website
        HTTPException 500: Theme generation failed
    """
    try:
        # Fetch the website from database
        website = await db.scalar(
            select(GeneratedWebsite).where(
                GeneratedWebsite.id == data.website_id,
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
                detail="You don't have permission to modify this website",
            )
        
        # Get the current website JSON
        website_json = website.website_json
        
        if not website_json:
            raise HTTPException(
                status_code=400,
                detail="Website has no content to generate theme for",
            )
        
        # Generate theme using AI
        try:
            logger.info(f"Generating theme for website {data.website_id} with brief: {data.brief[:100]}...")
            generated_theme = await generate_theme_with_ai(
                brief=data.brief,
                website_json=website_json,
            )
            logger.info(f"Theme generated successfully for website {data.website_id}")
            
        except Exception as ai_error:
            # Log the error but continue with default theme
            logger.error(f"AI theme generation failed: {str(ai_error)}, using default theme")
            generated_theme = get_default_theme()
        
        # Update the website's theme in the database
        website.theme_json = generated_theme
        
        # Commit the changes
        await db.commit()
        await db.refresh(website)
        
        logger.info(f"Theme persisted to database for website {data.website_id}")
        
        # Return the generated theme
        return ThemeGenerationResponse(
            theme=generated_theme,
            website_id=data.website_id,
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in design_theme endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate theme: {str(e)}",
        )
