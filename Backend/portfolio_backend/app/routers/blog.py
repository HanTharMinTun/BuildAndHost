from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import schemas, crud, auth

router = APIRouter(prefix="/api/blog", tags=["Blog"])

@router.get("/posts", response_model=List[schemas.BlogPostResponse])
async def get_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    posts = crud.get_blog_posts(db, skip=skip, limit=limit, published_only=published_only)
    # Add comment count
    for post in posts:
        post.comment_count = len(post.comments) if post.comments else 0
    return posts

@router.get("/posts/{post_id}", response_model=schemas.BlogPostResponse)
async def get_blog_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    post = crud.get_blog_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    post.comment_count = len(post.comments) if post.comments else 0
    return post

@router.get("/posts/slug/{slug}", response_model=schemas.BlogPostResponse)
async def get_blog_post_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    post = crud.get_blog_post_by_slug(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    # Increment view count
    crud.increment_blog_view(db, post.post_id)
    post.comment_count = len(post.comments) if post.comments else 0
    return post

@router.post("/posts", response_model=schemas.BlogPostResponse)
async def create_blog_post(
    post: schemas.BlogPostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    return crud.create_blog_post(db, post, current_user.user_id)

@router.put("/posts/{post_id}", response_model=schemas.BlogPostResponse)
async def update_blog_post(
    post_id: int,
    post: schemas.BlogPostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    db_post = crud.update_blog_post(db, post_id, post)
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_post

@router.delete("/posts/{post_id}")
async def delete_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    if not crud.delete_blog_post(db, post_id):
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"success": True, "message": "Blog post deleted successfully"}

@router.post("/posts/{post_id}/comments", response_model=schemas.BlogCommentResponse)
async def create_comment(
    post_id: int,
    comment: schemas.BlogCommentCreate,
    db: Session = Depends(get_db)
):
    post = crud.get_blog_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db_comment = models.BlogComment(**comment.dict(), post_id=post_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/posts/{post_id}/comments", response_model=List[schemas.BlogCommentResponse])
async def get_comments(
    post_id: int,
    db: Session = Depends(get_db)
):
    post = crud.get_blog_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post.comments