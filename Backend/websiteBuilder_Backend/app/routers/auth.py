from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User
from ..schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
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

    if not user or not verify_password(
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