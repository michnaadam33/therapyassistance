# 🧪 Komendy testowe API - TherapyAssistance

Przykładowe komendy `curl` do testowania API po wdrożeniu na mikr.us.

## 🌐 Adresy

- **Lokalny (na serwerze):** `http://localhost:8000`
- **Produkcyjny:** `https://api.therapyassistance.io`

Zamień `$API_URL` w komendach poniżej na odpowiedni adres.

```bash
# Dla testów lokalnych na serwerze
export API_URL="http://localhost:8000"

# Dla testów produkcyjnych
export API_URL="https://api.therapyassistance.io"
```

---

## 1. Health Check

### Sprawdzenie czy API działa

```bash
curl $API_URL/health
```

**Oczekiwana odpowiedź:**
```json
{"status":"healthy"}
```

### Strona główna

```bash
curl $API_URL/
```

**Oczekiwana odpowiedź:**
```json
{
  "message": "Witaj w TherapyAssistance API",
  "docs": "/docs",
  "version": "1.0.0"
}
```

---

## 2. Rejestracja użytkownika

```bash
curl -X POST $API_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "terapeuta@example.com",
    "password": "BezpieczneHaslo123!"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Zapisz token** - będzie potrzebny do dalszych requestów!

```bash
export TOKEN="your_token_here"
```

---

## 3. Logowanie

```bash
curl -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "terapeuta@example.com",
    "password": "BezpieczneHaslo123!"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 4. Pacjenci

### Lista pacjentów

```bash
curl -X GET $API_URL/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"
```

### Dodanie pacjenta

```bash
curl -X POST $API_URL/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48 123 456 789",
    "notes": "Pierwszy pacjent w systemie"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "id": 1,
  "name": "Jan Kowalski",
  "email": "jan.kowalski@example.com",
  "phone": "+48 123 456 789",
  "notes": "Pierwszy pacjent w systemie",
  "created_at": "2024-01-15T10:30:00"
}
```

**Zapisz ID pacjenta:**
```bash
export PATIENT_ID=1
```

### Szczegóły pacjenta

```bash
curl -X GET $API_URL/api/v1/patients/$PATIENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Aktualizacja pacjenta

```bash
curl -X PUT $API_URL/api/v1/patients/$PATIENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48 123 456 789",
    "notes": "Zaktualizowane notatki o pacjencie"
  }'
```

### Usunięcie pacjenta

```bash
curl -X DELETE $API_URL/api/v1/patients/$PATIENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Wizyty

### Lista wszystkich wizyt

```bash
curl -X GET $API_URL/api/v1/appointments \
  -H "Authorization: Bearer $TOKEN"
```

### Wizyty konkretnego pacjenta

```bash
curl -X GET "$API_URL/api/v1/appointments?patient_id=$PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Wizyty w określonym zakresie dat

```bash
curl -X GET "$API_URL/api/v1/appointments?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Dodanie wizyty

```bash
curl -X POST $API_URL/api/v1/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": '$PATIENT_ID',
    "date": "2024-01-20",
    "start_time": "10:00",
    "end_time": "11:00",
    "notes": "Pierwsza sesja terapeutyczna"
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "id": 1,
  "patient_id": 1,
  "date": "2024-01-20",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "notes": "Pierwsza sesja terapeutyczna"
}
```

**Zapisz ID wizyty:**
```bash
export APPOINTMENT_ID=1
```

### Aktualizacja wizyty

```bash
curl -X PUT $API_URL/api/v1/appointments/$APPOINTMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": '$PATIENT_ID',
    "date": "2024-01-20",
    "start_time": "11:00",
    "end_time": "12:00",
    "notes": "Zmieniona godzina wizyty"
  }'
```

### Usunięcie wizyty

```bash
curl -X DELETE $API_URL/api/v1/appointments/$APPOINTMENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. Notatki z sesji

### Lista notatek dla pacjenta

```bash
curl -X GET $API_URL/api/v1/session_notes/$PATIENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Dodanie notatki

```bash
curl -X POST $API_URL/api/v1/session_notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": '$PATIENT_ID',
    "content": "Pacjent wykazuje znaczną poprawę. Omówiliśmy strategie radzenia sobie ze stresem."
  }'
```

**Oczekiwana odpowiedź:**
```json
{
  "id": 1,
  "patient_id": 1,
  "content": "Pacjent wykazuje znaczną poprawę...",
  "created_at": "2024-01-20T11:30:00"
}
```

---

## 7. Płatności (jeśli moduł jest włączony)

### Lista płatności pacjenta

```bash
curl -X GET "$API_URL/api/v1/payments?patient_id=$PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Dodanie płatności

```bash
curl -X POST $API_URL/api/v1/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": '$PATIENT_ID',
    "amount": 150.00,
    "date": "2024-01-20",
    "method": "transfer",
    "notes": "Płatność za sesję"
  }'
```

---

## 🧪 Kompleksowy test przepływu

Pełny test od rejestracji do dodania pacjenta i wizyty:

```bash
#!/bin/bash

# Konfiguracja
API_URL="http://localhost:8000"

echo "=== 1. Health Check ==="
curl -s $API_URL/health | jq
echo -e "\n"

echo "=== 2. Rejestracja użytkownika ==="
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPassword123!"
  }')
echo $REGISTER_RESPONSE | jq
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
echo "Token: $TOKEN"
echo -e "\n"

echo "=== 3. Dodanie pacjenta ==="
PATIENT_RESPONSE=$(curl -s -X POST $API_URL/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@example.com",
    "phone": "+48 123 456 789",
    "notes": "Test patient"
  }')
echo $PATIENT_RESPONSE | jq
PATIENT_ID=$(echo $PATIENT_RESPONSE | jq -r '.id')
echo "Patient ID: $PATIENT_ID"
echo -e "\n"

echo "=== 4. Lista pacjentów ==="
curl -s -X GET $API_URL/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n"

echo "=== 5. Dodanie wizyty ==="
curl -s -X POST $API_URL/api/v1/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": '$PATIENT_ID',
    "date": "2024-02-01",
    "start_time": "10:00",
    "end_time": "11:00",
    "notes": "Test appointment"
  }' | jq
echo -e "\n"

echo "=== 6. Lista wizyt ==="
curl -s -X GET $API_URL/api/v1/appointments \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n"

echo "=== 7. Dodanie notatki ==="
curl -s -X POST $API_URL/api/v1/session_notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": '$PATIENT_ID',
    "content": "Test session note"
  }' | jq
echo -e "\n"

echo "✅ Wszystkie testy zakończone!"
```

Zapisz jako `test_api.sh`, nadaj uprawnienia i uruchom:

```bash
chmod +x test_api.sh
./test_api.sh
```

---

## 🔍 Diagnostyka

### Sprawdzenie czy serwer odpowiada

```bash
curl -I $API_URL/health
```

Powinno pokazać `HTTP/1.1 200 OK`

### Sprawdzenie CORS

```bash
curl -H "Origin: https://therapyassistance.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  -v $API_URL/api/v1/auth/login
```

### Test wydajności

```bash
# 10 requestów jeden po drugim
for i in {1..10}; do
  time curl -s $API_URL/health > /dev/null
done

# Równolegle (wymaga apache2-utils)
ab -n 100 -c 10 $API_URL/health
```

---

## 📊 Formatowanie odpowiedzi

### Z jq (ładne formatowanie JSON)

```bash
curl -s $API_URL/health | jq
```

### Z python (jeśli nie masz jq)

```bash
curl -s $API_URL/health | python3 -m json.tool
```

### Zapisanie do pliku

```bash
curl -s $API_URL/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" > patients.json
```

---

## ⚠️ Typowe błędy

### 401 Unauthorized
```bash
# Sprawdź czy token jest poprawny
echo $TOKEN

# Zaloguj się ponownie
curl -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword"}'
```

### 404 Not Found
```bash
# Sprawdź czy endpoint istnieje
curl $API_URL/docs  # Zobacz dokumentację Swagger
```

### 422 Unprocessable Entity
```bash
# Sprawdź format JSON i wymagane pola
# Zobacz szczegóły błędu w odpowiedzi
```

### 500 Internal Server Error
```bash
# Sprawdź logi na serwerze
tail -f ~/therapyassistance/logs/backend.error.log
```

---

## 🎓 Przydatne aliasy

Dodaj do `~/.bashrc` lub `~/.zshrc`:

```bash
# Aliasy dla TherapyAssistance API
alias ta-health='curl -s http://localhost:8000/health | jq'
alias ta-logs='tail -f ~/therapyassistance/logs/backend.log'
alias ta-errors='tail -f ~/therapyassistance/logs/backend.error.log'
alias ta-status='sudo systemctl status therapyassistance'
alias ta-restart='sudo systemctl restart therapyassistance'

# Funkcja do szybkiego logowania
ta-login() {
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" | jq
}

# Użycie: ta-login user@example.com password123
```

---

## 📚 Więcej informacji

- **Swagger UI:** `$API_URL/docs`
- **ReDoc:** `$API_URL/redoc`
- **Health Check:** `$API_URL/health`

---

**Powodzenia z testowaniem API! 🚀**