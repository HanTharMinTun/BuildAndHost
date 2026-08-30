"""
Public website API router
Serves published website data without authentication
"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import os

router = APIRouter(
    prefix="/api/public",
    tags=["Public Website"],
)


@router.get("/website")
async def get_published_website(request: Request):
    """
    Get the published website JSON for the current subdomain.
    This endpoint is called by the frontend renderer to fetch website data.
    """
    # Get the subdomain from the host header
    host = request.headers.get("host", "")
    
    # Extract subdomain from host (e.g., "armyranger.onlinegif.shop" → "armyranger")
    subdomain = host.split(".")[0] if "." in host else None
    
    if not subdomain:
        raise HTTPException(
            status_code=400,
            detail="Could not determine subdomain from request"
        )
    
    # In the deployment architecture, each subdomain has its own database
    # The website JSON is stored in the main buildandhost database
    # We need to fetch it from there using the subdomain
    
    # For now, return a simple response that the frontend can use
    # The actual implementation will connect to the main database
    try:
        # Import here to avoid circular dependencies
        import psycopg2
        import json
        
        # Connect to the main buildandhost database
        conn = psycopg2.connect(
            dbname="ai_website_builder",
            user="postgres",
            password="root",
            host="localhost",
            port="5432"
        )
        
        cursor = conn.cursor()
        
        # Get the website JSON for this subdomain
        cursor.execute("""
            SELECT gw.website_json 
            FROM deployments d
            JOIN generated_websites gw ON d.website_id = gw.id
            WHERE d.subdomain = %s AND d.status = 'RUNNING'
        """, (subdomain,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No published website found for subdomain '{subdomain}'"
            )
        
        website_json = result[0]
        
        return JSONResponse(content={
            "subdomain": subdomain,
            "website": website_json
        })
        
    except psycopg2.Error as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching website: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for published websites"""
    return {"status": "healthy", "service": "published_website"}
