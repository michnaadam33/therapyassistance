# Wdrożenie TherapyAssistance Backend na mikr.us

Kompletny przewodnik wdrożenia aplikacji TherapyAssistance na serwerze mikr.us bez użycia Dockera.

## Spis treści

1. [Wymagania wstępne](#wymagania-wstępne)
2. [Przygotowanie bazy danych](#przygotowanie-bazy-danych)
3. [Wgranie kodu na serwer](#wgranie-kodu-na-serwer)
4. [Konfiguracja środowiska](#konfiguracja-środowiska)
5. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
6. [Konfiguracja systemd](#konfiguracja-systemd)
7. [Konfiguracja nginx (opcjonalnie)](#konfiguracja-nginx)
8. [Weryfikacja](#weryfikacja)
9. [Troubleshooting](#troubleshooting)

---

## Wymagania wstępne

- Serwer mikr.us z systemem Linux
- Python 3.9 lub nowszy
- PostgreSQL (baza danych powinna być już skonfigurowana)
- Dostęp SSH do serwera
- Domena `api.therapyassistance.io` skierowana na serwer

## Przygotowanie bazy danych

### 1. Sprawdź dane dostępowe do bazy danych

W panelu mikr.us znajdź:
- Host bazy danych (zazwyczaj `localhost` lub adres IP)
- Port (zazwyczaj `5432`)
- Nazwa użytkownika
- Hasło
- Nazwa bazy danych

### 2. Zapisz connection string

Będzie potrzebny w formacie:
```
postgresql+psycopg2://username:password@host:5432/database_name
```

Przykład:
```
postgresql+psycopg2://therapyuser:SecurePass123@localhost:5432/therapyassistance
```

---

## Wgranie kodu na serwer

### Opcja 1: Przez Git (zalecane)

```bash
# Zaloguj się na serwer
ssh your_username@your_server.mikr.us

# Przejdź do katalogu domowego
cd ~

# Sklonuj repozytorium (jeśli używasz Git)
git clone https://github.com/your-repo/therapyassistance.git

# LUB utwórz katalog ręcznie
mkdir -p therapyassistance
```

### Opcja 2: Przez SCP/SFTP

```bash
# Z lokalnego komputera
scp -r ./therapyassistance your_username@your_server.mikr.us:~/
```

### Opcja 3: Przez FTP

Użyj klienta FTP (FileZilla, WinSCP) i prześlij cały folder `therapyassistance`.

---

## Konfiguracja środowiska

### 1. Utwórz plik `.env.production`

```bash
cd ~/therapyassistance
nano .env.production
```

### 2. Wpisz konfigurację produkcyjną

```env
# Production Database configuration for mikr.us
DATABASE_URL=postgresql+psycopg2://your_db_user:your_db_password@your_db_host:5432/therapyassistance

# JWT configuration
# Generate with: openssl rand -hex 32
JWT_SECRET=your_generated_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS configuration (frontend URL)
FRONTEND_URL=https://therapyassistance.io

# API configuration
API_V1_STR=/api/v1
PROJECT_NAME=TherapyAssistance

# Application settings
BACKEND_PORT=8000

# Environment
ENVIRONMENT=production
```

### 3. Wygeneruj bezpieczny JWT_SECRET

```bash
openssl rand -hex 32
```

Skopiuj wynik i wklej jako wartość `JWT_SECRET` w `.env.production`.

### 4. Zapisz i zamknij plik

W nano: `CTRL+O`, `Enter`, `CTRL+X`

---

## Instalacja i uruchomienie

### 1. Uruchom skrypt setupu

```bash
cd ~/therapyassistance
chmod +x setup-mikrus.sh
./setup-mikrus.sh
```

Skrypt automatycznie:
- Sprawdzi wersję Pythona
- Utworzy środowisko wirtualne
- Zainstaluje zależności
- Sprawdzi połączenie z bazą danych
- Uruchomi migracje
- (Opcjonalnie) Załaduje dane testowe

### 2. Test ręcznego uruchomienia

```bash
cd ~/therapyassistance
./start-mikrus.sh
```

Jeśli wszystko działa poprawnie, zobaczysz:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Naciśnij `CTRL+C` aby zatrzymać.

---

## Konfiguracja systemd

Aby aplikacja uruchamiała się automatycznie po restarcie serwera.

### 1. Edytuj plik service

```bash
cd ~/therapyassistance
nano therapyassistance.service
```

### 2. Zastąp `YOUR_USERNAME_HERE` swoją nazwą użytkownika

Przykład:
```ini
[Unit]
Description=TherapyAssistance FastAPI Backend
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=john
Group=john
WorkingDirectory=/home/john/therapyassistance/backend
Environment="PATH=/home/john/therapyassistance/backend/venv/bin"
EnvironmentFile=/home/john/therapyassistance/.env.production
ExecStart=/home/john/therapyassistance/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 --log-level info --proxy-headers --forwarded-allow-ips='*'
Restart=always
RestartSec=10
StandardOutput=append:/home/john/therapyassistance/logs/backend.log
StandardError=append:/home/john/therapyassistance/logs/backend.error.log

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 3. Utwórz katalog na logi

```bash
mkdir -p ~/therapyassistance/logs
```

### 4. Skopiuj plik service do systemd

```bash
sudo cp ~/therapyassistance/therapyassistance.service /etc/systemd/system/
```

### 5. Przeładuj systemd i uruchom usługę

```bash
# Przeładuj konfigurację
sudo systemctl daemon-reload

# Włącz autostart
sudo systemctl enable therapyassistance

# Uruchom usługę
sudo systemctl start therapyassistance

# Sprawdź status
sudo systemctl status therapyassistance
```

### 6. Sprawdź logi

```bash
# Logi aplikacji
tail -f ~/therapyassistance/logs/backend.log

# Logi błędów
tail -f ~/therapyassistance/logs/backend.error.log

# Logi systemd
sudo journalctl -u therapyassistance -f
```

---

## Konfiguracja nginx

Jeśli chcesz używać domeny `https://api.therapyassistance.io`:

### 1. Utwórz konfigurację nginx

```bash
sudo nano /etc/nginx/sites-available/therapyassistance
```

### 2. Wklej konfigurację

```nginx
server {
    listen 80;
    server_name api.therapyassistance.io;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.therapyassistance.io;

    # SSL certificates (use Let's Encrypt - see below)
    ssl_certificate /etc/letsencrypt/live/api.therapyassistance.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.therapyassistance.io/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Increase timeouts
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
    send_timeout 300;

    # Logging
    access_log /var/log/nginx/therapyassistance-access.log;
    error_log /var/log/nginx/therapyassistance-error.log;
}
```

### 3. Włącz konfigurację

```bash
sudo ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Skonfiguruj SSL z Let's Encrypt

```bash
# Zainstaluj certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Uzyskaj certyfikat
sudo certbot --nginx -d api.therapyassistance.io

# Certbot automatycznie skonfiguruje SSL w nginx
```

### 5. Automatyczne odnawianie certyfikatu

```bash
# Certbot tworzy automatyczny cron job
# Możesz przetestować odnowienie:
sudo certbot renew --dry-run
```

---

## Weryfikacja

### 1. Sprawdź czy aplikacja działa

```bash
curl http://localhost:8000/health
```

Powinno zwrócić:
```json
{"status":"healthy"}
```

### 2. Sprawdź przez domenę (jeśli skonfigurowałeś nginx)

```bash
curl https://api.therapyassistance.io/health
```

### 3. Sprawdź dokumentację API

Otwórz w przeglądarce:
```
https://api.therapyassistance.io/docs
```

### 4. Test endpointu rejestracji

```bash
curl -X POST https://api.therapyassistance.io/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

## Troubleshooting

### Problem: Aplikacja nie startuje

**Sprawdź logi:**
```bash
sudo journalctl -u therapyassistance -n 50 --no-pager
tail -f ~/therapyassistance/logs/backend.error.log
```

**Typowe przyczyny:**
- Błędny `DATABASE_URL` w `.env.production`
- Baza danych nie jest dostępna
- Port 8000 zajęty przez inną aplikację
- Błędy w permissions

### Problem: Błąd połączenia z bazą danych

```bash
# Sprawdź czy PostgreSQL działa
sudo systemctl status postgresql

# Test połączenia
psql "postgresql://user:password@host:5432/database" -c "SELECT 1;"

# Sprawdź czy baza istnieje
sudo -u postgres psql -l
```

### Problem: Port 8000 zajęty

```bash
# Sprawdź co używa portu
sudo lsof -i :8000

# Zmień port w .env.production
BACKEND_PORT=8001
```

### Problem: CORS errors

Upewnij się, że `FRONTEND_URL` w `.env.production` zawiera właściwą domenę frontendu:
```env
FRONTEND_URL=https://therapyassistance.io
```

### Problem: 502 Bad Gateway (nginx)

```bash
# Sprawdź czy backend działa
curl http://localhost:8000/health

# Sprawdź logi nginx
sudo tail -f /var/log/nginx/therapyassistance-error.log

# Sprawdź czy nginx może łączyć się z backendem
sudo nginx -t
```

### Restart aplikacji

```bash
# Restart usługi
sudo systemctl restart therapyassistance

# Sprawdź status
sudo systemctl status therapyassistance

# Pełny restart (z przeładowaniem konfiguracji)
sudo systemctl daemon-reload
sudo systemctl restart therapyassistance
```

---

## Przydatne komendy

### Zarządzanie usługą

```bash
# Start
sudo systemctl start therapyassistance

# Stop
sudo systemctl stop therapyassistance

# Restart
sudo systemctl restart therapyassistance

# Status
sudo systemctl status therapyassistance

# Włącz autostart
sudo systemctl enable therapyassistance

# Wyłącz autostart
sudo systemctl disable therapyassistance
```

### Logi

```bash
# Logi aplikacji (ostatnie 100 linii)
tail -n 100 ~/therapyassistance/logs/backend.log

# Logi na żywo
tail -f ~/therapyassistance/logs/backend.log

# Logi systemd
sudo journalctl -u therapyassistance -f
```

### Migracje bazy danych

```bash
cd ~/therapyassistance/backend
source venv/bin/activate

# Sprawdź status migracji
alembic current

# Uruchom migracje
alembic upgrade head

# Cofnij ostatnią migrację
alembic downgrade -1

# Historia migracji
alembic history
```

### Aktualizacja aplikacji

```bash
# Przejdź do katalogu projektu
cd ~/therapyassistance

# Pobierz najnowszy kod (jeśli używasz Git)
git pull

# Aktywuj środowisko wirtualne
cd backend
source venv/bin/activate

# Zainstaluj nowe zależności (jeśli są)
pip install -r requirements.txt

# Uruchom migracje
alembic upgrade head

# Restart aplikacji
sudo systemctl restart therapyassistance
```

---

## Bezpieczeństwo

### 1. Firewall

Upewnij się, że firewall przepuszcza tylko niezbędne porty:

```bash
# Sprawdź status firewall
sudo ufw status

# Zezwól na SSH
sudo ufw allow 22/tcp

# Zezwól na HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Port 8000 NIE powinien być otwarty publicznie (tylko przez nginx)
```

### 2. Zmienne środowiskowe

- **Nigdy nie commituj** pliku `.env.production` do Git
- Używaj **silnych haseł** dla bazy danych
- Generuj **unikalny JWT_SECRET** dla produkcji

### 3. Aktualizacje

Regularnie aktualizuj system i zależności:

```bash
# System
sudo apt update && sudo apt upgrade

# Python packages
cd ~/therapyassistance/backend
source venv/bin/activate
pip list --outdated
pip install --upgrade [package_name]
```

---

## Monitoring

### 1. Sprawdź czy aplikacja działa

Utwórz prosty skrypt monitorujący:

```bash
nano ~/check-therapyassistance.sh
```

```bash
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$STATUS" != "200" ]; then
    echo "TherapyAssistance is DOWN! Status: $STATUS"
    # Opcjonalnie: wyślij email lub powiadomienie
else
    echo "TherapyAssistance is UP"
fi
```

```bash
chmod +x ~/check-therapyassistance.sh
```

### 2. Dodaj do crontab (sprawdzanie co 5 minut)

```bash
crontab -e
```

Dodaj linię:
```
*/5 * * * * /home/your_username/check-therapyassistance.sh >> /home/your_username/monitoring.log 2>&1
```

---

## Backup bazy danych

### Ręczny backup

```bash
# Backup
pg_dump "postgresql://user:password@host:5432/therapyassistance" > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql "postgresql://user:password@host:5432/therapyassistance" < backup_20240101_120000.sql
```

### Automatyczny backup (cron)

```bash
nano ~/backup-therapyassistance.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/$(whoami)/backups"
mkdir -p $BACKUP_DIR
pg_dump "postgresql://user:password@host:5432/therapyassistance" | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Usuń backupy starsze niż 30 dni
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x ~/backup-therapyassistance.sh

# Dodaj do crontab (codziennie o 2:00)
crontab -e
# Dodaj: 0 2 * * * /home/your_username/backup-therapyassistance.sh
```

---

## Kontakt i wsparcie

Jeśli masz problemy z wdrożeniem:

1. Sprawdź sekcję [Troubleshooting](#troubleshooting)
2. Przejrzyj logi aplikacji i systemd
3. Sprawdź dokumentację FastAPI i mikr.us

---

## Checklist wdrożenia

- [ ] Baza danych utworzona i dostępna
- [ ] Kod wgrany na serwer
- [ ] Plik `.env.production` utworzony z poprawnymi danymi
- [ ] JWT_SECRET wygenerowany
- [ ] Virtual environment utworzone
- [ ] Zależności zainstalowane
- [ ] Połączenie z bazą danych działa
- [ ] Migracje wykonane
- [ ] Aplikacja uruchamia się ręcznie
- [ ] Systemd service skonfigurowany
- [ ] Aplikacja uruchamia się automatycznie
- [ ] Nginx skonfigurowany (jeśli używany)
- [ ] SSL certyfikat zainstalowany
- [ ] Domena wskazuje na serwer
- [ ] API dostępne przez https://api.therapyassistance.io
- [ ] Dokumentacja Swagger działa
- [ ] CORS poprawnie skonfigurowany
- [ ] Monitoring skonfigurowany
- [ ] Backup skonfigurowany

---

**Powodzenia z wdrożeniem! 🚀**