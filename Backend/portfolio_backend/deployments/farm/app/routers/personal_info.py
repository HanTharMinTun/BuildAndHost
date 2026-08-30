from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, crud, auth

router = APIRouter(prefix="/api/personal-info", tags=["Personal Info"])

@router.get("/", response_model=schemas.PersonalInfoResponse)
async def get_personal_info(db: Session = Depends(get_db)):
    info = crud.get_personal_info(db)
    if not info:
        raise HTTPException(status_code=404, detail="Personal info not found")
    return info

@router.put("/", response_model=schemas.PersonalInfoResponse)
async def update_personal_info(
    info: schemas.PersonalInfoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    return crud.update_personal_info(db, info)