from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import (
    auth,
    customers,
    products,
    sales,
    payments,
    expenses
)

app = FastAPI(
    title="Small Business Management API",
    description="Backend API for small business management",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(payments.router)
app.include_router(expenses.router)


@app.get("/")
def root():

    return {
        "message": "Small Business API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "ok"
    }