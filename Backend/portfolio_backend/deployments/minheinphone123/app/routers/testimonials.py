from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import schemas, crud, auth

router = APIRouter(prefix="/api/testimonials", tags=["Testimonials"])

@router.get("/", response_model=List[schemas.TestimonialResponse])
async def get_testimonials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    approved_only: bool = True,
    db: Session = Depends(get_db)
):
    return crud.get_testimonials(db, skip=skip, limit=limit, approved_only=approved_only)

@router.get("/{testimonial_id}", response_model=schemas.TestimonialResponse)
async def get_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db)
):
    testimonial = crud.get_testimonial(db, testimonial_id)
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return testimonial

@router.post("/", response_model=schemas.TestimonialResponse)
async def create_testimonial(
    testimonial: schemas.TestimonialCreate,
    db: Session = Depends(get_db)
):
    return crud.create_testimonial(db, testimonial)

@router.put("/{testimonial_id}", response_model=schemas.TestimonialResponse)
async def update_testimonial(
    testimonial_id: int,
    testimonial: schemas.TestimonialCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    db_testimonial = crud.update_testimonial(db, testimonial_id, testimonial)
    if not db_testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return db_testimonial

@router.delete("/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    if not crud.delete_testimonial(db, testimonial_id):
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"success": True, "message": "Testimonial deleted successfully"}