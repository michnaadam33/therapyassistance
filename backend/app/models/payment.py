from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum,
    Table,
    Numeric,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class PaymentMethod(enum.Enum):
    CASH = "CASH"
    TRANSFER = "TRANSFER"


# Association table for many-to-many relationship between Payment and Appointment
payment_appointments = Table(
    "payment_appointments",
    Base.metadata,
    Column("payment_id", Integer, ForeignKey("payments.id"), primary_key=True),
    Column("appointment_id", Integer, ForeignKey("appointments.id"), primary_key=True),
)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_date = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="payments")
    appointments = relationship(
        "Appointment",
        secondary=payment_appointments,
        back_populates="payments",
        lazy="joined",
    )
