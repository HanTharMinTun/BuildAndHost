from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Sale, SaleItem, Product
from ..schemas import SaleCreate, SaleResponse

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


@router.post("/", response_model=SaleResponse)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db)
):

    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Sale must contain at least one item"
        )

    sale = Sale(
        customer_id=data.customer_id,
        total_amount=Decimal("0.00"),
        sale_status="pending"
    )

    db.add(sale)
    db.flush()

    total = Decimal("0.00")

    for item in data.items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than zero"
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {product.name}"
            )

        subtotal = (
            product.selling_price *
            item.quantity
        )

        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.selling_price,
            subtotal=subtotal
        )

        db.add(sale_item)

        product.stock_quantity -= item.quantity

        total += subtotal

    sale.total_amount = total

    db.commit()
    db.refresh(sale)

    return sale


@router.get("/", response_model=list[SaleResponse])
def get_sales(
    db: Session = Depends(get_db)
):

    return db.query(Sale).order_by(
        Sale.id.desc()
    ).all()


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):

    sale = db.query(Sale).filter(
        Sale.id == sale_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    return sale