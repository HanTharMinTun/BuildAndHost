"""
File upload router with document processing support.

Handles file uploads (including PDF/DOCX) and integrates with document extraction.
"""

import os
import uuid
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User, Upload, Project
from ..security import get_current_user
from ..document_extractors import process_document, build_ai_context, detect_document_type

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/uploads",
    tags=["File Uploads"],
)

# Configuration
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"}
UPLOAD_BASE_DIR = Path(__file__).parent.parent.parent.parent.parent / "ai-website-builder" / "public" / "uploads"


def get_safe_filename(original_filename: str, upload_id: uuid.UUID) -> str:
    """
    Generate a safe filename using UUID to prevent path traversal.
    
    Args:
        original_filename: Original uploaded filename
        upload_id: UUID for this upload
        
    Returns:
        Safe filename with original extension
    """
    extension = Path(original_filename).suffix.lower()
    safe_name = f"{upload_id}{extension}"
    return safe_name


async def save_upload_file(
    file: UploadFile,
    upload_id: uuid.UUID,
    project_id: Optional[uuid.UUID] = None
) -> tuple[str, int]:
    """
    Save an uploaded file to disk.
    
    Args:
        file: FastAPI UploadFile object
        upload_id: UUID for this upload
        project_id: Optional project ID for organizing files
        
    Returns:
        Tuple of (file_path, file_size)
        
    Raises:
        HTTPException: If file is too large or invalid
    """
    # Determine upload directory
    if project_id:
        upload_dir = UPLOAD_BASE_DIR / str(project_id)
    else:
        upload_dir = UPLOAD_BASE_DIR / "general"
    
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate safe filename
    safe_filename = get_safe_filename(file.filename, upload_id)
    file_path = upload_dir / safe_filename
    
    # Save file with size validation
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    try:
        with open(file_path, "wb") as f:
            while chunk := await file.read(chunk_size):
                file_size += len(chunk)
                
                # Check size limit
                if file_size > MAX_FILE_SIZE:
                    f.close()
                    file_path.unlink()  # Delete partial file
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
                    )
                
                f.write(chunk)
        
        logger.info(f"Saved file: {file_path} ({file_size} bytes)")
        return str(file_path), file_size
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail="Failed to save file")



@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a file and optionally process it (PDF/DOCX extraction).
    
    Supports:
    - PDF files (with text and image extraction)
    - DOCX files (with text and image extraction)
    - Image files (jpg, png, gif, svg, webp)
    
    Returns upload metadata and extracted content for documents.
    """
    # Validate filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Validate extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate project if provided
    project_uuid = None
    if project_id:
        try:
            project_uuid = uuid.UUID(project_id)
            project = await db.scalar(
                select(Project).where(
                    Project.id == project_uuid,
                    Project.user_id == current_user.id
                )
            )
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid project ID")
    
    # Generate upload ID
    upload_id = uuid.uuid4()
    
    # Save file to disk
    try:
        file_path, file_size = await save_upload_file(file, upload_id, project_uuid)
    except HTTPException:
        raise
    
    # Create database record
    upload = Upload(
        id=upload_id,
        user_id=current_user.id,
        project_id=project_uuid,
        filename=file.filename,
        file_path=file_path,
        file_type=file_extension.strip("."),
        file_size=file_size,
    )
    
    db.add(upload)
    await db.flush()
    
    # Process document if PDF or DOCX
    extracted_data = None
    doc_type = detect_document_type(file_path)
    
    if doc_type in ["pdf", "docx"]:
        try:
            logger.info(f"Processing {doc_type.upper()} document: {file.filename}")
            
            # Extract content
            document_data = process_document(
                file_path=file_path,
                document_id=str(upload_id)
            )
            
            # Build AI context
            ai_context = build_ai_context(document_data)
            
            extracted_data = {
                "document_type": doc_type,
                "extracted_text": document_data.get("extracted_text", ""),
                "image_urls": document_data.get("image_urls", []),
                "image_count": len(document_data.get("image_urls", [])),
                "text_length": len(document_data.get("extracted_text", "")),
                "ai_context": ai_context["document_summary"],
            }
            
            logger.info(
                f"Document processed: {len(extracted_data['extracted_text'])} chars, "
                f"{extracted_data['image_count']} images"
            )
            
        except Exception as e:
            logger.error(f"Document processing failed: {e}", exc_info=True)
            extracted_data = {
                "error": f"Failed to process document: {str(e)}"
            }
    
    await db.commit()
    await db.refresh(upload)
    
    # Build response
    response = {
        "id": str(upload.id),
        "filename": upload.filename,
        "file_type": upload.file_type,
        "file_size": upload.file_size,
        "project_id": str(upload.project_id) if upload.project_id else None,
    }
    
    if extracted_data:
        response["extracted_content"] = extracted_data
    
    return response


@router.get("/{upload_id}")
async def get_upload(
    upload_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get upload details by ID."""
    upload = await db.scalar(
        select(Upload).where(
            Upload.id == upload_id,
            Upload.user_id == current_user.id
        )
    )
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    return {
        "id": str(upload.id),
        "filename": upload.filename,
        "file_type": upload.file_type,
        "file_size": upload.file_size,
        "project_id": str(upload.project_id) if upload.project_id else None,
    }


@router.get("/project/{project_id}")
async def get_project_uploads(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all uploads for a project."""
    project = await db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    result = await db.scalars(
        select(Upload).where(Upload.project_id == project_id)
    )
    
    uploads = result.all()
    
    return [
        {
            "id": str(upload.id),
            "filename": upload.filename,
            "file_type": upload.file_type,
            "file_size": upload.file_size,
        }
        for upload in uploads
    ]

