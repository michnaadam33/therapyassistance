from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class PatientBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    name: Optional[str] = None


class Patient(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
