from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Payment, Sale
from ..schemas import PaymentCreate, PaymentResponse

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/", response_model=PaymentResponse)
def create_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db)
):

    sale = db.query(Sale).filter(
        Sale.id == data.sale_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    payment = Payment(**data.model_dump())

    db.add(payment)

    db.commit()
    db.refresh(payment)

    return payment


@router.get("/", response_model=list[PaymentResponse])
def get_payments(
    db: Session = Depends(get_db)
):

    return db.query(Payment).order_by(
        Payment.id.desc()
    ).all()