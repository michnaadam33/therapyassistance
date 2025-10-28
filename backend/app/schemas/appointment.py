from pydantic import BaseModel, validator
from datetime import datetime, date, time
from typing import Optional
from decimal import Decimal


class AppointmentBase(BaseModel):
    patient_id: int
    date: date
    start_time: time
    end_time: time
    notes: Optional[str] = None
    is_paid: bool = False
    price: Optional[Decimal] = None


class AppointmentCreate(AppointmentBase):
    price: Decimal  # Wymagane przy tworzeniu

    @validator("price")
    def validate_price(cls, v):
        if v is None:
            raise ValueError("Cena wizyty jest wymagana")
        if v <= 0:
            raise ValueError("Cena wizyty musi być większa niż 0")
        return v


class AppointmentUpdate(BaseModel):
    patient_id: Optional[int] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    notes: Optional[str] = None
    is_paid: Optional[bool] = None
    price: Optional[Decimal] = None


class Appointment(AppointmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
