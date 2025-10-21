from pydantic import BaseModel
from datetime import datetime, date, time
from typing import Optional


class AppointmentBase(BaseModel):
    patient_id: int
    date: date
    start_time: time
    end_time: time
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    patient_id: Optional[int] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    notes: Optional[str] = None


class Appointment(AppointmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
