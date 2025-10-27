from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.payment import Payment, PaymentMethod
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User
from app.schemas.payment import (
    Payment as PaymentSchema,
    PaymentCreate,
    PaymentUpdate,
    PaymentWithPatient,
    PaymentListResponse,
)

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/", response_model=PaymentSchema)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Rejestracja nowej płatności za jedną lub wiele wizyt
    """
    # Sprawdź czy pacjent istnieje
    patient = db.query(Patient).filter(Patient.id == payment_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pacjent nie został znaleziony",
        )

    # Pobierz wszystkie wizyty do opłacenia
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.id.in_(payment_data.appointment_ids),
            Appointment.patient_id == payment_data.patient_id,
        )
        .all()
    )

    if len(appointments) != len(payment_data.appointment_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Niektóre wizyty nie istnieją lub nie należą do tego pacjenta",
        )

    # Sprawdź czy niektóre wizyty nie są już opłacone
    already_paid = [app for app in appointments if app.is_paid]
    if already_paid:
        paid_ids = [app.id for app in already_paid]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Wizyty o ID {paid_ids} są już opłacone",
        )

    # Utwórz płatność
    payment_dict = payment_data.dict(exclude={"appointment_ids"})
    if payment_data.payment_date:
        payment_dict["payment_date"] = payment_data.payment_date

    db_payment = Payment(**payment_dict)
    db_payment.appointments = appointments

    # Oznacz wizyty jako opłacone
    for appointment in appointments:
        appointment.is_paid = True

    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)

    return db_payment


@router.get("/", response_model=PaymentListResponse)
def get_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    patient_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    payment_method: Optional[PaymentMethod] = None,
):
    """
    Pobierz listę płatności z możliwością filtrowania
    """
    query = db.query(Payment).options(
        joinedload(Payment.patient),
        joinedload(Payment.appointments),
    )

    # Filtry
    if patient_id:
        query = query.filter(Payment.patient_id == patient_id)
    if date_from:
        query = query.filter(
            Payment.payment_date >= datetime.combine(date_from, datetime.min.time())
        )
    if date_to:
        query = query.filter(
            Payment.payment_date <= datetime.combine(date_to, datetime.max.time())
        )
    if payment_method:
        query = query.filter(Payment.payment_method == payment_method)

    # Sortowanie - najnowsze najpierw
    query = query.order_by(Payment.payment_date.desc())

    # Liczba wszystkich wyników
    total = query.count()

    # Paginacja
    payments = query.offset(skip).limit(limit).all()

    # Przygotuj odpowiedź z dodatkowymi danymi pacjenta
    payments_with_patient = []
    for payment in payments:
        payment_dict = {
            "id": payment.id,
            "patient_id": payment.patient_id,
            "amount": payment.amount,
            "payment_date": payment.payment_date,
            "payment_method": payment.payment_method,
            "description": payment.description,
            "created_at": payment.created_at,
            "updated_at": payment.updated_at,
            "appointments": payment.appointments,
            "patient_name": payment.patient.name,
            "patient_email": payment.patient.email,
            "patient_phone": payment.patient.phone,
        }
        payments_with_patient.append(PaymentWithPatient(**payment_dict))

    return PaymentListResponse(total=total, payments=payments_with_patient)


@router.get("/{payment_id}", response_model=PaymentWithPatient)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Pobierz szczegóły konkretnej płatności
    """
    payment = (
        db.query(Payment)
        .options(
            joinedload(Payment.patient),
            joinedload(Payment.appointments),
        )
        .filter(Payment.id == payment_id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Płatność nie została znaleziona",
        )

    payment_dict = {
        "id": payment.id,
        "patient_id": payment.patient_id,
        "amount": payment.amount,
        "payment_date": payment.payment_date,
        "payment_method": payment.payment_method,
        "description": payment.description,
        "created_at": payment.created_at,
        "updated_at": payment.updated_at,
        "appointments": payment.appointments,
        "patient_name": payment.patient.name,
        "patient_email": payment.patient.email,
        "patient_phone": payment.patient.phone,
    }

    return PaymentWithPatient(**payment_dict)


@router.patch("/{payment_id}", response_model=PaymentSchema)
def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Aktualizacja szczegółów płatności
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Płatność nie została znaleziona",
        )

    # Aktualizuj tylko podane pola
    update_data = payment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment, field, value)

    payment.updated_at = datetime.now()

    db.commit()
    db.refresh(payment)

    return payment


@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Usuń płatność (wizyty pozostaną nieopłacone)
    """
    payment = (
        db.query(Payment)
        .options(joinedload(Payment.appointments))
        .filter(Payment.id == payment_id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Płatność nie została znaleziona",
        )

    # Oznacz powiązane wizyty jako nieopłacone
    for appointment in payment.appointments:
        appointment.is_paid = False

    db.delete(payment)
    db.commit()

    return {"detail": "Płatność została usunięta, wizyty oznaczone jako nieopłacone"}


@router.get("/patient/{patient_id}/unpaid-appointments", response_model=List[int])
def get_unpaid_appointments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Pobierz listę ID nieopłaconych wizyt dla pacjenta
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pacjent nie został znaleziony",
        )

    unpaid_appointments = (
        db.query(Appointment.id)
        .filter(
            Appointment.patient_id == patient_id,
            Appointment.is_paid == False,
        )
        .order_by(Appointment.date, Appointment.start_time)
        .all()
    )

    return [app_id[0] for app_id in unpaid_appointments]


@router.get("/statistics/summary")
def get_payment_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    """
    Pobierz statystyki płatności
    """
    query = db.query(Payment)

    if date_from:
        query = query.filter(
            Payment.payment_date >= datetime.combine(date_from, datetime.min.time())
        )
    if date_to:
        query = query.filter(
            Payment.payment_date <= datetime.combine(date_to, datetime.max.time())
        )

    payments = query.all()

    total_amount = sum(payment.amount for payment in payments)
    cash_amount = sum(
        payment.amount
        for payment in payments
        if payment.payment_method == PaymentMethod.CASH
    )
    transfer_amount = sum(
        payment.amount
        for payment in payments
        if payment.payment_method == PaymentMethod.TRANSFER
    )

    return {
        "total_payments": len(payments),
        "total_amount": float(total_amount),
        "cash_amount": float(cash_amount),
        "transfer_amount": float(transfer_amount),
        "cash_count": len(
            [p for p in payments if p.payment_method == PaymentMethod.CASH]
        ),
        "transfer_count": len(
            [p for p in payments if p.payment_method == PaymentMethod.TRANSFER]
        ),
    }
