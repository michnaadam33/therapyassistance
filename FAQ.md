# FAQ - Moduł Płatności TherapyAssistance

## ❓ Najczęściej zadawane pytania

---

## 🚀 Uruchomienie i instalacja

### Q: Jak szybko uruchomić aplikację?
**A:** Wystarczą 3 komendy:
```bash
cd therapyassistance
docker compose up
docker compose exec backend python seed.py
```
Następnie otwórz http://localhost:5173 i zaloguj się: `terapeuta@example.com` / `haslo123`

### Q: Czy muszę instalować coś poza Dockerem?
**A:** Nie! Docker i Docker Compose to wszystko czego potrzebujesz. Całe środowisko (backend, frontend, baza) jest skonteneryzowane.

### Q: Jak uruchomić aplikację bez Dockera?
**A:** Zobacz plik `INSTALL.md` - sekcja "Instalacja lokalna". Potrzebujesz: Python 3.9+, Node.js 16+, PostgreSQL 15+.

### Q: Backend się nie uruchamia - co robić?
**A:** 
1. Sprawdź logi: `docker compose logs backend`
2. Upewnij się że port 8000 jest wolny: `lsof -i :8000`
3. Sprawdź czy baza danych działa: `docker compose ps`
4. Zobacz `FIXES.md` - znane problemy i rozwiązania

---

## 💰 Funkcjonalność płatności

### Q: Jak dodać płatność za wizytę?
**A:** 
1. Przejdź do "Płatności" → "Dodaj płatność"
2. Wybierz pacjenta z listy
3. Zaznacz wizyty do opłacenia
4. Wybierz metodę (gotówka/przelew)
5. Kwota obliczy się automatycznie
6. Kliknij "Dodaj płatność"

### Q: Czy można opłacić wiele wizyt jednocześnie?
**A:** Tak! W formularzu płatności możesz zaznaczyć dowolną liczbę wizyt tego samego pacjenta.

### Q: Co się stanie gdy usunę płatność?
**A:** Powiązane wizyty zostaną automatycznie oznaczone jako nieopłacone. Możesz je ponownie opłacić później.

### Q: Czy można edytować płatność?
**A:** Tak, możesz edytować kwotę, metodę płatności i opis. Nie można zmienić pacjenta ani powiązanych wizyt.

### Q: Jak sprawdzić historię płatności pacjenta?
**A:** 
1. Przejdź do "Pacjenci"
2. Kliknij na pacjenta
3. Przewiń do sekcji "Ostatnie płatności"

### Q: Gdzie widzę czy wizyta jest opłacona?
**A:** 
- W kalendarzu wizyt (zielony kolor = opłacona, niebieski = nieopłacona)
- W profilu pacjenta (sekcja wizyt)
- W szczegółach płatności

---

## 📊 Statystyki i raporty

### Q: Jak zobaczyć statystyki płatności?
**A:** Przejdź do "Płatności" - na górze strony są 3 karty ze statystykami:
- Łączna kwota
- Gotówka
- Przelewy

### Q: Czy mogę filtrować płatności?
**A:** Tak! Dostępne filtry:
- Pacjent (wybór z listy)
- Data od/do
- Metoda płatności (gotówka/przelew)

### Q: Jak wyeksportować płatności do Excel?
**A:** Ta funkcja nie jest jeszcze zaimplementowana. Jest na liście rozszerzeń (zobacz `PAYMENTS_MODULE.md` - sekcja "Możliwe rozszerzenia").

---

## 🔧 Problemy techniczne

### Q: Błąd "Failed to resolve import @heroicons/react"
**A:** Ten problem został naprawiony w wersji 1.0.2. Zaktualizuj kod i przebuduj kontenery:
```bash
git pull
docker compose up --build
```

### Q: Błąd "Unknown constraint decimal_places"
**A:** Ten problem został naprawiony w wersji 1.0.2. Zobacz `BUGFIXES_v1.0.2.md`.

### Q: Błąd "Input should be a valid date" przy pustych filtrach
**A:** Ten problem został naprawiony w wersji 1.0.2. Upewnij się że używasz najnowszej wersji kodu.

### Q: Frontend nie łączy się z backendem
**A:** 
1. Sprawdź czy backend działa: `curl http://localhost:8000/health`
2. Sprawdź `VITE_API_URL` w `frontend/.env`
3. Sprawdź CORS w `backend/app/core/config.py`
4. Wyczyść cache przeglądarki (Ctrl+Shift+Del)

### Q: Brak danych testowych
**A:** Uruchom seed:
```bash
docker compose exec backend python seed.py
```

### Q: Token JWT wygasł
**A:** Wyloguj się i zaloguj ponownie. Token jest ważny 24 godziny (1440 minut).

---

## 💾 Baza danych

### Q: Jak połączyć się z bazą danych?
**A:** 
```bash
docker compose exec db psql -U postgres -d therapyassistance
```

### Q: Jak sprawdzić czy migracje zostały wykonane?
**A:** 
```bash
docker compose exec backend alembic current
```

### Q: Jak cofnąć migrację?
**A:** 
```bash
docker compose exec backend alembic downgrade -1
```

### Q: Jak wyczyścić bazę danych?
**A:** 
```bash
docker compose down -v  # Usuwa volumes (UWAGA: wszystkie dane zostaną usunięte!)
docker compose up
docker compose exec backend python seed.py
```

---

## 🎨 UI/UX

### Q: Dlaczego ikony wyglądają inaczej niż na screenshotach?
**A:** Zmieniliśmy bibliotekę ikon z @heroicons na lucide-react dla spójności z resztą projektu.

### Q: Czy aplikacja działa na telefonie?
**A:** Tak! UI jest responsywny i dostosowuje się do rozmiaru ekranu.

### Q: Jak zmienić język na angielski?
**A:** Aplikacja jest obecnie tylko po polsku. Wielojęzyczność jest możliwym rozszerzeniem.

### Q: Czy mogę zmienić cenę domyślną wizyty (200 PLN)?
**A:** Tak, w pliku `frontend/src/pages/PaymentForm.tsx` linia 56:
```typescript
const pricePerAppointment = 200; // Zmień tutaj
```

---

## 🔐 Bezpieczeństwo

### Q: Czy mogę używać tej aplikacji w produkcji?
**A:** Tak, ale musisz najpierw:
1. Zmienić `JWT_SECRET` na silny, losowy ciąg
2. Zmienić hasło do bazy danych
3. Skonfigurować HTTPS (nginx + Let's Encrypt)
4. Usunąć/zmienić domyślne konto testowe
5. Skonfigurować backup bazy danych

Zobacz `INSTALL.md` - sekcja "Bezpieczeństwo (Production)".

### Q: Gdzie są przechowywane tokeny JWT?
**A:** W localStorage przeglądarki. Token jest ważny 24 godziny.

### Q: Czy dane są szyfrowane?
**A:** Hasła są hashowane (bcrypt). Połączenie z bazą danych w Dockerze jest wewnętrzne. W produkcji dodaj HTTPS.

---

## 🧪 Testowanie

### Q: Jak przetestować moduł płatności?
**A:** 
1. **Testy manualne:** Zobacz `TESTING.md` - 9 scenariuszy testowych
2. **Testy automatyczne API:** `docker compose exec backend python test_payments_api.py`
3. **Swagger UI:** http://localhost:8000/docs

### Q: Czy są testy jednostkowe?
**A:** Nie ma jeszcze testów jednostkowych (pytest). Jest to możliwe rozszerzenie.

### Q: Jak testować API przez Swagger?
**A:** 
1. Otwórz http://localhost:8000/docs
2. Kliknij "Authorize"
3. Zaloguj się (otrzymasz token JWT)
4. Kliknij "Authorize" ponownie i wpisz token
5. Testuj endpointy

---

## 📚 Dokumentacja

### Q: Gdzie znaleźć dokumentację?
**A:** Mamy 7 plików dokumentacji:
- **`QUICK_START.md`** ⭐ - zacznij tutaj!
- `PAYMENTS_MODULE.md` - szczegóły techniczne
- `INSTALL.md` - instalacja i konfiguracja
- `TESTING.md` - scenariusze testowe
- `BUGFIXES_v1.0.2.md` - naprawione błędy
- `FIXES.md` - znane problemy
- `FAQ.md` - to co właśnie czytasz 😊

### Q: Gdzie jest dokumentacja API?
**A:** 
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Markdown: `PAYMENTS_MODULE.md` - sekcja "Endpointy API"

### Q: Czy są video tutoriale?
**A:** Obecnie nie ma. Jest to możliwe rozszerzenie.

---

## 🔄 Aktualizacje

### Q: Jaka jest aktualna wersja?
**A:** v1.0.2 (15 Stycznia 2024)

### Q: Jak zaktualizować aplikację?
**A:** 
```bash
git pull
docker compose down
docker compose up --build
docker compose exec backend alembic upgrade head
```

### Q: Co nowego w v1.0.2?
**A:** 
- ✅ Naprawiono ikony (heroicons → lucide-react)
- ✅ Naprawiono walidację Decimal w Pydantic
- ✅ Naprawiono typy date/time
- ✅ Naprawiono puste parametry zapytań
- ✅ Wszystkie testy przechodzą pomyślnie

Zobacz pełny changelog w `BUGFIXES_v1.0.2.md`

---

## 💡 Wskazówki i triki

### Q: Jak szybko dodać płatność?
**A:** Skrót klawiszowy nie jest zaimplementowany, ale:
1. Możesz dodać zakładkę przeglądarki do `/payments/new`
2. Lub kliknij "Dodaj płatność" na liście płatności

### Q: Jak znaleźć nieopłacone wizyty?
**A:** 
- W profilu pacjenta - sekcja "Nieopłacone wizyty"
- W kalendarzu - niebieski kolor
- Lub użyj endpointu API: `GET /payments/patient/{id}/unpaid-appointments`

### Q: Czy mogę zmienić domyślną metodę płatności?
**A:** Tak, w `PaymentForm.tsx` linia 33:
```typescript
payment_method: 'CASH',  // Zmień na 'TRANSFER'
```

### Q: Jak posortować płatności?
**A:** Płatności są automatycznie sortowane od najnowszych. Inne sortowania nie są jeszcze zaimplementowane.

---

## 🤝 Wsparcie

### Q: Gdzie zgłosić błąd?
**A:** 
1. Sprawdź `FIXES.md` - może już jest rozwiązanie
2. Sprawdź `BUGFIXES_v1.0.2.md` - lista znanych błędów
3. Sprawdź logi: `docker compose logs -f backend`

### Q: Gdzie zadać pytanie?
**A:** 
1. Sprawdź to FAQ
2. Sprawdź dokumentację (7 plików .md)
3. Sprawdź Swagger docs: http://localhost:8000/docs

### Q: Jak mogę pomóc w rozwoju?
**A:** Zobacz `README.md` - sekcja "Współpraca":
1. Fork projektu
2. Stwórz branch
3. Commit zmian
4. Push do brancha
5. Otwórz Pull Request

---

## 🎯 Best Practices

### Q: Jak często robić backup bazy?
**A:** W produkcji: codziennie. Użyj `pg_dump`:
```bash
docker compose exec db pg_dump -U postgres therapyassistance > backup.sql
```

### Q: Czy powinienem commitować .env?
**A:** NIE! Plik `.env` zawiera sekrety. Jest w `.gitignore`.

### Q: Jak zarządzać płatnościami dla wielu terapeutów?
**A:** Obecna wersja obsługuje jednego terapeutę. Multi-tenancy to możliwe rozszerzenie.

---

## 📈 Wydajność

### Q: Ile płatności może obsłużyć system?
**A:** Baza PostgreSQL może obsłużyć miliony rekordów. Paginacja (20 na stronę) zapewnia płynność.

### Q: Czy mogę zwiększyć limit płatności na stronę?
**A:** Tak, ale nie zalecane powyżej 100. W `Payments.tsx` linia 36:
```typescript
const itemsPerPage = 20;  // Zmień tutaj
```

### Q: Dlaczego strona ładuje się wolno?
**A:** 
1. Sprawdź logi backendu
2. Sprawdź połączenie z bazą danych
3. Sprawdź liczę rekordów w bazie
4. Zobacz `TESTING.md` - testy wydajnościowe

---

## 🔮 Przyszłe funkcje

### Q: Jakie funkcje są planowane?
**A:** Zobacz `PAYMENTS_MODULE.md` - sekcja "Możliwe rozszerzenia":
- 📄 Faktury PDF
- 📊 Wykresy i raporty
- 💳 Płatności online (PayU, Przelewy24)
- 📧 Email notifications
- 🎁 Rabaty i promocje
- 💰 Plany płatności/raty
- 📤 Export do Excel/CSV

### Q: Kiedy będą dostępne faktury PDF?
**A:** Nie ma ustalonej daty. To zależy od priorytetów projektu.

### Q: Czy będzie integracja z systemami księgowymi?
**A:** To możliwe rozszerzenie, ale nie jest obecnie planowane.

---

**Nie znalazłeś odpowiedzi?**

Sprawdź dokumentację:
- `QUICK_START.md` - szybki start
- `PAYMENTS_MODULE.md` - dokumentacja techniczna
- `TESTING.md` - testowanie i debugging
- `INSTALL.md` - instalacja szczegółowa

**Dalej potrzebujesz pomocy?**

Sprawdź logi: `docker compose logs -f backend`

---

**Ostatnia aktualizacja:** 15 Stycznia 2024  
**Wersja:** 1.0.2