# 📁 Pliki wdrożeniowe dla mikr.us

Ten dokument zawiera listę wszystkich plików niezbędnych do wdrożenia aplikacji TherapyAssistance Backend na serwerze mikr.us bez Dockera.

---

## 📋 Pliki konfiguracyjne

### 1. `.env.production` ⚠️ MUSISZ UTWORZYĆ
**Lokalizacja:** `therapyassistance/.env.production`  
**Opis:** Konfiguracja produkcyjna z danymi dostępowymi do bazy danych i sekretami  
**Status:** ❌ Nie istnieje - musisz utworzyć ręcznie

**Szablon:**
```env
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/therapyassistance
JWT_SECRET=wygeneruj_komendą_openssl_rand_hex_32
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
ALLOWED_ORIGINS=https://therapyassistance.io,https://api.therapyassistance.io
FRONTEND_URL=https://therapyassistance.io
API_V1_STR=/api/v1
PROJECT_NAME=TherapyAssistance
BACKEND_PORT=8000
ENVIRONMENT=production
```

---

## 🚀 Skrypty wdrożeniowe

### 2. `setup-mikrus.sh`
**Lokalizacja:** `therapyassistance/setup-mikrus.sh`  
**Opis:** Skrypt automatycznej instalacji i konfiguracji środowiska  
**Status:** ✅ Gotowy

**Co robi:**
- Tworzy wirtualne środowisko Python
- Instaluje wszystkie zależności z `requirements.txt`
- Testuje połączenie z bazą danych
- Uruchamia migracje Alembic
- Opcjonalnie ładuje dane testowe

**Użycie:**
```bash
chmod +x setup-mikrus.sh
./setup-mikrus.sh
```

---

### 3. `start-mikrus.sh`
**Lokalizacja:** `therapyassistance/start-mikrus.sh`  
**Opis:** Skrypt startowy aplikacji  
**Status:** ✅ Gotowy

**Co robi:**
- Aktywuje środowisko wirtualne
- Ładuje zmienne środowiskowe z `.env.production`
- Sprawdza połączenie z bazą danych
- Uruchamia migracje
- Startuje serwer uvicorn

**Użycie:**
```bash
chmod +x start-mikrus.sh
./start-mikrus.sh
```

---

## ⚙️ Systemd Service

### 4. `therapyassistance.service`
**Lokalizacja:** `therapyassistance/therapyassistance.service`  
**Docelowa lokalizacja:** `/etc/systemd/system/therapyassistance.service`  
**Opis:** Konfiguracja usługi systemd dla autostartowania  
**Status:** ✅ Gotowy (wymaga edycji)

**Wymagane zmiany:**
- Zamień wszystkie wystąpienia `YOUR_USERNAME_HERE` na swoją nazwę użytkownika

**Instalacja:**
```bash
# Edytuj nazwę użytkownika
nano therapyassistance.service

# Utwórz katalog na logi
mkdir -p ~/therapyassistance/logs

# Skopiuj do systemd
sudo cp therapyassistance.service /etc/systemd/system/

# Uruchom
sudo systemctl daemon-reload
sudo systemctl enable therapyassistance
sudo systemctl start therapyassistance
```

---

## 🌐 Konfiguracje Nginx

### 5. `nginx-mikrus-http.conf`
**Lokalizacja:** `therapyassistance/nginx-mikrus-http.conf`  
**Docelowa lokalizacja:** `/etc/nginx/sites-available/therapyassistance`  
**Opis:** Konfiguracja nginx dla HTTP (przed instalacją SSL)  
**Status:** ✅ Gotowy

**Instalacja:**
```bash
sudo cp nginx-mikrus-http.conf /etc/nginx/sites-available/therapyassistance
sudo ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Następny krok:** Po weryfikacji, zainstaluj SSL z certbot:
```bash
sudo certbot --nginx -d api.therapyassistance.io
```

---

## 📚 Dokumentacja

### 6. `QUICK_DEPLOY_MIKRUS.md`
**Lokalizacja:** `therapyassistance/QUICK_DEPLOY_MIKRUS.md`  
**Opis:** Szybki przewodnik wdrożenia (15 minut)  
**Status:** ✅ Gotowy

**Dla kogo:** Osoby chcące szybko wdrożyć aplikację z gotowymi komendami

---

### 7. `MIKRUS_DEPLOYMENT.md`
**Lokalizacja:** `therapyassistance/MIKRUS_DEPLOYMENT.md`  
**Opis:** Pełna dokumentacja wdrożenia z troubleshootingiem  
**Status:** ✅ Gotowy

**Zawiera:**
- Szczegółowe wyjaśnienia każdego kroku
- Rozwiązania problemów
- Konfiguracja bezpieczeństwa
- Monitoring i backup
- Zarządzanie aplikacją

---

### 8. `README_MIKRUS.md`
**Lokalizacja:** `therapyassistance/README_MIKRUS.md`  
**Opis:** Główny plik README dla wdrożenia na mikr.us  
**Status:** ✅ Gotowy

**Zawiera:**
- Przegląd projektu
- Wymagania
- Szybki start
- Zarządzanie
- Troubleshooting

---

### 9. `MIKRUS_FILES.md` (ten plik)
**Lokalizacja:** `therapyassistance/MIKRUS_FILES.md`  
**Opis:** Indeks wszystkich plików wdrożeniowych  
**Status:** ✅ Gotowy

---

## 📊 Podsumowanie plików

| Plik | Status | Wymaga edycji | Priorytet |
|------|--------|---------------|-----------|
| `.env.production` | ❌ Do utworzenia | ✅ TAK | 🔴 WYMAGANY |
| `setup-mikrus.sh` | ✅ Gotowy | ❌ NIE | 🔴 WYMAGANY |
| `start-mikrus.sh` | ✅ Gotowy | ❌ NIE | 🔴 WYMAGANY |
| `therapyassistance.service` | ✅ Gotowy | ✅ TAK (username) | 🔴 WYMAGANY |
| `nginx-mikrus-http.conf` | ✅ Gotowy | ❌ NIE | 🟡 OPCJONALNY |
| `QUICK_DEPLOY_MIKRUS.md` | ✅ Gotowy | ❌ NIE | 🟢 POMOCNICZY |
| `MIKRUS_DEPLOYMENT.md` | ✅ Gotowy | ❌ NIE | 🟢 POMOCNICZY |
| `README_MIKRUS.md` | ✅ Gotowy | ❌ NIE | 🟢 POMOCNICZY |

---

## 🎯 Kolejność wdrożenia

### Krok 1: Przygotowanie (lokalnie)
1. Wygeneruj JWT Secret:
   ```bash
   openssl rand -hex 32
   ```
2. Przygotuj dane dostępowe do bazy danych z panelu mikr.us

### Krok 2: Wgranie kodu
3. Wgraj cały folder `therapyassistance` na serwer (git/scp/ftp)

### Krok 3: Konfiguracja (na serwerze)
4. Utwórz `.env.production` z danymi z kroku 1-2
5. Uruchom `./setup-mikrus.sh`
6. Test: `./start-mikrus.sh` (potem CTRL+C)

### Krok 4: Autostart
7. Edytuj `therapyassistance.service` (zamień username)
8. Skopiuj do systemd i uruchom
9. Sprawdź status: `sudo systemctl status therapyassistance`

### Krok 5: Domena (opcjonalnie)
10. Skonfiguruj nginx z `nginx-mikrus-http.conf`
11. Zainstaluj SSL z certbot
12. Test: `curl https://api.therapyassistance.io/health`

---

## ✅ Checklist przed wdrożeniem

### Przygotowane lokalnie
- [ ] JWT_SECRET wygenerowany
- [ ] Dane dostępowe do bazy danych z mikr.us
- [ ] Domena `api.therapyassistance.io` skierowana na serwer

### Pliki na serwerze
- [ ] Cały katalog `therapyassistance` wgrany
- [ ] Plik `.env.production` utworzony
- [ ] Skrypty executable: `chmod +x *.sh`

### Instalacja
- [ ] `setup-mikrus.sh` uruchomiony pomyślnie
- [ ] Virtual environment utworzone w `backend/venv/`
- [ ] Migracje wykonane
- [ ] Test ręczny działa

### Autostart
- [ ] `therapyassistance.service` edytowany (username)
- [ ] Katalog `logs/` utworzony
- [ ] Service zainstalowany w systemd
- [ ] Service włączony i uruchomiony
- [ ] Status: active (running)

### Nginx + SSL (opcjonalnie)
- [ ] Nginx skonfigurowany
- [ ] SSL certyfikat zainstalowany
- [ ] API odpowiada na https://

---

## 🆘 Pomoc

### Szybki start
📄 **[QUICK_DEPLOY_MIKRUS.md](./QUICK_DEPLOY_MIKRUS.md)**

### Pełna dokumentacja
📄 **[MIKRUS_DEPLOYMENT.md](./MIKRUS_DEPLOYMENT.md)**

### Ogólne info
📄 **[README_MIKRUS.md](./README_MIKRUS.md)**

---

## 📝 Notatki

### Co NIE jest potrzebne na mikr.us
- ❌ `docker-compose.yml` - nie używamy Dockera
- ❌ `Dockerfile` - nie używamy Dockera
- ❌ `.dockerignore` - nie używamy Dockera

### Co JEST potrzebne
- ✅ Python 3.9+
- ✅ PostgreSQL (z panelu mikr.us)
- ✅ Virtual environment (tworzone przez `setup-mikrus.sh`)
- ✅ Nginx (opcjonalnie, do obsługi domeny)
- ✅ Systemd (do autostartowania)

---

**Wszystko gotowe do wdrożenia! 🚀**

Zacznij od: **[QUICK_DEPLOY_MIKRUS.md](./QUICK_DEPLOY_MIKRUS.md)**