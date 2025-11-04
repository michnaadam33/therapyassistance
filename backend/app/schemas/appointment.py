from pydantic import BaseModel, field_validator, ConfigDict
from datetime import datetime, date, time
from typing import Optional, Any
from decimal import Decimal


class AppointmentBase(BaseModel):
    patient_id: int
    date: date
    start_time: time
    end_time: time
    session_note_id: Optional[int] = None
    is_paid: bool = False
    price: Optional[Decimal] = None


class AppointmentCreate(AppointmentBase):
    price: Decimal  # Wymagane przy tworzeniu

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        if v is None:
            raise ValueError("Cena wizyty jest wymagana")
        if v <= 0:
            raise ValueError("Cena wizyty musi być większa niż 0")
        return v


class AppointmentUpdate(BaseModel):
    """Schema for partial appointment updates - all fields are optional"""

    model_config = ConfigDict(from_attributes=True)

    patient_id: Optional[int] = None
    date: Optional[str] = None  # Accept string for date
    start_time: Optional[str] = None  # Accept string for time
    end_time: Optional[str] = None  # Accept string for time
    session_note_id: Optional[int] = None
    is_paid: Optional[bool] = None
    price: Optional[Decimal] = None


class Appointment(AppointmentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
