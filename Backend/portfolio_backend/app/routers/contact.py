from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import schemas, crud, auth

router = APIRouter(prefix="/api/contact", tags=["Contact"])

@router.post("/", response_model=schemas.ContactMessageResponse)
async def send_contact_message(
    message: schemas.ContactMessageCreate,
    db: Session = Depends(get_db)
):
    return crud.create_contact_message(db, message)

@router.get("/messages", response_model=List[schemas.ContactMessageResponse])
async def get_contact_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    return crud.get_contact_messages(db, skip=skip, limit=limit, unread_only=unread_only)

@router.put("/messages/{message_id}/read")
async def mark_message_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_admin_user)
):
    if not crud.mark_message_read(db, message_id):
        raise HTTPException(status_code=404, detail="Message not found")
    return {"success": True, "message": "Message marked as read"}

@router.post("/newsletter/subscribe")
async def subscribe_newsletter(
    subscription: schemas.NewsletterSubscribe,
    db: Session = Depends(get_db)
):
    subscriber = crud.subscribe_newsletter(db, subscription.email, subscription.name)
    return {"success": True, "message": "Subscribed successfully", "data": {"email": subscriber.email}}

@router.post("/newsletter/unsubscribe")
async def unsubscribe_newsletter(
    email: str,
    db: Session = Depends(get_db)
):
    if not crud.unsubscribe_newsletter(db, email):
        raise HTTPException(status_code=404, detail="Email not found")
    return {"success": True, "message": "Unsubscribed successfully"}