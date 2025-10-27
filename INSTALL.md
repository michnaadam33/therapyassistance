# Instalacja TherapyAssistance

## Wymagania systemowe

### Wymagane
- **Docker** 20.10+ i **Docker Compose** 2.0+
- **Git**

### Opcjonalne (dla rozwoju lokalnego)
- **Python** 3.9+
- **Node.js** 16+ i **npm** 8+
- **PostgreSQL** 15+

---

## 🚀 Szybka instalacja (Docker)

### Krok 1: Sklonuj repozytorium
```bash
git clone <repository-url>
cd therapyassistance
```

### Krok 2: Uruchom aplikację
```bash
docker compose up
```

To uruchomi:
- Backend na http://localhost:8000
- Frontend na http://localhost:5173
- PostgreSQL na localhost:5432

### Krok 3: Wypełnij bazę danymi testowymi
W nowym terminalu:
```bash
docker compose exec backend python seed.py
```

### Krok 4: Zaloguj się
Otwórz http://localhost:5173 w przeglądarce i zaloguj się:
- **Email:** `terapeuta@example.com`
- **Hasło:** `haslo123`

---

## 🔧 Instalacja lokalna (Development)

### Backend

#### 1. Zainstaluj PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql@15

# Windows
# Pobierz installer z https://www.postgresql.org/download/windows/
```

#### 2. Utwórz bazę danych
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE therapyassistance;
CREATE USER therapyuser WITH PASSWORD 'therapypass';
GRANT ALL PRIVILEGES ON DATABASE therapyassistance TO therapyuser;
\q
```

#### 3. Skonfiguruj środowisko Python
```bash
cd backend

# Utwórz środowisko wirtualne
python -m venv venv

# Aktywuj środowisko
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Zainstaluj zależności
pip install -r requirements.txt
```

#### 4. Utwórz plik .env
```bash
cd backend
cat > .env << EOF
DATABASE_URL=postgresql+psycopg2://therapyuser:therapypass@localhost:5432/therapyassistance
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173"]
EOF
```

#### 5. Uruchom migracje
```bash
alembic upgrade head
```

#### 6. Wypełnij bazę danymi testowymi
```bash
python seed.py
```

#### 7. Uruchom serwer
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend dostępny na: http://localhost:8000
Swagger docs: http://localhost:8000/docs

---

### Frontend

#### 1. Zainstaluj Node.js i npm
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (Homebrew)
brew install node

# Windows
# Pobierz installer z https://nodejs.org/
```

#### 2. Zainstaluj zależności
```bash
cd frontend
npm install
```

#### 3. Utwórz plik .env (opcjonalnie)
```bash
cd frontend
cat > .env << EOF
VITE_API_URL=http://localhost:8000
EOF
```

#### 4. Uruchom serwer deweloperski
```bash
npm run dev
```

Frontend dostępny na: http://localhost:5173

---

## 📦 Struktura plików konfiguracyjnych

### Backend `.env`
```env
DATABASE_URL=postgresql+psycopg2://user:password@host:port/database
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

### Docker Compose
Plik `docker-compose.yml` już zawiera wszystkie potrzebne konfiguracje.

---

## 🗃️ Migracje bazy danych

### Utworzenie nowej migracji
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Zastosowanie migracji
```bash
alembic upgrade head
```

### Cofnięcie ostatniej migracji
```bash
alembic downgrade -1
```

### Sprawdzenie aktualnej wersji
```bash
alembic current
```

### Historia migracji
```bash
alembic history
```

---

## 🧪 Dane testowe

### Użytkownicy
Po uruchomieniu `seed.py`:
- **Email:** `terapeuta@example.com`
- **Hasło:** `haslo123`

### Pacjenci
- Jan Kowalski (2 wizyty opłacone, 2 nieopłacone)
- Anna Nowak (1 wizyta nieopłacona)

### Wizyty
- 6 wizyt (2 przeszłe opłacone, 4 przyszłe nieopłacone)

### Płatności
- 2 płatności (gotówka i przelew)

---

## 🐛 Troubleshooting

### Problem: "Database connection failed"
**Rozwiązanie:**
1. Sprawdź czy PostgreSQL jest uruchomiony:
   ```bash
   sudo systemctl status postgresql
   ```
2. Sprawdź `DATABASE_URL` w pliku `.env`
3. Zweryfikuj dane logowania do bazy

### Problem: "Port 8000 already in use"
**Rozwiązanie:**
```bash
# Znajdź proces używający portu
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Zabij proces
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### Problem: "Module not found" (Python)
**Rozwiązanie:**
```bash
# Upewnij się że środowisko wirtualne jest aktywne
which python  # Powinno wskazywać na venv

# Zainstaluj ponownie zależności
pip install -r requirements.txt
```

### Problem: "Command 'alembic' not found"
**Rozwiązanie:**
```bash
# Zainstaluj alembic
pip install alembic

# Lub zainstaluj wszystkie zależności
pip install -r requirements.txt
```

### Problem: Frontend nie łączy się z backendem
**Rozwiązanie:**
1. Sprawdź czy backend działa: http://localhost:8000/docs
2. Sprawdź plik `frontend/.env` - `VITE_API_URL`
3. Sprawdź CORS w `backend/app/core/config.py`
4. Wyczyść cache przeglądarki i localStorage

### Problem: "ModuleNotFoundError: No module named 'app'"
**Rozwiązanie:**
```bash
# Upewnij się że jesteś w katalogu backend
cd backend

# Sprawdź PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Uruchom ponownie
uvicorn app.main:app --reload
```

### Problem: Docker "Cannot connect to Docker daemon"
**Rozwiązanie:**
```bash
# Uruchom Docker daemon
sudo systemctl start docker  # Linux
# lub otwórz Docker Desktop (Windows/macOS)

# Dodaj użytkownika do grupy docker (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🔐 Bezpieczeństwo (Production)

### Zmień domyślne hasła
1. Zmień `JWT_SECRET` na silny, losowy ciąg znaków (min. 32 znaki)
2. Zmień hasło do bazy danych
3. Usuń/zmień domyślne konto testowe

### Generowanie silnego JWT_SECRET
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### HTTPS
W produkcji używaj:
- Nginx lub Traefik jako reverse proxy
- Certyfikaty SSL (Let's Encrypt)
- HTTPS dla wszystkich połączeń

### Zmienne środowiskowe
Nigdy nie commituj plików `.env` do repozytorium!

---

## 📊 Weryfikacja instalacji

### Sprawdź backend
```bash
curl http://localhost:8000/health
# Oczekiwana odpowiedź: {"status":"healthy"}
```

### Sprawdź bazę danych
```bash
# Docker
docker compose exec db psql -U postgres -d therapyassistance -c "\dt"

# Lokalnie
psql -U therapyuser -d therapyassistance -c "\dt"
```

Powinieneś zobaczyć tabele:
- users
- patients
- appointments
- session_notes
- payments
- payment_appointments
- alembic_version

### Sprawdź frontend
Otwórz http://localhost:5173 - powinieneś zobaczyć stronę logowania.

---

## 🔄 Aktualizacja

### Docker
```bash
# Zatrzymaj kontenery
docker compose down

# Pobierz najnowsze zmiany
git pull

# Zbuduj i uruchom ponownie
docker compose up --build
```

### Lokalna instalacja
```bash
# Backend
cd backend
git pull
pip install -r requirements.txt
alembic upgrade head

# Frontend
cd frontend
git pull
npm install
```

---

## 📝 Następne kroki

Po zainstalowaniu:
1. Zaloguj się do aplikacji
2. Przejrzyj dokumentację: `PAYMENTS_MODULE.md`
3. Sprawdź Swagger docs: http://localhost:8000/docs
4. Zapoznaj się z przykładowymi danymi
5. Rozpocznij konfigurację dla swojej praktyki

---

## 💡 Wsparcie

- Dokumentacja modułu płatności: [PAYMENTS_MODULE.md](./PAYMENTS_MODULE.md)
- Swagger API docs: http://localhost:8000/docs
- Reguły projektu: [.rules](./.rules)

Powodzenia! 🎉