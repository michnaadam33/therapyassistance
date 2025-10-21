# TherapyAssistance - System Zarządzania dla Psychoterapeutów

Pełna aplikacja webowa (backend + frontend) umożliwiająca psychoterapeutom zarządzanie pacjentami, wizytami i notatkami z sesji terapeutycznych.

## 🚀 Szybki Start

### Uruchomienie aplikacji (Docker Compose)

```bash
# Sklonuj repozytorium
git clone <repository-url>
cd therapyassistance

# Skopiuj plik .env
cp .env.example .env

# Uruchom aplikację
docker compose up --build
```

Aplikacja będzie dostępna pod adresami:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Dokumentacja API (Swagger):** http://localhost:8000/docs

### Dane logowania (demo)

```
Email: terapeuta@example.com
Hasło: haslo123
```

## 📋 Funkcjonalności

### Zarządzanie Pacjentami
- ✅ Dodawanie nowych pacjentów
- ✅ Edycja danych pacjentów
- ✅ Przeglądanie listy pacjentów
- ✅ Usuwanie pacjentów
- ✅ Wyszukiwanie pacjentów

### Zarządzanie Wizytami
- ✅ Planowanie wizyt
- ✅ Edycja terminów wizyt
- ✅ Przeglądanie kalendarza wizyt
- ✅ Usuwanie wizyt
- ✅ Sprawdzanie konfliktów terminów

### Notatki z Sesji
- ✅ Tworzenie notatek dla każdego pacjenta
- ✅ Przeglądanie historii notatek
- ✅ Usuwanie notatek

### Bezpieczeństwo
- ✅ Uwierzytelnianie JWT
- ✅ Zabezpieczone endpointy API
- ✅ Hashowanie haseł (bcrypt)

## 🛠 Stack Technologiczny

### Backend
- **Framework:** FastAPI
- **Baza danych:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migracje:** Alembic
- **Walidacja:** Pydantic
- **Serwer:** Uvicorn
- **Autoryzacja:** JWT

### Frontend
- **Framework:** React 18 + TypeScript
- **Bundler:** Vite
- **Stylowanie:** TailwindCSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Formularze:** React Hook Form
- **Komponenty UI:** Custom components inspired by shadcn/ui

### DevOps
- **Konteneryzacja:** Docker
- **Orkiestracja:** Docker Compose
- **Serwer WWW:** Nginx (dla frontendu)

## 📁 Struktura Projektu

```
therapyassistance/
├── backend/
│   ├── app/
│   │   ├── core/           # Konfiguracja, bezpieczeństwo, baza danych
│   │   ├── models/         # Modele SQLAlchemy
│   │   ├── schemas/        # Schematy Pydantic
│   │   ├── routers/        # Endpointy API
│   │   ├── services/       # Logika biznesowa
│   │   └── main.py         # Główny plik aplikacji
│   ├── alembic/            # Migracje bazy danych
│   ├── Dockerfile
│   ├── requirements.txt
│   └── seed.py             # Skrypt wypełniający bazę przykładowymi danymi
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Komponenty React
│   │   ├── pages/          # Strony aplikacji
│   │   ├── services/       # Usługi API
│   │   ├── contexts/       # Konteksty React (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # Typy TypeScript
│   │   └── lib/            # Narzędzia pomocnicze
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Rozwój Lokalny

### Backend (bez Dockera)

```bash
cd backend

# Utwórz wirtualne środowisko
python -m venv venv
source venv/bin/activate  # Linux/Mac
# lub
venv\Scripts\activate  # Windows

# Zainstaluj zależności
pip install -r requirements.txt

# Skonfiguruj bazę danych PostgreSQL
# Zaktualizuj DATABASE_URL w .env

# Uruchom migracje
alembic upgrade head

# Wypełnij bazę przykładowymi danymi
python seed.py

# Uruchom serwer
uvicorn app.main:app --reload --port 8000
```

### Frontend (bez Dockera)

```bash
cd frontend

# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev
```

## 📚 API Endpoints

### Autoryzacja
- `POST /auth/register` - Rejestracja nowego użytkownika
- `POST /auth/login` - Logowanie (zwraca token JWT)

### Pacjenci
- `GET /patients` - Lista wszystkich pacjentów
- `GET /patients/{id}` - Szczegóły pacjenta
- `POST /patients` - Dodanie nowego pacjenta
- `PUT /patients/{id}` - Aktualizacja danych pacjenta
- `DELETE /patients/{id}` - Usunięcie pacjenta

### Wizyty
- `GET /appointments` - Lista wszystkich wizyt
- `GET /appointments/{id}` - Szczegóły wizyty
- `POST /appointments` - Dodanie nowej wizyty
- `PUT /appointments/{id}` - Aktualizacja wizyty
- `DELETE /appointments/{id}` - Usunięcie wizyty

### Notatki z Sesji
- `GET /session_notes/{patient_id}` - Lista notatek dla pacjenta
- `POST /session_notes` - Dodanie nowej notatki
- `DELETE /session_notes/{id}` - Usunięcie notatki

## 🔒 Zmienne Środowiskowe

Plik `.env` powinien zawierać:

```env
# Baza danych
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/therapyassistance

# JWT
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# PostgreSQL (dla docker-compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=therapyassistance
```

## 🧪 Testowanie

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm run test
```

## 📦 Budowanie dla Produkcji

### Backend
```bash
docker build -t therapyassistance-backend ./backend
```

### Frontend
```bash
docker build -t therapyassistance-frontend ./frontend
```

### Docker Compose
```bash
docker compose -f docker-compose.yml up --build -d
```

## 🤝 Wkład w Projekt

1. Fork repozytorium
2. Stwórz branch dla nowej funkcjonalności (`git checkout -b feature/AmazingFeature`)
3. Commit zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest licencjonowany na podstawie licencji MIT - zobacz plik LICENSE dla szczegółów.

## 👥 Autorzy

- TherapyAssistance Team

## 🙏 Podziękowania

- FastAPI za świetny framework
- React Team za React
- Wszystkim kontrybutorów open source

## 📞 Kontakt

W razie pytań lub problemów, proszę otworzyć issue w repozytorium.

---

**Uwaga:** To jest aplikacja demonstracyjna. Przed użyciem w środowisku produkcyjnym należy:
- Zmienić JWT_SECRET na silny, losowy klucz
- Skonfigurować odpowiednie CORS origins
- Dodać HTTPS
- Skonfigurować odpowiednie backupy bazy danych
- Dodać monitoring i logi
- Przeprowadzić audyt bezpieczeństwa