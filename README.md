Stwórz pełną aplikację webową (backend + frontend) dla psychoterapeutów o nazwie "TherapyAssistance".

### Wymagania ogólne:
- Projekt ma umożliwiać psychoterapeutom zarządzanie pacjentami, wizytami i notatkami z sesji.
- Wersja MVP — ma działać lokalnie (dev) z możliwością łatwego wdrożenia (Docker-compose).
- Struktura katalogów: `backend/` i `frontend/`.

---

### 🧩 Backend:
**Stack:** FastAPI + PostgreSQL + SQLAlchemy + Alembic + Pydantic + Uvicorn.

**Wymagania funkcjonalne backendu:**
1. Uwierzytelnianie (JWT):
   - Endpointy: `/auth/register`, `/auth/login`.
   - Prosty model użytkownika: `id`, `email`, `hashed_password`, `created_at`.

2. Pacjenci:
   - Endpointy: `GET /patients`, `POST /patients`, `PUT /patients/{id}`, `DELETE /patients/{id}`.
   - Model: `Patient(id, name, phone, email, notes, created_at)`.

3. Wizyty:
   - Endpointy: `GET /appointments`, `POST /appointments`, `PUT /appointments/{id}`, `DELETE /appointments/{id}`.
   - Model: `Appointment(id, patient_id, date, start_time, end_time, notes)`.

4. Notatki terapeutyczne:
   - Endpoint: `POST /session_notes` i `GET /session_notes/{patient_id}`.
   - Model: `SessionNote(id, patient_id, content, created_at)`.

5. Obsługa CORS i dokumentacji Swagger (`/docs`).

6. Konfiguracja bazy PostgreSQL w `.env`:

DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/therapyassistance
JWT_SECRET=supersecret


7. Docker-compose z usługami:
- `backend` (FastAPI + Uvicorn)
- `db` (Postgres)
- `frontend` (React)

---

### 💻 Frontend:
**Stack:** React + TypeScript + Vite + TailwindCSS + React Router + Axios.

**Wymagania funkcjonalne frontendu:**
1. Ekrany:
- `/login` – logowanie terapeuty.
- `/dashboard` – panel główny po zalogowaniu.
- `/patients` – lista pacjentów (CRUD).
- `/appointments` – lista wizyt (CRUD).
- `/notes/{patient_id}` – notatki z sesji.

2. UI:
- Użyj TailwindCSS i komponentów `shadcn/ui` (jeśli dostępne).
- W dashboardzie umieść menu boczne z sekcjami: "Pacjenci", "Wizyty", "Notatki", "Wyloguj".
- Użyj `axios` do komunikacji z backendem.
- Utrzymuj stan JWT w localStorage.

3. UX:
- Po zalogowaniu, token JWT zapisuj i używaj przy zapytaniach (nagłówek Authorization).
- Prostą walidację formularzy (email, hasło, imię pacjenta itp.).
- Daty wybierane przez `react-datepicker` lub `shadcn/ui` DatePicker.
- Upewnij się że design jest responsywny i dostosowany do urządzeń mobilnych.

---

### 🧰 DevOps:
- Przygotuj `Dockerfile` dla backendu i frontendu.
- Stwórz `docker-compose.yml` uruchamiający 3 kontenery: backend, frontend, db.
- Porty:
- backend → `http://localhost:8000`
- frontend → `http://localhost:5173`
- db → `5432`
- W backendzie uruchamiaj `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`.

---

### ✅ Cele końcowe:
Po wykonaniu:
1. Aplikacja powinna uruchamiać się jednym poleceniem `docker compose up`.
2. Po wejściu na `http://localhost:5173` powinno być możliwe zalogowanie, dodanie pacjenta, utworzenie wizyty i dodanie notatki.
3. Kod ma być czytelny, modularny i zorganizowany (model–schema–router).

---

### ✨ Dodatkowe szczegóły:
- Wszystkie teksty i labelki w języku polskim.
- Zastosuj nowoczesne wzorce projektowe (repozytoria / services).
- Przygotuj przykładowe dane seedujące w `backend/seed.py` (np. 2 pacjentów, 2 wizyty, 1 użytkownik).
