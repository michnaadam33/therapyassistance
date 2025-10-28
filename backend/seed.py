from datetime import datetime, date, time, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.session_note import SessionNote
from app.models.payment import Payment, PaymentMethod, payment_appointments


def seed_database():
    """
    Wypełnij bazę danych przykładowymi danymi
    """
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        db.execute(payment_appointments.delete())
        db.query(Payment).delete()
        db.query(SessionNote).delete()
        db.query(Appointment).delete()
        db.query(Patient).delete()
        db.query(User).delete()
        db.commit()

        print("🗑️  Wyczyszczono istniejące dane")

        # Create test user
        test_user = User(
            email="terapeuta@example.com",
            hashed_password=get_password_hash("haslo123"),
        )
        db.add(test_user)
        db.commit()
        print("✅ Utworzono użytkownika: terapeuta@example.com (hasło: haslo123)")

        # Create patients
        patient1 = Patient(
            name="Jan Kowalski",
            phone="+48 123 456 789",
            email="jan.kowalski@example.com",
            notes="Pacjent z objawami lękowymi, regularnie uczęszcza na sesje.",
        )

        patient2 = Patient(
            name="Anna Nowak",
            phone="+48 987 654 321",
            email="anna.nowak@example.com",
            notes="Terapia poznawczo-behawioralna, dobra współpraca.",
        )

        db.add(patient1)
        db.add(patient2)
        db.commit()
        db.refresh(patient1)
        db.refresh(patient2)
        print("✅ Utworzono 2 pacjentów")

        # Create appointments
        tomorrow = date.today() + timedelta(days=1)
        next_week = date.today() + timedelta(days=7)
        last_week = date.today() - timedelta(days=7)
        two_weeks_ago = date.today() - timedelta(days=14)

        # Past appointments (for payment history)
        appointment1 = Appointment(
            patient_id=patient1.id,
            date=two_weeks_ago,
            start_time=time(10, 0),
            end_time=time(11, 0),
            notes="Sesja #3 - omówienie strategii",
            is_paid=True,
            price=150.00,
        )

        appointment2 = Appointment(
            patient_id=patient1.id,
            date=last_week,
            start_time=time(10, 0),
            end_time=time(11, 0),
            notes="Sesja #4 - kontynuacja terapii",
            is_paid=True,
            price=150.00,
        )

        appointment3 = Appointment(
            patient_id=patient2.id,
            date=last_week,
            start_time=time(14, 0),
            end_time=time(15, 0),
            notes="Sesja #2 - CBT",
            is_paid=False,
            price=200.00,
        )

        # Future appointments
        appointment4 = Appointment(
            patient_id=patient1.id,
            date=tomorrow,
            start_time=time(10, 0),
            end_time=time(11, 0),
            notes="Sesja cotygodniowa - omówienie postępów",
            is_paid=False,
            price=150.00,
        )

        appointment5 = Appointment(
            patient_id=patient2.id,
            date=tomorrow,
            start_time=time(14, 0),
            end_time=time(15, 0),
            notes="Kontynuacja terapii CBT",
            is_paid=False,
            price=200.00,
        )

        appointment6 = Appointment(
            patient_id=patient1.id,
            date=next_week,
            start_time=time(10, 0),
            end_time=time(11, 0),
            notes="Kolejna sesja cotygodniowa",
            is_paid=False,
            price=150.00,
        )

        db.add(appointment1)
        db.add(appointment2)
        db.add(appointment3)
        db.add(appointment4)
        db.add(appointment5)
        db.add(appointment6)
        db.commit()
        db.refresh(appointment1)
        db.refresh(appointment2)
        db.refresh(appointment3)
        print("✅ Utworzono 6 wizyt (2 opłacone, 4 nieopłacone)")

        # Create session notes
        note1 = SessionNote(
            patient_id=patient1.id,
            content="""
            Sesja #5 - 2024-01-15

            Główne tematy:
            - Omówienie sytuacji stresowych z ostatniego tygodnia
            - Ćwiczenia oddechowe pokazują poprawę
            - Pacjent zgłasza lepszą jakość snu

            Plan na kolejną sesję:
            - Kontynuacja technik relaksacyjnych
            - Wprowadzenie dzienniczka emocji
            - Omówienie strategii radzenia sobie ze stresem w pracy
            """,
        )

        note2 = SessionNote(
            patient_id=patient2.id,
            content="""
            Sesja #3 - 2024-01-14

            Postępy:
            - Widoczna poprawa w identyfikowaniu negatywnych wzorców myślowych
            - Pacjentka regularnie wykonuje zadania domowe
            - Zmniejszenie częstotliwości ataków lęku

            Zadania domowe:
            - Kontynuacja prowadzenia dziennika myśli
            - Ćwiczenie techniki STOP
            - Codzienna 10-minutowa medytacja
            """,
        )

        note3 = SessionNote(
            patient_id=patient1.id,
            content="""
            Sesja #4 - 2024-01-08

            Obserwacje:
            - Pacjent przyszedł w dobrym nastroju
            - Zgłasza poprawę w relacjach rodzinnych
            - Nadal występują trudności z koncentracją w pracy

            Interwencje:
            - Techniki mindfulness na poprawę koncentracji
            - Planowanie dnia z uwzględnieniem przerw
            - Ćwiczenia asertywności
            """,
        )

        db.add(note1)
        db.add(note2)
        db.add(note3)
        db.commit()
        print("✅ Utworzono 3 notatki z sesji")

        # Create payments
        payment1 = Payment(
            patient_id=patient1.id,
            amount=Decimal("400.00"),
            payment_date=datetime.combine(two_weeks_ago, time(11, 30)),
            payment_method=PaymentMethod.CASH,
            description="Płatność za 2 wizyty - gotówka",
        )
        payment1.appointments = [appointment1, appointment2]

        payment2 = Payment(
            patient_id=patient2.id,
            amount=Decimal("200.00"),
            payment_date=datetime.combine(last_week, time(15, 15)),
            payment_method=PaymentMethod.TRANSFER,
            description="Płatność za wizytę - przelew bankowy",
        )
        # Uwaga: appointment3 został utworzony jako nieopłacony dla demonstracji

        db.add(payment1)
        db.add(payment2)
        db.commit()
        print("✅ Utworzono 2 płatności")

        print("\n🎉 Baza danych została wypełniona przykładowymi danymi!")
        print("\n📝 Dane logowania:")
        print("   Email: terapeuta@example.com")
        print("   Hasło: haslo123")
        print("\n💰 Płatności:")
        print(f"   - Jan Kowalski: 400 PLN (2 wizyty opłacone, 2 nieopłacone)")
        print(f"   - Anna Nowak: 0 PLN (1 wizyta nieopłacona)")

    except Exception as e:
        print(f"❌ Błąd podczas wypełniania bazy danych: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
