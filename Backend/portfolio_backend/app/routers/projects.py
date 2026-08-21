from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app import schemas, crud, auth

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("/", response_model=List[schemas.ProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    projects = crud.get_projects(db, skip=skip, limit=limit, featured=featured)
    # Get skills for each project
    for project in projects:
        project.skill_names = [ps.skill.name for ps in project.project_skills]
    return projects

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = crud.get_project(db, project_id)
    if not project or not project.is_active:
        raise HTTPException(status_code=404, detail="Project not found")
    project.skill_names = [ps.skill.name for ps in project.project_skills]
    return project

@router.get("/slug/{slug}", response_model=schemas.ProjectResponse)
async def get_project_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    project = crud.get_project_by_slug(db, slug)
    if not project or not project.is_active:
        raise HTTPException(status_code=404, detail="Project not found")
    project.skill_names = [ps.skill.name for ps in project.project_skills]
    return project

@router.post("/", response_model=schemas.ProjectResponse)
async def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    return crud.create_project(db, project)

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
async def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    db_project = crud.update_project(db, project_id, project)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    if not crud.delete_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "message": "Project deleted successfully"}