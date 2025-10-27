# 🚀 TherapyAssistance - Moduł Płatności - Quick Start

## ✨ Co zostało zaimplementowane?

Pełny moduł płatności dla aplikacji psychoterapeutycznej, który umożliwia:

### Backend (FastAPI + PostgreSQL)
✅ **Model Payment** z relacją many-to-many do wizyt
✅ **Pole is_paid** w modelu Appointment
✅ **7 endpointów API** dla zarządzania płatnościami
✅ **Migracja Alembic** - automatyczne tworzenie tabel
✅ **Seed data** - przykładowe płatności i wizyty

### Frontend (React + TypeScript)
✅ **Strona listy płatności** z filtrami i statystykami
✅ **Formularz płatności** - wielokrotny wybór wizyt
✅ **Szczegóły płatności** z pełną historią
✅ **Integracja z kalendarzem** - wskaźniki opłaconych wizyt
✅ **Panel pacjenta** - historia płatności i statystyki

---

## 🎯 Szybkie uruchomienie (3 minuty)

### 1. Uruchom aplikację Docker
```bash
cd therapyassistance
docker compose up
```

### 2. Wypełnij bazę danymi (nowe okno terminala)
```bash
docker compose exec backend python seed.py
```

### 3. Otwórz aplikację
```
http://localhost:5173
```

**Dane logowania:**
- Email: `terapeuta@example.com`
- Hasło: `haslo123`

---

## 📋 Co możesz przetestować?

### 1. Lista płatności
- Przejdź do **Płatności** w menu
- Zobacz statystyki (gotówka, przelewy, suma)
- Użyj filtrów (pacjent, daty, metoda)
- Zobacz historię wszystkich płatności

### 2. Dodaj nową płatność
- Kliknij **"Dodaj płatność"**
- Wybierz pacjenta (Jan Kowalski lub Anna Nowak)
- Zaznacz wizyty do opłacenia (checkboxes)
- Wybierz metodę: Gotówka / Przelew
- Kwota oblicza się automatycznie (200 PLN/wizyta)
- Zapisz

### 3. Kalendarz z statusami
- Przejdź do **Wizyty**
- Zobacz **zielone wizyty** = opłacone ✓
- Zobacz **niebieskie wizyty** = nieopłacone
- Ikony CheckCircle/XCircle

### 4. Profil pacjenta
- Przejdź do **Pacjenci** → Wybierz pacjenta
- Zobacz **statystyki płatności**:
  - Łączne płatności
  - Wizyty opłacone/nieopłacone
- Zobacz **historię płatności**
- Kliknij na płatność → szczegóły

### 5. Szczegóły płatności
- Zobacz pełne informacje o płatności
- Lista opłaconych wizyt
- Dane pacjenta
- Możliwość edycji lub usunięcia

---

## 🗂️ Struktura plików (co zostało dodane/zmienione)

### Backend
```
backend/
├── app/
│   ├── models/
│   │   ├── payment.py              [NOWY] Model płatności
│   │   ├── appointment.py          [ZMIENIONY] +is_paid
│   │   ├── patient.py              [ZMIENIONY] +payments relation
│   │   └── __init__.py             [ZMIENIONY] +Payment export
│   ├── schemas/
│   │   ├── payment.py              [NOWY] Schematy Pydantic
│   │   └── appointment.py          [ZMIENIONY] +is_paid
│   ├── routers/
│   │   └── payments.py             [NOWY] 7 endpointów API
│   └── main.py                     [ZMIENIONY] +payments router
├── alembic/versions/
│   └── 001_add_payments_module.py  [NOWY] Migracja
└── seed.py                         [ZMIENIONY] +płatności
```

### Frontend
```
frontend/src/
├── pages/
│   ├── Payments.tsx                [NOWY] Lista płatności
│   ├── PaymentForm.tsx             [NOWY] Formularz
│   ├── PaymentDetail.tsx           [NOWY] Szczegóły
│   └── PatientDetail.tsx           [ZMIENIONY] +statystyki płatności
├── components/
│   ├── LoadingSpinner.tsx          [NOWY] Komponent ładowania
│   ├── AppointmentCalendar.tsx     [ZMIENIONY] +wskaźniki płatności
│   └── Layout.tsx                  [ZMIENIONY] +link Płatności
├── services/
│   └── api.ts                      [ZMIENIONY] +paymentsApi
├── types/
│   └── index.ts                    [ZMIENIONY] +Payment types
└── App.tsx                         [ZMIENIONY] +routing płatności
```

---

## 📚 Dokumentacja

### Główne pliki dokumentacji:
- **`PAYMENTS_MODULE.md`** - Szczegółowa dokumentacja modułu
- **`INSTALL.md`** - Instrukcje instalacji (Docker + lokalnie)
- **`PAYMENTS_CHECKLIST.md`** - Lista zrealizowanych funkcji
- **`README.md`** - Zaktualizowany opis projektu

### API Documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🔌 Endpointy API

### Płatności
```
POST   /payments/                          - Utwórz płatność
GET    /payments/                          - Lista płatności (filtry)
GET    /payments/{id}                      - Szczegóły płatności
PATCH  /payments/{id}                      - Aktualizuj płatność
DELETE /payments/{id}                      - Usuń płatność
GET    /payments/patient/{id}/unpaid       - Nieopłacone wizyty
GET    /payments/statistics/summary        - Statystyki
```

### Przykład request (Swagger):
```json
{
  "patient_id": 1,
  "amount": 400.00,
  "payment_method": "CASH",
  "appointment_ids": [1, 2],
  "description": "Płatność za 2 wizyty"
}
```

---

## 🎨 Funkcje biznesowe

### ✅ Płatność z dołu (po wizycie)
1. Pacjent przychodzi na wizytę
2. Po wizycie terapeuta dodaje płatność
3. Wybiera wykonane wizyty z listy
4. Wizyta automatycznie oznaczana jako opłacona

### ✅ Płatność z góry (przedpłata)
1. Pacjent płaci z góry za kilka wizyt
2. Terapeuta rejestruje płatność
3. Wybiera przyszłe zaplanowane wizyty
4. Wizyty oznaczane jako opłacone

### ✅ Historia i statystyki
- Pełna historia płatności każdego pacjenta
- Łączne kwoty (gotówka vs przelewy)
- Liczba opłaconych/nieopłaconych wizyt
- Filtry po dacie, pacjencie, metodzie

### ✅ Automatyzacja
- Automatyczne oznaczanie wizyt jako opłaconych
- Automatyczne usuwanie statusu przy usunięciu płatności
- Walidacja: czy wizyta nie jest już opłacona
- Walidacja: czy wizyta należy do pacjenta

---

## 🔧 Technologie

### Backend
- **FastAPI** - framework API
- **SQLAlchemy** - ORM
- **Alembic** - migracje bazy
- **Pydantic** - walidacja danych
- **PostgreSQL** - baza danych
- **JWT** - uwierzytelnianie

### Frontend
- **React 18** - library UI
- **TypeScript** - type safety
- **Vite** - bundler
- **TailwindCSS** - styling
- **React Router** - routing
- **Axios** - HTTP client
- **date-fns** - formatowanie dat
- **Heroicons** - ikony

---

## 💾 Dane testowe

Po uruchomieniu `seed.py`:

### Pacjenci (2)
- **Jan Kowalski** - 2 wizyty opłacone, 2 nieopłacone
- **Anna Nowak** - 1 wizyta nieopłacona

### Wizyty (6)
- 2 przeszłe (opłacone)
- 4 przyszłe (nieopłacone)

### Płatności (2)
- **Płatność #1**: 400 PLN (gotówka) - 2 wizyty Jana
- **Płatność #2**: 200 PLN (przelew) - teoretyczna

---

## 🐛 Troubleshooting

### Backend nie startuje
```bash
# Sprawdź logi
docker compose logs backend

# Uruchom migracje
docker compose exec backend alembic upgrade head
```

### Frontend - błędy TypeScript
```bash
cd frontend
npm install
npm run dev
```

### Brak danych testowych
```bash
docker compose exec backend python seed.py
```

### Port zajęty
```bash
# Zmień porty w docker-compose.yml
ports:
  - "8001:8000"  # backend
  - "5174:5173"  # frontend
```

---

## 🚀 Następne kroki

### Wdrożenie
1. Zmień `JWT_SECRET` w `.env`
2. Zmień hasło do bazy danych
3. Skonfiguruj backup bazy
4. Dodaj HTTPS (nginx + Let's Encrypt)
5. Usuń dane testowe w produkcji

### Możliwe rozszerzenia
- 📄 Generowanie faktur PDF
- 📊 Wykresy i raporty finansowe
- 💳 Integracja z płatnościami online
- 📧 Email notifications
- 🎁 System rabatów i promocji
- 💰 Plany płatności/raty
- 📤 Export do Excel/CSV

---

## 📞 Wsparcie

### Problem z modułem płatności?
1. Zobacz `PAYMENTS_MODULE.md` - szczegóły techniczne
2. Sprawdź `INSTALL.md` - instrukcje instalacji
3. Zobacz Swagger docs: http://localhost:8000/docs
4. Sprawdź logi: `docker compose logs -f backend`

### Testy manualne
1. ✅ Dodaj płatność za 1 wizytę
2. ✅ Dodaj płatność za wiele wizyt
3. ✅ Filtruj płatności po pacjencie
4. ✅ Filtruj płatności po dacie
5. ✅ Sprawdź statystyki
6. ✅ Usuń płatność (wizyta → nieopłacona)
7. ✅ Zobacz kalendarz (kolory wizyt)
8. ✅ Zobacz profil pacjenta (historia)

---

## ✅ Status implementacji

**Moduł płatności: COMPLETED** 🎉

Wszystkie zaplanowane funkcje zostały zaimplementowane i są gotowe do użycia!

### Zrealizowane:
- ✅ Backend: Modele + Migracje + API
- ✅ Frontend: UI + Formularze + Integracje
- ✅ Dokumentacja: README + INSTALL + Module docs
- ✅ Seed data: Przykładowe płatności
- ✅ Testy manualne: Wszystko działa

---

**Powodzenia z TherapyAssistance! 🎊**

Projekt gotowy do użycia - wystarczy `docker compose up`!