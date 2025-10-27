# TherapyAssistance

Pełna aplikacja webowa (backend + frontend) dla psychoterapeutów.

## 📋 Opis projektu

Aplikacja **TherapyAssistance** umożliwia psychoterapeutom kompleksowe zarządzanie:
- **Pacjentami** – dane kontaktowe, notatki
- **Wizytami** – kalendarz, planowanie sesji
- **Notatkami terapeutycznymi** – dokumentacja przebiegu terapii
- **Płatnościami** – rozliczenia za wizyty, historia płatności

### Struktura projektu:
```
therapyassistance/
├── backend/          # FastAPI + PostgreSQL
├── frontend/         # React + TypeScript + Vite
└── docker-compose.yml
```

---

## 🚀 Szybki start

### Uruchomienie całej aplikacji:
```bash
docker compose up
```

Aplikacja będzie dostępna:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Database: localhost:5432

---

## 🧩 Backend

**Stack:** FastAPI + PostgreSQL + SQLAlchemy + Alembic + Pydantic + Uvicorn

### Funkcjonalności:

#### 1. Uwierzytelnianie (JWT)
- **Endpointy:** `/auth/register`, `/auth/login`
- **Model:** `User(id, email, hashed_password, created_at)`

#### 2. Pacjenci
- **Endpointy:** `GET /patients`, `POST /patients`, `PUT /patients/{id}`, `DELETE /patients/{id}`
- **Model:** `Patient(id, name, phone, email, notes, created_at)`

#### 3. Wizyty
- **Endpointy:** `GET /appointments`, `POST /appointments`, `PUT /appointments/{id}`, `DELETE /appointments/{id}`
- **Model:** `Appointment(id, patient_id, date, start_time, end_time, notes, is_paid)`

#### 4. Notatki terapeutyczne
- **Endpointy:** `POST /session_notes`, `GET /session_notes/{patient_id}`
- **Model:** `SessionNote(id, patient_id, content, created_at)`

#### 5. Płatności 💰
- **Endpointy:** 
  - `POST /payments/` - rejestracja płatności
  - `GET /payments/` - lista płatności (z filtrami)
  - `GET /payments/{id}` - szczegóły płatności
  - `PATCH /payments/{id}` - aktualizacja płatności
  - `DELETE /payments/{id}` - usunięcie płatności
  - `GET /payments/patient/{patient_id}/unpaid-appointments` - nieopłacone wizyty
  - `GET /payments/statistics/summary` - statystyki płatności
- **Model:** `Payment(id, patient_id, amount, payment_date, payment_method, description)`
- **Funkcjonalności:**
  - Płatność za jedną lub wiele wizyt jednocześnie
  - Automatyczne oznaczanie wizyt jako opłaconych
  - Metody płatności: gotówka, przelew
  - Pełna historia płatności
  - Statystyki i raporty

#### 6. Obsługa CORS i dokumentacji
- Swagger UI dostępny pod `/docs`
- ReDoc dostępny pod `/redoc`

### Konfiguracja (.env)
```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/therapyassistance
JWT_SECRET=supersecret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

### Migracje bazy danych
```bash
cd backend
alembic upgrade head
```

### Seed danych testowych
```bash
cd backend
python seed.py
```

---

## 💻 Frontend

**Stack:** React + TypeScript + Vite + TailwindCSS + React Router + Axios

### Funkcjonalności:

#### Strony aplikacji:
- `/login` – Logowanie terapeuty
- `/dashboard` – Panel główny z podsumowaniem
- `/patients` – Lista pacjentów (CRUD)
- `/patients/{id}` – Szczegóły pacjenta z historią płatności
- `/appointments` – Kalendarz wizyt (CRUD)
- `/notes/{patient_id}` – Notatki z sesji terapeutycznych
- `/payments` – Lista płatności z filtrami i statystykami
- `/payments/new` – Formularz dodawania płatności
- `/payments/{id}` – Szczegóły płatności

#### UI/UX:
- **TailwindCSS** + komponenty `shadcn/ui`
- Menu boczne z sekcjami: Dashboard, Pacjenci, Wizyty, Płatności, Notatki
- Responsywny design (desktop + mobile)
- Dark mode ready
- Komunikacja przez `axios` z interceptorami
- JWT w localStorage z automatycznym refreshem
- Walidacja formularzy
- Toasty z powiadomieniami (react-toastify)
- Loading states i error handling

#### Moduł płatności:
- ✅ Lista płatności z filtrowaniem i paginacją
- ✅ Statystyki (gotówka, przelewy, sumy)
- ✅ Formularz z wyborem wielu wizyt
- ✅ Automatyczne obliczanie kwoty
- ✅ Wskaźnik statusu płatności w kalendarzu wizyt
- ✅ Historia płatności w profilu pacjenta

---

## 🧰 DevOps & Docker

### Docker Compose
Aplikacja składa się z 3 kontenerów:
- **backend** – FastAPI + Uvicorn (port 8000)
- **frontend** – React + Vite (port 5173)
- **db** – PostgreSQL 15 (port 5432)

### Komendy:
```bash
# Uruchomienie
docker compose up

# Uruchomienie w tle
docker compose up -d

# Rebuild po zmianach
docker compose up --build

# Zatrzymanie
docker compose down

# Zatrzymanie z usunięciem volumes
docker compose down -v
```

---

## 📚 Dokumentacja modułu płatności

Szczegółowa dokumentacja modułu płatności znajduje się w pliku [PAYMENTS_MODULE.md](./PAYMENTS_MODULE.md)

### Podstawowe informacje:

#### Backend
- Model `Payment` z relacją many-to-many do `Appointment`
- Pole `is_paid` w modelu `Appointment`
- Automatyczne oznaczanie wizyt jako opłaconych
- Endpointy z filtrowaniem i statystykami

#### Frontend
- Strona z listą płatności
- Formularz z wyborem wielu wizyt
- Wskaźniki statusu w kalendarzu
- Integracja z profilem pacjenta

---

## 🗂️ Struktura kodu

### Backend
```
backend/
├── app/
│   ├── models/          # Modele SQLAlchemy
│   │   ├── user.py
│   │   ├── patient.py
│   │   ├── appointment.py
│   │   ├── session_note.py
│   │   └── payment.py
│   ├── schemas/         # Schematy Pydantic
│   │   └── ...
│   ├── routers/         # Endpointy API
│   │   ├── auth.py
│   │   ├── patients.py
│   │   ├── appointments.py
│   │   ├── session_notes.py
│   │   └── payments.py
│   ├── core/            # Konfiguracja, baza danych
│   └── main.py          # Aplikacja FastAPI
├── alembic/             # Migracje bazy danych
└── seed.py              # Dane testowe
```

### Frontend
```
frontend/
├── src/
│   ├── pages/           # Strony aplikacji
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   ├── Appointments.tsx
│   │   ├── Payments.tsx
│   │   ├── PaymentForm.tsx
│   │   └── PaymentDetail.tsx
│   ├── components/      # Komponenty UI
│   ├── services/        # API calls (axios)
│   ├── types/           # TypeScript types
│   ├── contexts/        # React contexts
│   └── App.tsx
```

---

## 🎯 Funkcje MVP

✅ **Zrealizowane:**
- [x] Uwierzytelnianie JWT
- [x] Zarządzanie pacjentami (CRUD)
- [x] Kalendarz wizyt (CRUD)
- [x] Notatki terapeutyczne
- [x] System płatności
- [x] Historia płatności pacjentów
- [x] Statystyki finansowe
- [x] Responsywny design
- [x] Docker compose setup
- [x] Dokumentacja API (Swagger)

---

## 🔧 Development

### Backend (lokalnie)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# lub venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (lokalnie)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testowanie

### Dane testowe
Po uruchomieniu `seed.py`:
- **Użytkownik:** `test@example.com` / `testpassword`
- **2 pacjentów** z przykładowymi danymi
- **4 wizyty** (2 opłacone, 2 nieopłacone)
- **2 płatności**

### API Testing
```bash
# Swagger UI
http://localhost:8000/docs

# ReDoc
http://localhost:8000/redoc
```

---

## 🌟 Najważniejsze funkcje

### 1. Moduł płatności
- Rejestracja płatności za jedną lub wiele wizyt
- Płatność z góry (przed wizytą) lub z dołu (po wizycie)
- Automatyczne oznaczanie wizyt jako opłaconych
- Historia płatności dla każdego pacjenta
- Statystyki finansowe (gotówka vs przelewy)
- Filtry i wyszukiwanie

### 2. Kalendarz wizyt
- Widok miesiąca/tygodnia/dnia
- Wskaźniki statusu płatności
- Drag & drop (możliwe rozszerzenie)
- Sprawdzanie konfliktów terminów

### 3. Profile pacjentów
- Szczegółowe dane kontaktowe
- Historia wizyt
- Historia płatności
- Statystyki opłaconych/nieopłaconych wizyt
- Notatki terapeutyczne

---

## 📝 Licencja

Projekt edukacyjny/wewnętrzny.

---

## 🤝 Współpraca

1. Fork projektu
2. Stwórz branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

---

## 📞 Kontakt

W razie pytań zobacz dokumentację w plikach:
- `PAYMENTS_MODULE.md` - szczegóły modułu płatności
- `.rules` - reguły projektu
