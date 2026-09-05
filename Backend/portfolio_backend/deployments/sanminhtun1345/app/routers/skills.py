from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app import schemas, crud, auth, models

router = APIRouter(prefix="/api/skills", tags=["Skills"])

@router.get("/", response_model=List[schemas.SkillResponse])
async def get_skills(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return crud.get_skills(db, skip=skip, limit=limit, category=category)

@router.get("/categories")
async def get_skill_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Skill.category).distinct().all()
    return {"categories": [c[0] for c in categories]}

@router.get("/{skill_id}", response_model=schemas.SkillResponse)
async def get_skill(
    skill_id: int,
    db: Session = Depends(get_db)
):
    skill = crud.get_skill(db, skill_id)

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    return skill

@router.post("/", response_model=schemas.SkillResponse)
async def create_skill(
    skill: schemas.SkillCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    return crud.create_skill(db, skill)

@router.put("/{skill_id}", response_model=schemas.SkillResponse)
async def update_skill(
    skill_id: int,
    skill: schemas.SkillCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    db_skill = crud.update_skill(db, skill_id, skill)
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return db_skill

@router.delete("/{skill_id}")
async def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    if not crud.delete_skill(db, skill_id):
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"success": True, "message": "Skill deleted successfully"}