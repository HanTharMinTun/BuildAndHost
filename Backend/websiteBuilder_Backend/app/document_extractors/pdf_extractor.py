"""
PDF document extraction module.

Extracts text and images from PDF files using PyMuPDF (fitz).
Handles various PDF types: text-only, image-only, and mixed content.
"""

import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple
import uuid

logger = logging.getLogger(__name__)


def extract_pdf_content(
    pdf_path: str,
    document_id: str = None,
    storage_handler=None
) -> Dict[str, Any]:
    """
    Extract text and images from a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        document_id: Unique identifier for the document (auto-generated if None)
        storage_handler: DocumentImageStorage instance for saving images
        
    Returns:
        Dictionary containing:
        {
            "source_file": str,
            "source_type": "pdf",
            "document_id": str,
            "total_pages": int,
            "content": [
                {"type": "text", "page": int, "content": str},
                {"type": "image", "page": int, "url": str, "index": int}
            ],
            "extracted_text": str,  # All text concatenated
            "image_urls": [str]  # All image URLs
        }
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        logger.error("PyMuPDF (fitz) not installed. Install with: pip install PyMuPDF")
        raise ImportError("PyMuPDF is required for PDF extraction")
    
    if document_id is None:
        document_id = str(uuid.uuid4())
    
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    logger.info(f"Processing PDF: {pdf_path.name}")
    
    # Initialize storage if not provided
    if storage_handler is None:
        from .storage import DocumentImageStorage
        storage_handler = DocumentImageStorage()
    
    result = {
        "source_file": pdf_path.name,
        "source_type": "pdf",
        "document_id": document_id,
        "content": [],
        "extracted_text": "",
        "image_urls": []
    }
    
    try:
        # Open PDF
        doc = fitz.open(str(pdf_path))
        result["total_pages"] = len(doc)
        
        logger.info(f"PDF has {len(doc)} pages")
        
        all_text_parts = []
        total_images = 0
        
        # Process each page
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_index = page_num + 1  # Human-readable page number
            
            # Extract text
            page_text = page.get_text().strip()
            
            if page_text:
                # Add text content
                result["content"].append({
                    "type": "text",
                    "page": page_index,
                    "content": page_text
                })
                all_text_parts.append(f"[Page {page_index}]\n{page_text}")
                logger.debug(f"Page {page_index}: Extracted {len(page_text)} characters")
            
            # Extract images
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]  # Image reference
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    
                    # Save image
                    global_image_index = total_images
                    _, image_url = storage_handler.save_image(
                        image_data=image_bytes,
                        document_id=document_id,
                        image_index=global_image_index,
                        extension=image_ext
                    )
                    
                    # Add image content
                    result["content"].append({
                        "type": "image",
                        "page": page_index,
                        "url": image_url,
                        "index": global_image_index
                    })
                    result["image_urls"].append(image_url)
                    
                    total_images += 1
                    logger.debug(f"Page {page_index}: Extracted image {img_index + 1}")
                    
                except Exception as e:
                    logger.warning(f"Failed to extract image {img_index} from page {page_index}: {e}")
                    continue
        
        # Close document
        doc.close()
        
        # Consolidate all text
        result["extracted_text"] = "\n\n".join(all_text_parts)
        
        logger.info(
            f"PDF processing complete: "
            f"{len(result['extracted_text'])} chars, "
            f"{total_images} images"
        )
        
        return result
        
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}", exc_info=True)
        raise


def get_pdf_metadata(pdf_path: str) -> Dict[str, Any]:
    """
    Extract basic metadata from a PDF file without processing content.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Dictionary with metadata (page count, title, author, etc.)
    """
    try:
        import fitz
    except ImportError:
        return {"error": "PyMuPDF not installed"}
    
    try:
        doc = fitz.open(str(pdf_path))
        metadata = {
            "page_count": len(doc),
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "producer": doc.metadata.get("producer", ""),
        }
        doc.close()
        return metadata
    except Exception as e:
        logger.error(f"Failed to read PDF metadata: {e}")
        return {"error": str(e)}
