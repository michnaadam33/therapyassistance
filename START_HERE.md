# 🚀 START HERE - Wdrożenie Backend na mikr.us

**Aplikacja:** TherapyAssistance Backend  
**Cel:** Wdrożenie na mikr.us **BEZ Dockera**  
**URL docelowy:** https://api.therapyassistance.io  
**Baza danych:** PostgreSQL (z konfiguracji w .env)

---

## 📌 Co zostało przygotowane?

✅ **Wszystkie skrypty wdrożeniowe są gotowe!**

Utworzone pliki:
- ✅ `setup-mikrus.sh` - automatyczna instalacja
- ✅ `start-mikrus.sh` - skrypt startowy
- ✅ `therapyassistance.service` - konfiguracja systemd
- ✅ `nginx-mikrus-http.conf` - konfiguracja nginx
- ✅ `.env.production` - szablon konfiguracji (MUSISZ WYPEŁNIĆ!)
- ✅ Pełna dokumentacja wdrożenia

---

## ⚡ Szybki start (3 kroki)

### 1️⃣ Przygotuj dane (lokalnie)

```bash
# Wygeneruj JWT Secret
openssl rand -hex 32
```

Zapisz wynik - będzie potrzebny w kroku 2.

**Przygotuj też dane z mikr.us:**
- Host bazy danych (z DATABASE_URL w .env)
- Port (z DATABASE_URL w .env)
- Username (z DATABASE_URL w .env)
- Password (z DATABASE_URL w .env)
- Nazwa bazy danych (z DATABASE_URL w .env)

Z Twojego pliku .env:
```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/therapyassistance
```

⚠️ **WAŻNE:** Musisz zmienić `db` na właściwy host Twojej bazy danych na mikr.us!

---

### 2️⃣ Wgraj kod na serwer

**Opcja A - przez SCP (z lokalnego komputera):**
```bash
scp -r ./therapyassistance twoj_user@twoj_server.mikr.us:~/
```

**Opcja B - przez Git (na serwerze):**
```bash
ssh twoj_user@twoj_server.mikr.us
cd ~
git clone https://github.com/your-repo/therapyassistance.git
```

---

### 3️⃣ Skonfiguruj i uruchom (na serwerze mikr.us)

```bash
# Zaloguj się na serwer
ssh twoj_user@twoj_server.mikr.us

# Przejdź do katalogu projektu
cd ~/therapyassistance

# KROK A: Utwórz plik konfiguracyjny produkcyjny
nano .env.production
```

**Wklej i DOSTOSUJ (zamień na swoje dane!):**

```env
# ⚠️ ZMIEŃ WARTOŚCI PONIŻEJ!

# Twoje dane bazy danych z mikr.us
# Format: postgresql+psycopg2://user:password@host:port/database
DATABASE_URL=postgresql+psycopg2://postgres:postgres@TWOJ_HOST:5432/therapyassistance

# Wygenerowany wcześniej JWT Secret
JWT_SECRET=tutaj_wklej_wygenerowany_secret

# Reszta konfiguracji
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Twoja domena frontendu (jeśli masz)
ALLOWED_ORIGINS=https://therapyassistance.io,https://api.therapyassistance.io
FRONTEND_URL=https://therapyassistance.io

# API config
API_V1_STR=/api/v1
PROJECT_NAME=TherapyAssistance
BACKEND_PORT=8000
ENVIRONMENT=production
```

Zapisz: `CTRL+O`, Enter, `CTRL+X`

```bash
# KROK B: Uruchom automatyczną instalację
chmod +x setup-mikrus.sh
./setup-mikrus.sh
```

Skrypt zrobi wszystko automatycznie:
- Utworzy virtual
 environment
- Zainstaluje zależności
- Sprawdzi połączenie z bazą danych
- Uruchomi migracje
- Zaproponuje załadowanie danych testowych

```bash
# KROK C: Test ręczny
./start-mikrus.sh
```

Jeśli zobaczysz `INFO: Uvicorn running on http://0.0.0.0:8000` - działa! ✅  
Naciśnij `CTRL+C` aby zatrzymać.

```bash
# KROK D: Skonfiguruj autostart (systemd)

# 1. Edytuj plik service
nano therapyassistance.service
# Zamień wszystkie wystąpienia YOUR_USERNAME_HERE na swoją nazwę użytkownika
# Zapisz i zamknij

# 2. Utwórz katalog na logi
mkdir -p ~/therapyassistance/logs

# 3. Zainstaluj i uruchom service
sudo cp therapyassistance.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable therapyassistance
sudo systemctl start therapyassistance

# 4. Sprawdź status
sudo systemctl status therapyassistance
```

Powinno pokazać: **● therapyassistance.service - active (running)** ✅

---

## 🌐 OPCJONALNIE: Konfiguracja domeny z nginx

Jeśli chcesz aby API było dostępne pod https://api.therapyassistance.io:

```bash
# 1. Skonfiguruj nginx
sudo cp nginx-mikrus-http.conf /etc/nginx/sites-available/therapyassistance
sudo ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 2. Zainstaluj SSL (Let's Encrypt)
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.therapyassistance.io
```

---

## ✅ Weryfikacja

### Test lokalny (na serwerze):
```bash
curl http://localhost:8000/health
```
Wynik: `{"status":"healthy"}` ✅

### Test przez domenę (jeśli skonfigurowałeś nginx):
```bash
curl https://api.therapyassistance.io/health
```

### Sprawdź Swagger UI w przeglądarce:
```
https://api.therapyassistance.io/docs
```

### Test rejestracji:
```bash
curl -X POST https://api.therapyassistance.io/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Jeśli dostaniesz token - **wszystko działa!** 🎉

---

## 📚 Dokumentacja

### Dla szybkiego startu (15 minut):
👉 **[QUICK_DEPLOY_MIKRUS.md](./QUICK_DEPLOY_MIKRUS.md)**

### Pełna dokumentacja z troubleshootingiem:
👉 **[MIKRUS_DEPLOYMENT.md](./MIKRUS_DEPLOYMENT.md)**

### Przegląd projektu:
👉 **[README_MIKRUS.md](./README_MIKRUS.md)**

### Lista wszystkich plików:
👉 **[MIKRUS_FILES.md](./MIKRUS_FILES.md)**

### Testy API (curl):
👉 **[API_TEST_COMMANDS.md](./API_TEST_COMMANDS.md)**

---

## 🔧 Zarządzanie aplikacją

```bash
# Status
sudo systemctl status therapyassistance

# Restart
sudo systemctl restart therapyassistance

# Stop
sudo systemctl stop therapyassistance

# Logi na żywo
tail -f ~/therapyassistance/logs/backend.log

# Logi systemd
sudo journalctl -u therapyassistance -f
```

---

## 🆘 Problemy?

### Aplikacja nie startuje
```bash
sudo journalctl -u therapyassistance -n 50 --no-pager
tail -n 50 ~/therapyassistance/logs/backend.error.log
```

### Błąd połączenia z bazą danych
```bash
# Sprawdź DATABASE_URL w .env.production
nano ~/therapyassistance/.env.production

# Sprawdź PostgreSQL
sudo systemctl status postgresql
```

### 502 Bad Gateway
```bash
# Sprawdź czy backend działa
curl http://localhost:8000/health

# Sprawdź nginx
sudo tail -f /var/log/nginx/therapyassistance-error.log
```

**Więcej rozwiązań:** [MIKRUS_DEPLOYMENT.md](./MIKRUS_DEPLOYMENT.md) - sekcja Troubleshooting

---

## ✅ Checklist

- [ ] JWT_SECRET wygenerowany
- [ ] Dane bazy danych z mikr.us przygotowane
- [ ] Kod wgrany na serwer
- [ ] Plik `.env.production` utworzony z PRAWDZIWYMI danymi
- [ ] `setup-mikrus.sh` uruchomiony pomyślnie
- [ ] Test ręczny działa (`./start-mikrus.sh`)
- [ ] Systemd service skonfigurowany
- [ ] Status: active (running) ✅
- [ ] API odpowiada na `/health`
- [ ] (Opcjonalnie) Nginx skonfigurowany
- [ ] (Opcjonalnie) SSL zainstalowany

---

## 🎯 Co dalej?

Po pomyślnym wdrożeniu:

1. **Przetestuj wszystkie endpointy** - użyj [API_TEST_COMMANDS.md](./API_TEST_COMMANDS.md)
2. **Skonfiguruj backup bazy danych** - instrukcje w [MIKRUS_DEPLOYMENT.md](./MIKRUS_DEPLOYMENT.md)
3. **Ustaw monitoring** - instrukcje w [MIKRUS_DEPLOYMENT.md](./MIKRUS_DEPLOYMENT.md)
4. **Wdróż frontend** na https://therapyassistance.io

---

## 📞 Ważne pliki

| Plik | Opis |
|------|------|
| `.env.production` | ⚠️ MUSISZ UTWORZYĆ - konfiguracja produkcyjna |
| `setup-mikrus.sh` | Automatyczna instalacja |
| `start-mikrus.sh` | Ręczne uruchomienie (do testów) |
| `therapyassistance.service` | Konfiguracja systemd (autostart) |
| `nginx-mikrus-http.conf` | Konfiguracja nginx |

---

## 🚀 Zaczynaj tutaj:

1. Przeczytaj ten plik (`START_HERE.md`) ← **Jesteś tutaj**
2. Przejdź do: **[QUICK_DEPLOY_MIKRUS.md](./QUICK_DEPLOY_MIKRUS.md)**
3. Wykonaj kroki 1-2-3 z sekcji "Szybki start" powyżej
4. Gotowe! 🎉

---

**Powodzenia z wdrożeniem! Jeśli masz pytania, sprawdź dokumentację w plikach .md**