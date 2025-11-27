from datetime import date, datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User
from app.schemas.appointment import (
    Appointment as AppointmentSchema,
)
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=List[AppointmentSchema])
def get_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    date_from: date = None,
    date_to: date = None,
) -> Any:
    """
    Pobierz listę wszystkich wizyt
    """
    query = db.query(Appointment)

    if date_from:
        query = query.filter(Appointment.date >= date_from)
    if date_to:
        query = query.filter(Appointment.date <= date_to)

    appointments = query.offset(skip).limit(limit).all()
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentSchema)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Pobierz dane konkretnej wizyty
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wizyta nie została znaleziona",
        )
    return appointment


@router.post("", response_model=AppointmentSchema)
def create_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Utwórz nową wizytę
    """
    # Check if patient exists
    patient = (
        db.query(Patient).filter(Patient.id == appointment_data.patient_id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pacjent nie został znaleziony",
        )

    # Check for overlapping appointments
    overlapping = (
        db.query(Appointment)
        .filter(
            Appointment.date == appointment_data.date,
            Appointment.start_time < appointment_data.end_time,
            Appointment.end_time > appointment_data.start_time,
        )
        .first()
    )

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wizyta koliduje z inną wizytą w tym terminie",
        )

    db_appointment = Appointment(**appointment_data.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


@router.put("/{appointment_id}", response_model=AppointmentSchema)
def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Zaktualizuj dane wizyty
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wizyta nie została znaleziona",
        )

    # Update only provided fields
    update_data = appointment_data.model_dump(exclude_unset=True)

    # Convert string date/time to proper types
    if "date" in update_data and isinstance(update_data["date"], str):
        update_data["date"] = datetime.strptime(update_data["date"], "%Y-%m-%d").date()

    if "start_time" in update_data and isinstance(update_data["start_time"], str):
        time_str = update_data["start_time"]
        if len(time_str.split(":")) == 2:
            time_str = f"{time_str}:00"
        update_data["start_time"] = datetime.strptime(time_str, "%H:%M:%S").time()

    if "end_time" in update_data and isinstance(update_data["end_time"], str):
        time_str = update_data["end_time"]
        if len(time_str.split(":")) == 2:
            time_str = f"{time_str}:00"
        update_data["end_time"] = datetime.strptime(time_str, "%H:%M:%S").time()

    # If patient_id is being updated, check if patient exists
    if "patient_id" in update_data:
        patient = (
            db.query(Patient).filter(Patient.id == update_data["patient_id"]).first()
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pacjent nie został znaleziony",
            )

    # Check for overlapping appointments if date/time is being updated
    if any(field in update_data for field in ["date", "start_time", "end_time"]):
        check_date = update_data.get("date", appointment.date)
        check_start = update_data.get("start_time", appointment.start_time)
        check_end = update_data.get("end_time", appointment.end_time)

        overlapping = (
            db.query(Appointment)
            .filter(
                Appointment.id != appointment_id,
                Appointment.date == check_date,
                Appointment.start_time < check_end,
                Appointment.end_time > check_start,
            )
            .first()
        )

        if overlapping:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wizyta koliduje z inną wizytą w tym terminie",
            )

    for field, value in update_data.items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Usuń wizytę
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wizyta nie została znaleziona",
        )

    db.delete(appointment)
    db.commit()
    return {"detail": "Wizyta została usunięta"}
