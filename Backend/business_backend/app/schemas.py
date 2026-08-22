from datetime import date
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict


# =========================
# USER
# =========================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "staff"


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


# =========================
# CUSTOMER
# =========================

class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class CustomerResponse(CustomerCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# PRODUCT
# =========================

class ProductCreate(BaseModel):
    name: str
    category: Optional[str] = None
    buying_price: Decimal = Decimal("0.00")
    selling_price: Decimal
    stock_quantity: int = 0
    low_stock_limit: int = 5


class ProductResponse(ProductCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# SALE
# =========================

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int


class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[SaleItemCreate]


class SaleResponse(BaseModel):
    id: int
    customer_id: Optional[int]
    user_id: Optional[int]
    total_amount: Decimal
    sale_status: str

    model_config = ConfigDict(from_attributes=True)


# =========================
# PAYMENT
# =========================

class PaymentCreate(BaseModel):
    sale_id: int
    amount: Decimal
    payment_method: str
    payment_status: str = "paid"
    note: Optional[str] = None


class PaymentResponse(PaymentCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# EXPENSE
# =========================

class ExpenseCreate(BaseModel):
    title: str
    category: Optional[str] = None
    amount: Decimal
    description: Optional[str] = None
    expense_date: date


class ExpenseResponse(ExpenseCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)