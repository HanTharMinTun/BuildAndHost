from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import schemas, crud, auth

router = APIRouter(
    prefix="/api/education",
    tags=["Education"]
)


@router.get("/", response_model=List[schemas.EducationResponse])
async def get_education(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return crud.get_education_list(
        db,
        skip=skip,
        limit=limit
    )


@router.get("/{education_id}", response_model=schemas.EducationResponse)
async def get_education_item(
    education_id: int,
    db: Session = Depends(get_db)
):
    education = crud.get_education(db, education_id)

    if not education:
        raise HTTPException(
            status_code=404,
            detail="Education not found"
        )

    return education


@router.post("/", response_model=schemas.EducationResponse)
async def create_education(
    education: schemas.EducationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_admin_user)
):
    return crud.create_education(db, education)


@router.put("/{education_id}", response_model=schemas.EducationResponse)
async def update_education(
    education_id: int,
    education: schemas.EducationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_admin_user)
):
    db_education = crud.update_education(
        db,
        education_id,
        education
    )

    if not db_education:
        raise HTTPException(
            status_code=404,
            detail="Education not found"
        )

    return db_education


@router.delete("/{education_id}")
async def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_admin_user)
):
    if not crud.delete_education(db, education_id):
        raise HTTPException(
            status_code=404,
            detail="Education not found"
        )

    return {
        "success": True,
        "message": "Education deleted successfully"
    }