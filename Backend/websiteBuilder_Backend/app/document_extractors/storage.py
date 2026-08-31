"""
Image storage utilities for document extraction.

Handles saving extracted images to the public uploads directory
and generating accessible URLs for the frontend.
"""

import os
import uuid
from pathlib import Path
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class DocumentImageStorage:
    """Manages storage of images extracted from documents."""
    
    def __init__(self, base_upload_dir: str = None):
        """
        Initialize storage handler.
        
        Args:
            base_upload_dir: Base directory for uploads. 
                           Defaults to public/uploads/documents
        """
        if base_upload_dir is None:
            # Default to the frontend public directory
            project_root = Path(__file__).parent.parent.parent.parent.parent
            base_upload_dir = project_root / "ai-website-builder" / "public" / "uploads" / "documents"
        
        self.base_upload_dir = Path(base_upload_dir)
        self.base_upload_dir.mkdir(parents=True, exist_ok=True)
        
    def create_document_directory(self, document_id: str) -> Path:
        """
        Create a unique directory for a document's extracted images.
        
        Args:
            document_id: Unique identifier for the document (UUID)
            
        Returns:
            Path to the document's image directory
        """
        doc_dir = self.base_upload_dir / str(document_id)
        doc_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created document directory: {doc_dir}")
        return doc_dir
    
    def save_image(
        self,
        image_data: bytes,
        document_id: str,
        image_index: int,
        extension: str = "png"
    ) -> Tuple[str, str]:
        """
        Save an extracted image to disk.
        
        Args:
            image_data: Raw image bytes
            document_id: Document's unique identifier
            image_index: Sequential index for this image
            extension: File extension (png, jpg, etc.)
            
        Returns:
            Tuple of (file_path, url_path)
            - file_path: Absolute path on disk
            - url_path: Relative URL path for frontend access
        """
        if not image_data:
            raise ValueError("Image data is empty")
        
        # Sanitize extension
        extension = extension.lower().strip(".")
        if extension not in ["png", "jpg", "jpeg", "gif", "webp"]:
            logger.warning(f"Unusual image extension: {extension}, using png")
            extension = "png"
        
        # Create document directory
        doc_dir = self.create_document_directory(document_id)
        
        # Generate safe filename
        safe_filename = f"image_{image_index:03d}.{extension}"
        file_path = doc_dir / safe_filename
        
        # Save image
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        # Generate URL path (relative to public directory)
        url_path = f"/uploads/documents/{document_id}/{safe_filename}"
        
        logger.info(f"Saved image: {safe_filename} ({len(image_data)} bytes)")
        
        return str(file_path), url_path
    
    def cleanup_document_directory(self, document_id: str) -> bool:
        """
        Remove a document's image directory and all its contents.
        
        Args:
            document_id: Document's unique identifier
            
        Returns:
            True if successful, False otherwise
        """
        doc_dir = self.base_upload_dir / str(document_id)
        
        if not doc_dir.exists():
            logger.warning(f"Document directory does not exist: {doc_dir}")
            return False
        
        try:
            import shutil
            shutil.rmtree(doc_dir)
            logger.info(f"Cleaned up document directory: {doc_dir}")
            return True
        except Exception as e:
            logger.error(f"Failed to cleanup document directory: {e}")
            return False
