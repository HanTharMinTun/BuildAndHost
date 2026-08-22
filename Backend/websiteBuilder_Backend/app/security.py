from datetime import datetime, timedelta, timezone

from jose import jwt

from .database import settings




ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)


# def verify_password(
#     plain_password: str,
#     hashed_password: str,
# ) -> bool:
#     return pwd_context.verify(
#         plain_password,
#         hashed_password,
#     )


from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)



def create_access_token(
    user_id: str,
) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )

import uuid

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db, settings
from .models import User


bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials=Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:

    try:

        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise ValueError("Missing user ID")

        user_uuid = uuid.UUID(user_id)

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    user = await db.scalar(
        select(User).where(User.id == user_uuid)
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user