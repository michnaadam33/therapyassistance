#!/usr/bin/env python3
"""
Skrypt do dodawania przykładowych wizyt do bazy danych.
"""

import sys
import os
from datetime import date, time, timedelta, datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.core.database import Base


def add_sample_appointments():
    """Dodaje przykładowe wizyty do bazy danych"""

    # Create database engine
    engine = create_engine(settings.DATABASE_URL)

    with Session(engine) as session:
        # Get existing patients
        patients = session.query(Patient).all()

        if not patients:
            print("❌ Brak pacjentów w bazie danych. Najpierw uruchom seed.py")
            return

        print(f"✅ Znaleziono {len(patients)} pacjentów")

        # Clear existing appointments (optional - comment out if you want to keep them)
        existing_count = session.query(Appointment).count()
        if existing_count > 0:
            print(f"ℹ️  Znaleziono {existing_count} istniejących wizyt")

        # Generate appointments for the next 2 months
        today = date.today()
        appointments_to_add = []

        # Week 1 - Current week
        current_week_appointments = [
            {
                "patient_id": patients[0].id,
                "date": today,
                "start_time": time(10, 0),
                "end_time": time(11, 0),
                "notes": "Sesja regularna - omówienie postępów",
            },
            {
                "patient_id": patients[1 % len(patients)].id,
                "date": today,
                "start_time": time(14, 30),
                "end_time": time(15, 30),
                "notes": "Konsultacja początkowa",
            },
            {
                "patient_id": patients[0].id,
                "date": today + timedelta(days=2),
                "start_time": time(9, 0),
                "end_time": time(10, 0),
                "notes": "Terapia behawioralna",
            },
            {
                "patient_id": patients[1 % len(patients)].id,
                "date": today + timedelta(days=3),
                "start_time": time(16, 0),
                "end_time": time(17, 0),
                "notes": "Sesja follow-up",
            },
        ]

        # Week 2 - Next week
        next_week = today + timedelta(weeks=1)
        next_week_appointments = [
            {
                "patient_id": patients[0].id,
                "date": next_week,
                "start_time": time(11, 0),
                "end_time": time(12, 0),
                "notes": "Sesja terapeutyczna",
            },
            {
                "patient_id": patients[1 % len(patients)].id,
                "date": next_week + timedelta(days=1),
                "start_time": time(13, 0),
                "end_time": time(14, 0),
                "notes": "Omówienie planu terapii",
            },
            {
                "patient_id": patients[0].id,
                "date": next_week + timedelta(days=3),
                "start_time": time(10, 30),
                "end_time": time(11, 30),
                "notes": "Sesja CBT",
            },
            {
                "patient_id": patients[1 % len(patients)].id,
                "date": next_week + timedelta(days=4),
                "start_time": time(15, 0),
                "end_time": time(16, 0),
                "notes": "Konsultacja rodzinna",
            },
        ]

        # Week 3-4 - More sparse appointments
        future_appointments = []
        for week_offset in [2, 3, 4]:
            week_start = today + timedelta(weeks=week_offset)
            for day_offset in [0, 2, 4]:  # Monday, Wednesday, Friday
                appointment_date = week_start + timedelta(days=day_offset)
                patient = patients[(week_offset + day_offset) % len(patients)]

                # Morning appointment
                if day_offset == 0:
                    future_appointments.append(
                        {
                            "patient_id": patient.id,
                            "date": appointment_date,
                            "start_time": time(9, 30),
                            "end_time": time(10, 30),
                            "notes": f"Sesja regularna - tydzień {week_offset + 1}",
                        }
                    )
                # Afternoon appointment
                else:
                    hour = 14 + (day_offset // 2)
                    future_appointments.append(
                        {
                            "patient_id": patient.id,
                            "date": appointment_date,
                            "start_time": time(hour, 0),
                            "end_time": time(hour + 1, 0),
                            "notes": f"Wizyta kontrolna - tydzień {week_offset + 1}",
                        }
                    )

        # Month 2 - Monthly appointments
        month2_start = today + timedelta(days=30)
        monthly_appointments = [
            {
                "patient_id": patients[0].id,
                "date": month2_start,
                "start_time": time(10, 0),
                "end_time": time(11, 30),
                "notes": "Sesja miesięczna - podsumowanie",
            },
            {
                "patient_id": patients[1 % len(patients)].id,
                "date": month2_start + timedelta(days=7),
                "start_time": time(14, 0),
                "end_time": time(15, 0),
                "notes": "Ocena postępów terapii",
            },
            {
                "patient_id": patients[0].id,
                "date": month2_start + timedelta(days=14),
                "start_time": time(11, 0),
                "end_time": time(12, 0),
                "notes": "Planowanie dalszej terapii",
            },
            {
                "patient_id": patients[1 % len(patients)].id,
                "date": month2_start + timedelta(days=21),
                "start_time": time(16, 30),
                "end_time": time(17, 30),
                "notes": "Sesja zamykająca cykl",
            },
        ]

        # Combine all appointments
        appointments_to_add.extend(current_week_appointments)
        appointments_to_add.extend(next_week_appointments)
        appointments_to_add.extend(future_appointments)
        appointments_to_add.extend(monthly_appointments)

        # Add past appointments for history
        past_appointments = []
        for days_ago in [7, 14, 21, 28]:
            past_date = today - timedelta(days=days_ago)
            patient = patients[days_ago % len(patients)]
            past_appointments.append(
                {
                    "patient_id": patient.id,
                    "date": past_date,
                    "start_time": time(10 + (days_ago % 8), 0),
                    "end_time": time(11 + (days_ago % 8), 0),
                    "notes": f"Sesja archiwalna - {days_ago} dni temu",
                }
            )

        appointments_to_add.extend(past_appointments)

        # Create appointment objects
        created_count = 0
        skipped_count = 0

        for apt_data in appointments_to_add:
            # Check if appointment already exists (same patient, date, and time)
            existing = (
                session.query(Appointment)
                .filter(
                    Appointment.patient_id == apt_data["patient_id"],
                    Appointment.date == apt_data["date"],
                    Appointment.start_time == apt_data["start_time"],
                )
                .first()
            )

            if existing:
                skipped_count += 1
                continue

            appointment = Appointment(**apt_data)
            session.add(appointment)
            created_count += 1

        # Commit all changes
        session.commit()

        print(f"✅ Dodano {created_count} nowych wizyt")
        if skipped_count > 0:
            print(f"ℹ️  Pominięto {skipped_count} istniejących wizyt")

        # Display summary
        total_appointments = session.query(Appointment).count()
        today_appointments = (
            session.query(Appointment).filter(Appointment.date == today).count()
        )
        future_appointments_count = (
            session.query(Appointment).filter(Appointment.date > today).count()
        )
        past_appointments_count = (
            session.query(Appointment).filter(Appointment.date < today).count()
        )

        print("\n📊 Podsumowanie wizyt w bazie:")
        print(f"   - Wszystkie wizyty: {total_appointments}")
        print(f"   - Dzisiejsze wizyty: {today_appointments}")
        print(f"   - Przyszłe wizyty: {future_appointments_count}")
        print(f"   - Przeszłe wizyty: {past_appointments_count}")

        # Show next 5 upcoming appointments
        print("\n📅 Najbliższe 5 wizyt:")
        upcoming = (
            session.query(Appointment)
            .filter(Appointment.date >= today)
            .order_by(Appointment.date, Appointment.start_time)
            .limit(5)
            .all()
        )

        for apt in upcoming:
            patient = (
                session.query(Patient).filter(Patient.id == apt.patient_id).first()
            )
            print(
                f"   - {apt.date} {apt.start_time.strftime('%H:%M')} - {patient.name if patient else 'Nieznany pacjent'}"
            )


if __name__ == "__main__":
    print("🚀 Dodawanie przykładowych wizyt...")
    try:
        add_sample_appointments()
        print("\n✅ Zakończono pomyślnie!")
    except Exception as e:
        print(f"\n❌ Błąd: {e}")
        sys.exit(1)
