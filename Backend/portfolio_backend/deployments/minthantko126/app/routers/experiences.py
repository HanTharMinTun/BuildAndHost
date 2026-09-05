from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import schemas, crud, auth

router = APIRouter(prefix="/api/experiences", tags=["Experiences"])

@router.get("/", response_model=List[schemas.ExperienceResponse])
async def get_experiences(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return crud.get_experiences(db, skip=skip, limit=limit)

@router.get("/{experience_id}", response_model=schemas.ExperienceResponse)
async def get_experience(
    experience_id: int,
    db: Session = Depends(get_db)
):
    experience = crud.get_experience(db, experience_id)
    if not experience or not experience.is_active:
        raise HTTPException(status_code=404, detail="Experience not found")
    return experience

@router.post("/", response_model=schemas.ExperienceResponse)
async def create_experience(
    experience: schemas.ExperienceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    return crud.create_experience(db, experience)

@router.put("/{experience_id}", response_model=schemas.ExperienceResponse)
async def update_experience(
    experience_id: int,
    experience: schemas.ExperienceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    db_experience = crud.update_experience(db, experience_id, experience)
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return db_experience

@router.delete("/{experience_id}")
async def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    if not crud.delete_experience(db, experience_id):
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"success": True, "message": "Experience deleted successfully"}