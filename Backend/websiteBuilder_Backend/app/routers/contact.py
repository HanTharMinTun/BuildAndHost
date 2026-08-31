from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from email.message import EmailMessage
import aiosmtplib
import os

from ..database import get_db
from ..models import User, Project
from ..schemas import ContactFormRequest, ContactFormResponse


router = APIRouter(
    prefix="/api/contact",
    tags=["Contact"],
)


@router.post(
    "/submit",
    response_model=ContactFormResponse,
)
async def submit_contact_form(
    data: ContactFormRequest,
    db: AsyncSession = Depends(get_db),
):
    # --------------------------------------------------
    # 1. Find the project / website
    # --------------------------------------------------

    project = await db.scalar(
        select(Project).where(Project.id == data.project_id)
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website/project not found",
        )

    # --------------------------------------------------
    # 2. Find the user who owns this website
    # --------------------------------------------------

    owner = await db.scalar(
        select(User).where(User.id == project.user_id)
    )

    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Website owner not found",
        )

    if not owner.email:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Website owner does not have an email address",
        )

    # --------------------------------------------------
    # 3. Read SMTP configuration
    # --------------------------------------------------

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM")

    if not all([
        smtp_host,
        smtp_username,
        smtp_password,
        smtp_from,
    ]):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service is not configured",
        )

    # --------------------------------------------------
    # 4. Create email
    # --------------------------------------------------

    message = EmailMessage()

    message["Subject"] = f"New contact message from {data.name}"
    message["From"] = smtp_from
    message["To"] = owner.email
    message["Reply-To"] = data.email

    message.set_content(
        f"""
You received a new message from your website.

Name:
{data.name}

Email:
{data.email}

Message:
{data.message}

----------------------------------------
This message was sent through your website.
"""
    )

    # --------------------------------------------------
    # 5. Send email
    # --------------------------------------------------

    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_username,
            password=smtp_password,
            start_tls=True,
        )

    except Exception as e:
        print(f"Contact email error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email",
        )

    # --------------------------------------------------
    # 6. Success
    # --------------------------------------------------

    return ContactFormResponse(
        success=True,
        message="Your message has been sent successfully.",
    )