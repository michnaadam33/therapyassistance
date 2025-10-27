# Checklista wdrożenia modułu płatności

## ✅ Backend - Modele i Baza Danych

- [x] Utworzono model `Payment` (`app/models/payment.py`)
  - [x] Pole `id` (PrimaryKey)
  - [x] Pole `patient_id` (ForeignKey)
  - [x] Pole `amount` (Decimal)
  - [x] Pole `payment_date` (DateTime)
  - [x] Pole `payment_method` (Enum: CASH/TRANSFER)
  - [x] Pole `description` (String, optional)
  - [x] Pole `created_at` (DateTime)
  - [x] Pole `updated_at` (DateTime)

- [x] Utworzono tabelę asocjacyjną `payment_appointments`
  - [x] Relacja many-to-many między Payment i Appointment
  - [x] Klucze obce: payment_id, appointment_id

- [x] Zaktualizowano model `Appointment`
  - [x] Dodano pole `is_paid` (Boolean, default=False)
  - [x] Dodano relację do payments

- [x] Zaktualizowano model `Patient`
  - [x] Dodano relację do payments

- [x] Zaktualizowano `app/models/__init__.py`
  - [x] Dodano import Payment i PaymentMethod

## ✅ Backend - Migracje

- [x] Utworzono migrację Alembic (`001_add_payments_module.py`)
  - [x] Tworzy tabelę `payments`
  - [x] Tworzy tabelę `payment_appointments`
  - [x] Dodaje pole `is_paid` do tabeli `appointments`
  - [x] Tworzy indeksy dla wydajności
  - [x] Funkcja `upgrade()`
  - [x] Funkcja `downgrade()`

## ✅ Backend - Schematy Pydantic

- [x] Utworzono schematy w `app/schemas/payment.py`
  - [x] `PaymentMethodEnum`
  - [x] `AppointmentInPayment`
  - [x] `PaymentBase`
  - [x] `PaymentCreate`
  - [x] `PaymentUpdate`
  - [x] `Payment`
  - [x] `PaymentWithPatient`
  - [x] `PaymentListResponse`

- [x] Zaktualizowano `app/schemas/appointment.py`
  - [x] Dodano pole `is_paid` do `AppointmentBase`
  - [x] Dodano pole `is_paid` do `AppointmentUpdate`

## ✅ Backend - Endpointy API

- [x] Utworzono router `app/routers/payments.py`
  - [x] `POST /payments/` - rejestracja płatności
  - [x] `GET /payments/` - lista płatności z filtrami
  - [x] `GET /payments/{id}` - szczegóły płatności
  - [x] `PATCH /payments/{id}` - aktualizacja płatności
  - [x] `DELETE /payments/{id}` - usunięcie płatności
  - [x] `GET /payments/patient/{patient_id}/unpaid-appointments`
  - [x] `GET /payments/statistics/summary`

- [x] Dodano router do `app/main.py`
  - [x] Import modułu payments
  - [x] Include router w aplikacji

## ✅ Backend - Logika biznesowa

- [x] Walidacja pacjenta przy tworzeniu płatności
- [x] Sprawdzanie czy wizyty należą do pacjenta
- [x] Sprawdzanie czy wizyty nie są już opłacone
- [x] Automatyczne oznaczanie wizyt jako opłaconych
- [x] Automatyczne oznaczanie wizyt jako nieopłaconych przy usuwaniu płatności
- [x] Filtrowanie płatności (pacjent, daty, metoda)
- [x] Statystyki (suma, gotówka, przelewy)
- [x] Eager loading relacji (joinedload)

## ✅ Frontend - Typy TypeScript

- [x] Zaktualizowano `src/types/index.ts`
  - [x] `PaymentMethod` type
  - [x] `Payment` interface
  - [x] `AppointmentInPayment` interface
  - [x] `PaymentWithPatient` interface
  - [x] `PaymentFormData` interface
  - [x] `PaymentListResponse` interface
  - [x] `PaymentStatistics` interface
  - [x] Dodano `is_paid` do `Appointment` i `AppointmentFormData`

## ✅ Frontend - Serwis API

- [x] Zaktualizowano `src/services/api.ts`
  - [x] `paymentsApi.getAll()` - z parametrami filtrowania
  - [x] `paymentsApi.getById()`
  - [x] `paymentsApi.create()`
  - [x] `paymentsApi.update()`
  - [x] `paymentsApi.delete()`
  - [x] `paymentsApi.getUnpaidAppointments()`
  - [x] `paymentsApi.getStatistics()`
  - [x] Toast notifications dla akcji

## ✅ Frontend - Komponenty i Strony

- [x] Utworzono `src/pages/Payments.tsx`
  - [x] Lista płatności z tabelą
  - [x] Filtry (pacjent, daty, metoda płatności)
  - [x] Statystyki (karty z sumami)
  - [x] Paginacja
  - [x] Modal potwierdzenia usunięcia
  - [x] Linki do szczegółów i formularza

- [x] Utworzono `src/pages/PaymentForm.tsx`
  - [x] Formularz dodawania/edycji płatności
  - [x] Wybór pacjenta (select)
  - [x] Automatyczne ładowanie nieopłaconych wizyt
  - [x] Wielokrotny wybór wizyt (checkboxes)
  - [x] Automatyczne obliczanie kwoty
  - [x] Wybór metody płatności (radio buttons)
  - [x] Datetime picker dla daty płatności
  - [x] Opcjonalne pole opisu
  - [x] Walidacja formularza

- [x] Utworzono `src/pages/PaymentDetail.tsx`
  - [x] Szczegóły płatności
  - [x] Informacje o pacjencie (panel boczny)
  - [x] Lista opłaconych wizyt
  - [x] Przyciski akcji (Edytuj, Usuń)
  - [x] Modal potwierdzenia usunięcia
  - [x] Formatowanie kwot (PLN)

- [x] Utworzono `src/components/LoadingSpinner.tsx`
  - [x] Uniwersalny komponent ładowania
  - [x] Animacje spinner
  - [x] Tekst "Ładowanie..."

## ✅ Frontend - Integracje

- [x] Zaktualizowano `src/components/AppointmentCalendar.tsx`
  - [x] Wskaźnik statusu płatności (zielony/niebieski)
  - [x] Ikony CheckCircle/XCircle
  - [x] Tooltips ze statusem
  - [x] Różne kolory dla opłaconych/nieopłaconych

- [x] Zaktualizowano `src/pages/PatientDetail.tsx`
  - [x] Sekcja ze statystykami płatności (3 karty)
  - [x] Lista ostatnich płatności
  - [x] Wskaźniki w historii wizyt
  - [x] Link do dodania płatności
  - [x] Linki do szczegółów płatności

- [x] Zaktualizowano `src/components/Layout.tsx`
  - [x] Dodano link "Płatności" w menu
  - [x] Ikona CreditCard
  - [x] Routing dla desktop i mobile

## ✅ Frontend - Routing

- [x] Zaktualizowano `src/App.tsx`
  - [x] Import komponentów płatności
  - [x] Route `/payments` - lista
  - [x] Route `/payments/new` - formularz dodawania
  - [x] Route `/payments/:id` - szczegóły
  - [x] Route `/payments/:id/edit` - formularz edycji

## ✅ Seed Data

- [x] Zaktualizowano `backend/seed.py`
  - [x] Import modelu Payment
  - [x] Utworzenie 6 wizyt (2 opłacone, 4 nieopłacone)
  - [x] Utworzenie 2 przykładowych płatności
  - [x] Płatność gotówką (2 wizyty)
  - [x] Płatność przelewem (teoretyczna)
  - [x] Powiązanie płatności z wizytami

## ✅ Dokumentacja

- [x] Utworzono `PAYMENTS_MODULE.md`
  - [x] Opis funkcjonalności
  - [x] Dokumentacja API (endpointy)
  - [x] Dokumentacja frontendu (strony, komponenty)
  - [x] Przykłady użycia
  - [x] Scenariusze biznesowe
  - [x] Instrukcje migracji
  - [x] Troubleshooting
  - [x] Możliwe rozszerzenia

- [x] Zaktualizowano `README.md`
  - [x] Dodano informacje o module płatności
  - [x] Zaktualizowano listę funkcjonalności
  - [x] Dodano opis endpointów płatności
  - [x] Zaktualizowano opis frontendu

- [x] Utworzono `INSTALL.md`
  - [x] Instrukcje instalacji (Docker i lokalnie)
  - [x] Konfiguracja środowiska
  - [x] Migracje bazy danych
  - [x] Troubleshooting
  - [x] Weryfikacja instalacji

- [x] Utworzono `PAYMENTS_CHECKLIST.md`
  - [x] Pełna lista zrealizowanych zadań

## ✅ Testy i Walidacja

- [ ] Testy jednostkowe backendu (opcjonalne)
  - [ ] Test tworzenia płatności
  - [ ] Test walidacji wizyt
  - [ ] Test oznaczania jako opłacone
  - [ ] Test filtrowania
  - [ ] Test statystyk

- [ ] Testy jednostkowe frontendu (opcjonalne)
  - [ ] Test renderowania komponentów
  - [ ] Test formularzy
  - [ ] Test API calls

- [x] Testy manualne
  - [x] Utworzenie płatności za 1 wizytę
  - [x] Utworzenie płatności za wiele wizyt
  - [x] Filtrowanie płatności
  - [x] Edycja płatności
  - [x] Usunięcie płatności
  - [x] Sprawdzenie statusu wizyt
  - [x] Weryfikacja statystyk

## 🎯 Status: COMPLETED ✅

Moduł płatności został w pełni zaimplementowany i jest gotowy do użycia!

### Następne kroki:

1. **Uruchomienie aplikacji:**
   ```bash
   docker compose up
   docker compose exec backend python seed.py
   ```

2. **Testowanie:**
   - Zaloguj się: `terapeuta@example.com` / `haslo123`
   - Przejdź do sekcji "Płatności"
   - Dodaj nową płatność
   - Sprawdź status wizyt w kalendarzu
   - Sprawdź historię płatności pacjenta

3. **Dokumentacja:**
   - Przeczytaj `PAYMENTS_MODULE.md`
   - Sprawdź `INSTALL.md` dla szczegółów instalacji
   - Zobacz Swagger docs: http://localhost:8000/docs

### Możliwe rozszerzenia (TODO):

- [ ] Generowanie faktur PDF
- [ ] Export płatności do CSV/Excel
- [ ] Wykresy i raporty finansowe
- [ ] Integracja z systemami płatności online
- [ ] Automatyczne przypomnienia o płatnościach
- [ ] Rabaty i promocje
- [ ] Plany płatności/raty
- [ ] Wielowalutowość
- [ ] Email notifications po płatności
- [ ] Historia zmian płatności (audit log)