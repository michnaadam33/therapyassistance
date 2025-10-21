from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.session_note import SessionNote


def seed_database():
    """
    Wypełnij bazę danych przykładowymi danymi
    """
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
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

        appointment1 = Appointment(
            patient_id=patient1.id,
            date=tomorrow,
            start_time=time(10, 0),
            end_time=time(11, 0),
            notes="Sesja cotygodniowa - omówienie postępów",
        )

        appointment2 = Appointment(
            patient_id=patient2.id,
            date=tomorrow,
            start_time=time(14, 0),
            end_time=time(15, 0),
            notes="Kontynuacja terapii CBT",
        )

        appointment3 = Appointment(
            patient_id=patient1.id,
            date=next_week,
            start_time=time(10, 0),
            end_time=time(11, 0),
            notes="Kolejna sesja cotygodniowa",
        )

        db.add(appointment1)
        db.add(appointment2)
        db.add(appointment3)
        db.commit()
        print("✅ Utworzono 3 wizyty")

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

        print("\n🎉 Baza danych została wypełniona przykładowymi danymi!")
        print("\n📝 Dane logowania:")
        print("   Email: terapeuta@example.com")
        print("   Hasło: haslo123")

    except Exception as e:
        print(f"❌ Błąd podczas wypełniania bazy danych: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
