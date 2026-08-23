from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="staff")
    created_at = Column(DateTime, server_default=func.now())

    sales = relationship("Sale", back_populates="user")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(30))
    email = Column(String(150))
    address = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    sales = relationship("Sale", back_populates="customer")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100))
    buying_price = Column(Numeric(12, 2), default=0)
    selling_price = Column(Numeric(12, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    low_stock_limit = Column(Integer, default=5)
    created_at = Column(DateTime, server_default=func.now())

    sale_items = relationship("SaleItem", back_populates="product")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="SET NULL")
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL")
    )
    total_amount = Column(Numeric(12, 2), default=0)
    sale_status = Column(String(20), default="pending")
    sale_date = Column(DateTime, server_default=func.now())

    customer = relationship("Customer", back_populates="sales")
    user = relationship("User", back_populates="sales")

    items = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan"
    )

    payments = relationship(
        "Payment",
        back_populates="sale",
        cascade="all, delete-orphan"
    )


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)

    sale_id = Column(
        Integer,
        ForeignKey("sales.id", ondelete="CASCADE"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False
    )

    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    sale_id = Column(
        Integer,
        ForeignKey("sales.id", ondelete="CASCADE"),
        nullable=False
    )

    amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(30), nullable=False)
    payment_status = Column(String(20), default="paid")
    payment_date = Column(DateTime, server_default=func.now())
    note = Column(String(255))

    sale = relationship("Sale", back_populates="payments")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(100))
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(Text)
    expense_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())