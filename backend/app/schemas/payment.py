from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from enum import Enum


class PaymentMethodEnum(str, Enum):
    CASH = "CASH"
    TRANSFER = "TRANSFER"


class AppointmentInPayment(BaseModel):
    id: int
    patient_id: int
    date: datetime
    start_time: datetime
    end_time: datetime
    is_paid: bool

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    patient_id: int
    amount: Decimal = Field(..., ge=0, decimal_places=2)
    payment_method: PaymentMethodEnum
    description: Optional[str] = None


class PaymentCreate(PaymentBase):
    appointment_ids: List[int] = Field(..., min_items=1)
    payment_date: Optional[datetime] = None


class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    payment_method: Optional[PaymentMethodEnum] = None
    description: Optional[str] = None
    payment_date: Optional[datetime] = None


class Payment(PaymentBase):
    id: int
    payment_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    appointments: List[AppointmentInPayment] = []

    class Config:
        from_attributes = True


class PaymentWithPatient(Payment):
    patient_name: str
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    total: int
    payments: List[PaymentWithPatient]
