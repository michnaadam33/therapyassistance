# Moduł Płatności - TherapyAssistance

## Opis

Moduł płatności umożliwia psychoterapeutom zarządzanie płatnościami pacjentów za wizyty. System obsługuje płatności z góry (przed wizytą) oraz z dołu (po wizycie), z możliwością opłacenia jednej lub wielu wizyt jednocześnie.

## Funkcjonalności

### Backend (FastAPI + SQLAlchemy)

#### Modele bazy danych

1. **Payment** (`app/models/payment.py`)
   - `id` - identyfikator płatności
   - `patient_id` - klucz obcy do pacjenta
   - `amount` - kwota płatności (Decimal)
   - `payment_date` - data i godzina płatności
   - `payment_method` - metoda płatności (CASH/TRANSFER)
   - `description` - opcjonalny opis płatności
   - `created_at` - data utworzenia rekordu
   - `updated_at` - data ostatniej aktualizacji

2. **Appointment** (aktualizacja - `app/models/appointment.py`)
   - Dodane pole `is_paid` (Boolean) - status opłacenia wizyty

3. **Tabela asocjacyjna payment_appointments**
   - Relacja many-to-many między płatnościami a wizytami
   - Umożliwia przypisanie wielu wizyt do jednej płatności

#### Endpointy API

##### POST `/payments/`
Rejestracja nowej płatności za jedną lub wiele wizyt.

**Request body:**
```json
{
  "patient_id": 1,
  "amount": 400.00,
  "payment_method": "CASH",
  "appointment_ids": [1, 2],
  "payment_date": "2024-01-15T10:30:00",
  "description": "Płatność za 2 wizyty"
}
```

**Walidacje:**
- Sprawdza czy pacjent istnieje
- Sprawdza czy wszystkie wizyty należą do danego pacjenta
- Sprawdza czy wizyty nie są już opłacone
- Po utworzeniu płatności automatycznie ustawia `is_paid=True` dla powiązanych wizyt

##### GET `/payments/`
Lista płatności z możliwością filtrowania.

**Query parameters:**
- `skip` - offset dla paginacji (domyślnie 0)
- `limit` - limit wyników (domyślnie 100, max 500)
- `patient_id` - filtrowanie po pacjencie
- `date_from` - data od
- `date_to` - data do
- `payment_method` - metoda płatności (CASH/TRANSFER)

**Response:**
```json
{
  "total": 15,
  "payments": [
    {
      "id": 1,
      "patient_id": 1,
      "patient_name": "Jan Kowalski",
      "patient_email": "jan@example.com",
      "patient_phone": "123456789",
      "amount": 400.00,
      "payment_date": "2024-01-15T10:30:00",
      "payment_method": "CASH",
      "description": "Płatność za 2 wizyty",
      "appointments": [...],
      "created_at": "2024-01-15T10:30:00",
      "updated_at": null
    }
  ]
}
```

##### GET `/payments/{id}`
Szczegóły konkretnej płatności wraz z informacjami o pacjencie i powiązanych wizytach.

##### PATCH `/payments/{id}`
Aktualizacja szczegółów płatności.

**Request body:**
```json
{
  "amount": 450.00,
  "payment_method": "TRANSFER",
  "description": "Zaktualizowany opis"
}
```

##### DELETE `/payments/{id}`
Usunięcie płatności. Powiązane wizyty zostaną automatycznie oznaczone jako nieopłacone (`is_paid=False`).

##### GET `/payments/patient/{patient_id}/unpaid-appointments`
Lista ID nieopłaconych wizyt dla danego pacjenta.

**Response:**
```json
[1, 2, 5, 7]
```

##### GET `/payments/statistics/summary`
Statystyki płatności z możliwością filtrowania po dacie.

**Query parameters:**
- `date_from` - data od
- `date_to` - data do

**Response:**
```json
{
  "total_payments": 25,
  "total_amount": 5000.00,
  "cash_amount": 3000.00,
  "transfer_amount": 2000.00,
  "cash_count": 15,
  "transfer_count": 10
}
```

### Frontend (React + TypeScript + TailwindCSS)

#### Strony

1. **Payments** (`/payments`)
   - Lista wszystkich płatności z paginacją
   - Filtry: pacjent, zakres dat, metoda płatności
   - Statystyki: łączna kwota, gotówka, przelewy
   - Przycisk "Dodaj płatność"

2. **PaymentForm** (`/payments/new`, `/payments/{id}/edit`)
   - Formularz dodawania/edycji płatności
   - Wybór pacjenta
   - Automatyczne ładowanie nieopłaconych wizyt
   - Wybór wielu wizyt (checkbox)
   - Automatyczne obliczanie kwoty (200 PLN za wizytę - można dostosować)
   - Wybór metody płatności (gotówka/przelew)
   - Data i godzina płatności
   - Opcjonalny opis

3. **PaymentDetail** (`/payments/{id}`)
   - Szczegóły płatności
   - Informacje o pacjencie
   - Lista opłaconych wizyt
   - Przyciski: Edytuj, Usuń

#### Komponenty

1. **LoadingSpinner** (`components/LoadingSpinner.tsx`)
   - Uniwersalny komponent ładowania
   - Używany we wszystkich stronach modułu

2. **AppointmentCalendar** (zaktualizowany)
   - Dodano wskaźniki statusu płatności wizyt
   - Zielony kolor dla opłaconych wizyt
   - Niebieski dla nieopłaconych
   - Ikony CheckCircle/XCircle

3. **PatientDetail** (zaktualizowany)
   - Sekcja ze statystykami płatności
   - Lista ostatnich płatności
   - Wskaźnik opłaconych/nieopłaconych wizyt

#### Typy TypeScript

```typescript
export type PaymentMethod = "CASH" | "TRANSFER";

export interface Payment {
  id: number;
  patient_id: number;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  description?: string;
  created_at: string;
  updated_at?: string;
  appointments: AppointmentInPayment[];
}

export interface PaymentWithPatient extends Payment {
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
}

export interface PaymentFormData {
  patient_id: number;
  amount: number;
  payment_method: PaymentMethod;
  appointment_ids: number[];
  payment_date?: string;
  description?: string;
}
```

#### Serwis API

```typescript
// Przykład użycia
import { paymentsApi } from '../services/api';

// Pobranie wszystkich płatności
const payments = await paymentsApi.getAll({
  patient_id: 1,
  date_from: '2024-01-01',
  date_to: '2024-01-31'
});

// Utworzenie płatności
const newPayment = await paymentsApi.create({
  patient_id: 1,
  amount: 400,
  payment_method: 'CASH',
  appointment_ids: [1, 2]
});

// Statystyki
const stats = await paymentsApi.getStatistics({
  date_from: '2024-01-01',
  date_to: '2024-01-31'
});
```

## Migracja bazy danych

### Alembic Migration

Plik: `backend/alembic/versions/001_add_payments_module.py`

**Wykonuje:**
1. Tworzy tabelę `payments` z wszystkimi polami
2. Tworzy tabelę asocjacyjną `payment_appointments`
3. Dodaje pole `is_paid` do tabeli `appointments`
4. Tworzy indeksy dla wydajności

**Uruchomienie migracji:**
```bash
cd backend
alembic upgrade head
```

**Cofnięcie migracji:**
```bash
alembic downgrade -1
```

## Nawigacja

Dodano link "Płatności" w menu głównym aplikacji (ikona karty kredytowej).

## Przykładowy przepływ pracy

### Scenariusz 1: Płatność z dołu (po wizycie)

1. Terapeuta przeprowadza wizytę z pacjentem
2. Po wizycie przechodzi do `/payments/new`
3. Wybiera pacjenta
4. System automatycznie pokazuje listę nieopłaconych wizyt
5. Terapeuta zaznacza odpowiednie wizyty
6. Wybiera metodę płatności i wprowadza kwotę
7. Po zapisaniu, wizyty są automatycznie oznaczane jako opłacone

### Scenariusz 2: Płatność z góry (przedpłata)

1. Pacjent płaci z góry za kilka wizyt
2. Terapeuta tworzy płatność przez `/payments/new`
3. Wybiera pacjenta i przyszłe wizyty
4. System rejestruje płatność i oznacza wizyty jako opłacone

### Scenariusz 3: Podgląd historii płatności pacjenta

1. Terapeuta przechodzi do `/patients/{id}`
2. Widzi sekcję ze statystykami płatności
3. Widzi listę ostatnich płatności
4. Może kliknąć na płatność aby zobaczyć szczegóły
5. Widzi które wizyty są opłacone/nieopłacone

## Walidacje i bezpieczeństwo

- Wszystkie endpointy wymagają autentykacji JWT
- Walidacja Pydantic dla wszystkich requestów
- Sprawdzanie przynależności wizyt do pacjenta
- Zabezpieczenie przed podwójnym opłaceniem wizyty
- Transakcyjna aktualizacja statusów wizyt

## Konfiguracja

Brak dodatkowej konfiguracji. Moduł działa out-of-the-box po uruchomieniu migracji.

## Możliwe rozszerzenia

1. **Faktury/Paragony**
   - Generowanie PDF z fakturami
   - Numeracja dokumentów

2. **Automatyczne przypomnienia**
   - Email/SMS o nieopłaconych wizytach

3. **Rabaty i promocje**
   - System kodów rabatowych
   - Pakiety wizyt

4. **Raporty finansowe**
   - Eksport do CSV/Excel
   - Wykresy przychodów
   - Zestawienia roczne/kwartalne

5. **Integracja z systemami płatności online**
   - PayU, Przelewy24, Stripe
   - Linki do płatności dla pacjentów

6. **Plany płatności**
   - Raty
   - Subskrypcje miesięczne

## Testowanie

### Backend
```bash
cd backend
pytest tests/test_payments.py
```

### Frontend
```bash
cd frontend
npm test
```

## Troubleshooting

### Problem: Wizyta nie oznacza się jako opłacona

**Rozwiązanie:** Sprawdź czy ID wizyty jest poprawne i czy wizyta należy do danego pacjenta.

### Problem: Błąd "Wizyta jest już opłacona"

**Rozwiązanie:** Sprawdź w bazie danych pole `is_paid` dla danej wizyty. Możliwe że wizyta została już przypisana do innej płatności.

### Problem: Statystyki się nie aktualizują

**Rozwiązanie:** Sprawdź filtry dat. Statystyki są obliczane tylko dla płatności w podanym zakresie.

## Support

W razie problemów:
1. Sprawdź logi backendu (uvicorn)
2. Sprawdź console w przeglądarce (DevTools)
3. Sprawdź czy migracja została wykonana: `alembic current`

## Changelog

### v1.0.0 (2024-01-15)
-初始版本 modułu płatności
- CRUD operations dla płatności
- Relacja many-to-many z wizytami
- Frontend z filtrowaniem i statystykami
- Integracja z widokami pacjenta i kalendarza