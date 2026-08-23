from fastapi import FastAPI, File, Form, UploadFile
from typing import List, Optional
import os
from uuid import uuid4

import website_planner
import theme_designer
import layout_designer
from fastapi import Body

from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.requests import Request
from fastapi.staticfiles import StaticFiles

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Avoid jsonable_encoder attempting to decode binary data from uploaded
    # files when FastAPI's default handler tries to include the raw errors.
    return JSONResponse(
        status_code=422,
        content={"detail": "Request validation failed. Check form fields and file uploads."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)


@app.get("/api/ai/")
def read_root():
    return {"message": "Hello User"}


# @app.post("/api/post_prompt")
# async def post_prompt(
#     prompt: str = Form(...),
#     type: str = Form(...),
#     files: Optional[List[UploadFile]] = File(None),
# ):
#     """
#     Accepts a prompt and optional file uploads. Saved files are placed into
#     the frontend `public/uploads` folder so they can be referenced at
#     `/uploads/<filename>` from the dev server.
#     """
#     upload_urls: List[str] = []
#     file_texts = {}
#     if files:
#         uploads_dir = os.path.join(os.path.dirname(__file__), "..", "ai-website-builder", "public", "uploads")
#         uploads_dir = os.path.normpath(uploads_dir)
#         os.makedirs(uploads_dir, exist_ok=True)
#         for f in files:
#             # create a safe unique filename
#             extension = os.path.splitext(f.filename)[1] or ""
#             safe_name = f"{uuid4().hex}{extension}"
#             dest_path = os.path.join(uploads_dir, safe_name)
#             with open(dest_path, "wb") as out:
#                 content = await f.read()
#                 out.write(content)
#             # Use a relative URL the frontend can request from Vite dev server
#             upload_urls.append(f"/uploads/{safe_name}")
#             # Attempt simple text extraction for PDFs and text files.
#             try:
#                 ext = extension.lower()
#                 if ext == ".pdf":
#                     try:
#                         from PyPDF2 import PdfReader
#                         reader = PdfReader(dest_path)
#                         text = []
#                         for page in reader.pages:
#                             page_text = page.extract_text() or ""
#                             text.append(page_text)
#                         file_texts[f"/uploads/{safe_name}"] = "\n".join(text)
#                     except Exception:
#                         # PDF extraction not available or failed; skip
#                         pass
#                 elif ext == ".docx":
#                     try:
#                         from docx import Document
#                         doc = Document(dest_path)
#                         paragraphs = [p.text for p in doc.paragraphs if p.text]
#                         file_texts[f"/uploads/{safe_name}"] = "\n".join(paragraphs)
#                     except Exception:
#                         pass
#                 elif ext in (".txt",):
#                     try:
#                         with open(dest_path, "r", encoding="utf-8", errors="ignore") as fh:
#                             file_texts[f"/uploads/{safe_name}"] = fh.read()
#                     except Exception:
#                         pass
#             except Exception:
#                 pass

#     # First pass creates structure/content only. The second pass creates the
#     # theme for that exact component tree. Pass the upload URLs to the planner
#     # so it can reference attachments in generated Image/CDNIcon props.
#     try:
#         website = website_planner.create_layout(prompt, file_urls=upload_urls, file_texts=file_texts)
#         # Generate responsive layout information for the component tree.
#         try:
#             layout_info = layout_designer.create_responsive_layout(website)
#         except Exception:
#             layout_info = None
#         theme = theme_designer.create_theme(prompt, website)
#         return {"website": website, "layout": layout_info, "theme": theme, "uploads": upload_urls}
#     except Exception as e:
#         # Return a safe JSON response instead of 500 to the client with a helpful message.
#         return JSONResponse(status_code=400, content={"detail": "Planner failed to generate JSON. Try providing key text info or upload plain-text files. Error: " + str(e)})


from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
from uuid import uuid4
import os


# Public upload directory served by Nginx
UPLOAD_DIR = "/var/www/onlinegif/uploads"


@app.post("/api/ai/post_prompt")
async def post_prompt(
    prompt: str = Form(...),
    type: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
):
    """
    Accepts a prompt and optional file uploads.

    Uploaded files are stored in:
        /var/www/onlinegif/uploads/

    Nginx serves them as:
        https://onlinegif.shop/uploads/<filename>
    """

    upload_urls: List[str] = []
    file_texts = {}

    # Make sure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    if files:
        for f in files:

            # Get extension safely
            original_filename = f.filename or ""
            extension = os.path.splitext(original_filename)[1].lower()

            # Generate unique filename
            safe_name = f"{uuid4().hex}{extension}"

            # Absolute filesystem path
            dest_path = os.path.join(
                UPLOAD_DIR,
                safe_name
            )

            # Save uploaded file
            with open(dest_path, "wb") as out:
                content = await f.read()
                out.write(content)

            # Public URL
            upload_url = f"/uploads/{safe_name}"
            upload_urls.append(upload_url)

            # ------------------------------------------------
            # Extract text from uploaded files
            # ------------------------------------------------

            try:

                if extension == ".pdf":

                    try:
                        from PyPDF2 import PdfReader

                        reader = PdfReader(dest_path)

                        text = []

                        for page in reader.pages:
                            page_text = page.extract_text() or ""
                            text.append(page_text)

                        file_texts[upload_url] = "\n".join(text)

                    except Exception as e:
                        print(f"PDF extraction failed: {e}")

                elif extension == ".docx":

                    try:
                        from docx import Document

                        doc = Document(dest_path)

                        paragraphs = [
                            p.text
                            for p in doc.paragraphs
                            if p.text
                        ]

                        file_texts[upload_url] = "\n".join(
                            paragraphs
                        )

                    except Exception as e:
                        print(f"DOCX extraction failed: {e}")

                elif extension == ".txt":

                    try:
                        with open(
                            dest_path,
                            "r",
                            encoding="utf-8",
                            errors="ignore"
                        ) as fh:

                            file_texts[upload_url] = fh.read()

                    except Exception as e:
                        print(f"TXT extraction failed: {e}")

            except Exception as e:
                print(f"File processing failed: {e}")

    # ------------------------------------------------
    # AI Website Generation
    # ------------------------------------------------

    try:

        website = website_planner.create_layout(
            prompt,
            file_urls=upload_urls,
            file_texts=file_texts
        )

        # Generate responsive layout
        try:
            layout_info = (
                layout_designer.create_responsive_layout(
                    website
                )
            )

        except Exception as e:
            print(f"Layout generation failed: {e}")
            layout_info = None

        # Generate theme
        theme = theme_designer.create_theme(
            prompt,
            website
        )

        return {
            "website": website,
            "layout": layout_info,
            "theme": theme,
            "uploads": upload_urls
        }

    except Exception as e:

        print(f"Website generation failed: {e}")

        return JSONResponse(
            status_code=400,
            content={
                "detail": (
                    "Planner failed to generate JSON. "
                    "Try providing key text information "
                    "or uploading plain-text files. "
                    f"Error: {str(e)}"
                )
            }
        )

        


@app.post("/api/design_layout")
async def design_layout(body: dict = Body(...)):
    """Accept a website component tree (JSON) and return responsive layout info."""
    try:
        layout = layout_designer.create_responsive_layout(body)
        return {"layout": layout}
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": "Layout designer failed: " + str(e)})


@app.post("/api/ai/design_theme")
async def design_theme(body: dict = Body(...)):
    """Accept a website component tree (JSON) and return a generated theme."""
    try:
        theme = theme_designer.create_theme(body.get("brief", ""), body)
        return {"theme": theme}
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": "Theme designer failed: " + str(e)})
