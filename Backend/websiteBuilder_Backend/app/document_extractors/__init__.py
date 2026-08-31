"""
Document extraction package.

Provides a unified interface for extracting text and images from PDF and DOCX files.
"""

import logging
from pathlib import Path
from typing import Dict, Any, Optional

from .pdf_extractor import extract_pdf_content
from .docx_extractor import extract_docx_content
from .storage import DocumentImageStorage

logger = logging.getLogger(__name__)


def detect_document_type(file_path: str) -> Optional[str]:
    """
    Detect document type from file extension.
    
    Args:
        file_path: Path to the document file
        
    Returns:
        "pdf", "docx", or None if unsupported
    """
    file_path = Path(file_path)
    extension = file_path.suffix.lower()
    
    if extension == ".pdf":
        return "pdf"
    elif extension in [".docx", ".doc"]:
        return "docx"
    else:
        return None


def process_document(
    file_path: str,
    document_id: str = None,
    storage_handler: DocumentImageStorage = None
) -> Dict[str, Any]:
    """
    Process a document file (PDF or DOCX) and extract text and images.
    
    This is the main entry point for document processing.
    
    Args:
        file_path: Path to the document file
        document_id: Unique identifier for the document (auto-generated if None)
        storage_handler: Optional storage handler for saving images
        
    Returns:
        Dictionary containing:
        {
            "source_file": str,
            "source_type": "pdf" | "docx",
            "document_id": str,
            "content": [
                {"type": "text", "page": int, "content": str},
                {"type": "image", "page": int, "url": str}
            ],
            "extracted_text": str,
            "image_urls": [str]
        }
        
    Raises:
        ValueError: If document type is unsupported
        FileNotFoundError: If file doesn't exist
    """
    file_path = Path(file_path)
    
    if not file_path.exists():
        raise FileNotFoundError(f"Document file not found: {file_path}")
    
    doc_type = detect_document_type(str(file_path))
    
    if doc_type is None:
        raise ValueError(f"Unsupported document type: {file_path.suffix}")
    
    logger.info(f"Processing {doc_type.upper()} document: {file_path.name}")
    
    # Initialize storage handler if not provided
    if storage_handler is None:
        storage_handler = DocumentImageStorage()
    
    # Route to appropriate extractor
    if doc_type == "pdf":
        return extract_pdf_content(
            pdf_path=str(file_path),
            document_id=document_id,
            storage_handler=storage_handler
        )
    elif doc_type == "docx":
        return extract_docx_content(
            docx_path=str(file_path),
            document_id=document_id,
            storage_handler=storage_handler
        )
    else:
        raise ValueError(f"Unsupported document type: {doc_type}")


def build_ai_context(document_data: Dict[str, Any], max_text_length: int = 5000) -> Dict[str, Any]:
    """
    Build AI context from extracted document data.
    
    This formats the extracted content for consumption by the AI generation system.
    
    Args:
        document_data: Output from process_document()
        max_text_length: Maximum characters of text to include (to avoid huge prompts)
        
    Returns:
        Dictionary containing:
        {
            "document_summary": str,  # Formatted text for AI prompt
            "image_urls": [str],      # List of image URLs for AI
            "metadata": dict          # Document metadata
        }
    """
    extracted_text = document_data.get("extracted_text", "")
    image_urls = document_data.get("image_urls", [])
    source_file = document_data.get("source_file", "")
    source_type = document_data.get("source_type", "")
    
    # Truncate text if too long
    if len(extracted_text) > max_text_length:
        extracted_text = extracted_text[:max_text_length] + "\n\n[Text truncated for length...]"
        logger.info(f"Truncated document text to {max_text_length} characters")
    
    # Build formatted summary
    document_summary = f"""DOCUMENT CONTENT FROM: {source_file}

{extracted_text}"""
    
    if image_urls:
        document_summary += f"\n\nDOCUMENT IMAGES ({len(image_urls)} total):\n"
        for idx, url in enumerate(image_urls, 1):
            document_summary += f"Image {idx}: {url}\n"
    
    return {
        "document_summary": document_summary,
        "image_urls": image_urls,
        "metadata": {
            "source_file": source_file,
            "source_type": source_type,
            "text_length": len(document_data.get("extracted_text", "")),
            "image_count": len(image_urls)
        }
    }


__all__ = [
    "process_document",
    "build_ai_context",
    "detect_document_type",
    "DocumentImageStorage",
]
