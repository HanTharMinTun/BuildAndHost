from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests
import os

from ..database import get_db, settings
from ..models import User
from ..schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    GoogleLoginRequest,
)
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
):

    existing_user = await db.scalar(
        select(User).where(
            (User.email == data.email)
            | (User.username == data.username)
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email or username already exists",
        )

    user = User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
    )

    db.add(user)
    await db.flush()
    await db.refresh(user)

    return user


@router.post("/login")
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
):

    user = await db.scalar(
        select(User).where(User.email == data.email)
    )

    if not user or not user.password_hash or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(str(user.id))

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
        },
    }


@router.post("/google/login")
async def google_login(
    data: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user with Google OAuth.
    Verifies Google ID token and creates/logs in user.
    """
    try:
        # Verify Google ID token
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not google_client_id:
            raise HTTPException(
                status_code=500,
                detail="Google OAuth not configured",
            )

        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            data.credential,
            requests.Request(),
            google_client_id
        )

        # Extract user info from Google token
        google_id = idinfo.get("sub")
        email = idinfo.get("email")
        full_name = idinfo.get("name")
        
        if not google_id or not email:
            raise HTTPException(
                status_code=400,
                detail="Invalid Google token",
            )

        # Check if user exists by google_id
        user = await db.scalar(
            select(User).where(User.google_id == google_id)
        )

        if user:
            # Existing Google user - log them in
            token = create_access_token(str(user.id))
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                },
            }

        # Check if email already exists (link accounts)
        existing_user = await db.scalar(
            select(User).where(User.email == email)
        )

        if existing_user:
            # Link Google account to existing email/password account
            existing_user.google_id = google_id
            await db.flush()
            await db.refresh(existing_user)

            token = create_access_token(str(existing_user.id))
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": str(existing_user.id),
                    "email": existing_user.email,
                    "username": existing_user.username,
                },
            }

        # Create new Google-only user
        # Generate username from email
        username = email.split("@")[0]
        
        # Ensure username is unique
        base_username = username
        counter = 1
        while await db.scalar(select(User).where(User.username == username)):
            username = f"{base_username}{counter}"
            counter += 1

        new_user = User(
            email=email,
            username=username,
            google_id=google_id,
            full_name=full_name,
            password_hash=None,  # No password for Google-only accounts
        )

        db.add(new_user)
        await db.flush()
        await db.refresh(new_user)

        token = create_access_token(str(new_user.id))

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "username": new_user.username,
            },
        }

    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=401,
            detail=f"Invalid Google token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Google authentication failed: {str(e)}",
        )