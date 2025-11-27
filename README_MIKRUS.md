# 🚀 Wdrożenie TherapyAssistance Backend na mikr.us

## Szybki start

To repozytorium zawiera backend aplikacji TherapyAssistance przygotowany do wdrożenia na serwerze mikr.us **bez użycia Dockera**.

API będzie dostępne pod adresem: **https://api.therapyassistance.io**

---

## 📋 Wymagania

- Serwer mikr.us z systemem Linux
- Python 3.9+
- PostgreSQL (baza danych z panelu mikr.us)
- Domena `api.therapyassistance.io` skierowana na serwer
- Dostęp SSH

---

## 🎯 Przewodniki wdrożenia

### Szybki start (15 minut)
📄 **[QUICK_DEPLOY_MIKRUS.md](./QUICK_DEPLOY_MIKRUS.md)** - Krok po kroku, gotowe komendy

### Pełna dokumentacja
📄 **[MIKRUS_DEPLOYMENT.md](./MIKRUS_DEPLOYMENT.md)** - Szczegółowa dokumentacja z troubleshootingiem

---

## ⚡ Instalacja w 3 krokach

### 1. Przygotowanie (lokalnie)

Wygeneruj JWT Secret:
```bash
openssl rand -hex 32
```

### 2. Wgraj kod na serwer

```bash
# Opcja A: Git
ssh user@server.mikr.us
git clone https://github.com/your-repo/therapyassistance.git

# Opcja B: SCP
scp -r ./therapyassistance user@server.mikr.us:~/
```

### 3. Uruchom instalację

Na serwerze mikr.us:

```bash
cd ~/therapyassistance

# Utwórz plik .env.production z danymi dostępowymi
nano .env.production
```

Wklej konfigurację (zastąp wartościami):
```env
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/therapyassistance
JWT_SECRET=your_generated_secret_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
ALLOWED_ORIGINS=https://therapyassistance.io,https://api.therapyassistance.io
FRONTEND_URL=https://therapyassistance.io
API_V1_STR=/api/v1
PROJECT_NAME=TherapyAssistance
BACKEND_PORT=8000
ENVIRONMENT=production
```

Uruchom setup:
```bash
chmod +x setup-mikrus.sh
./setup-mikrus.sh
```

Skonfiguruj autostart:
```bash
# Edytuj plik service (zamień YOUR_USERNAME_HERE)
nano therapyassistance.service

# Utwórz katalog na logi
mkdir -p ~/therapyassistance/logs

# Zainstaluj service
sudo cp therapyassistance.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable therapyassistance
sudo systemctl start therapyassistance

# Sprawdź status
sudo systemctl status therapyassistance
```

---

## 🌐 Konfiguracja nginx + SSL

```bash
# Utwórz konfigurację nginx
sudo nano /etc/nginx/sites-available/therapyassistance
```

Wklej:
```nginx
server {
    listen 80;
    server_name api.therapyassistance.io;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    access_log /var/log/nginx/therapyassistance-access.log;
    error_log /var/log/nginx/therapyassistance-error.log;
}
```

Włącz i zainstaluj SSL:
```bash
sudo ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL certyfikat
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.therapyassistance.io
```

---

## ✅ Weryfikacja

```bash
# Test lokalny
curl http://localhost:8000/health
# Wynik: {"status":"healthy"}

# Test przez domenę
curl https://api.therapyassistance.io/health

# Swagger UI
# https://api.therapyassistance.io/docs
```

---

## 📁 Struktura plików wdrożeniowych

```
therapyassistance/
├── .env.production              # Konfiguracja produkcyjna (UTWÓRZ TEN PLIK!)
├── setup-mikrus.sh              # Skrypt instalacyjny
├── start-mikrus.sh              # Skrypt startowy
├── therapyassistance.service    # Systemd service
├── QUICK_DEPLOY_MIKRUS.md       # Szybki przewodnik
├── MIKRUS_DEPLOYMENT.md         # Pełna dokumentacja
└── backend/
    ├── app/
    ├── requirements.txt
    └── alembic.ini
```

---

## 🔧 Zarządzanie aplikacją

### Komendy systemd

```bash
# Status
sudo systemctl status therapyassistance

# Start
sudo systemctl start therapyassistance

# Stop
sudo systemctl stop therapyassistance

# Restart
sudo systemctl restart therapyassistance

# Włącz autostart
sudo systemctl enable therapyassistance

# Wyłącz autostart
sudo systemctl disable therapyassistance
```

### Logi

```bash
# Logi aplikacji
tail -f ~/therapyassistance/logs/backend.log
tail -f ~/therapyassistance/logs/backend.error.log

# Logi systemd
sudo journalctl -u therapyassistance -f

# Ostatnie 50 linii
sudo journalctl -u therapyassistance -n 50 --no-pager
```

### Migracje bazy danych

```bash
cd ~/therapyassistance/backend
source venv/bin/activate

# Status migracji
alembic current

# Uruchom migracje
alembic upgrade head

# Cofnij migrację
alembic downgrade -1

# Historia
alembic history
```

---

## 🔄 Aktualizacja aplikacji

```bash
cd ~/therapyassistance

# Pobierz nowy kod (jeśli Git)
git pull

# Aktywuj środowisko
cd backend
source venv/bin/activate

# Zainstaluj nowe zależności
pip install -r requirements.txt

# Uruchom migracje
alembic upgrade head

# Restart
sudo systemctl restart therapyassistance
```

---

## 🆘 Troubleshooting

### Aplikacja nie startuje

```bash
# Sprawdź logi
sudo journalctl -u therapyassistance -n 50 --no-pager
tail -n 50 ~/therapyassistance/logs/backend.error.log

# Typowe przyczyny:
# - Błędny DATABASE_URL
# - Baza danych niedostępna
# - Port 8000 zajęty
# - Błędy permissions
```

### Błąd połączenia z bazą danych

```bash
# Sprawdź PostgreSQL
sudo systemctl status postgresql

# Test połączenia
cd ~/therapyassistance/backend
source venv/bin/activate
python3 -c "from app.core.database import engine; engine.connect()"

# Sprawdź .env.production
nano ~/therapyassistance/.env.production
```

### 502 Bad Gateway

```bash
# Sprawdź backend
curl http://localhost:8000/health

# Sprawdź nginx
sudo nginx -t
sudo tail -f /var/log/nginx/therapyassistance-error.log

# Restart nginx
sudo systemctl restart nginx
```

### Port zajęty

```bash
# Sprawdź co używa portu
sudo lsof -i :8000

# Zmień port w .env.production
nano ~/therapyassistance/.env.production
# BACKEND_PORT=8001
```

---

## 🔒 Bezpieczeństwo

### Firewall

```bash
# Sprawdź status
sudo ufw status

# Otwórz tylko niezbędne porty
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Port 8000 NIE powinien być otwarty publicznie!
```

### Zmienne środowiskowe

- ❌ **NIGDY** nie commituj `.env.production` do Git
- ✅ Używaj **silnych haseł** dla bazy danych
- ✅ Generuj **unikalny JWT_SECRET** dla produkcji

```bash
# Dodaj do .gitignore
echo ".env.production" >> .gitignore
```

---

## 📊 Monitoring

### Prosty health check

```bash
nano ~/check-health.sh
```

```bash
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$STATUS" != "200" ]; then
    echo "❌ API DOWN! Status: $STATUS"
else
    echo "✅ API UP"
fi
```

```bash
chmod +x ~/check-health.sh

# Dodaj do crontab (co 5 minut)
crontab -e
# Dodaj: */5 * * * * /home/your_username/check-health.sh >> /home/your_username/monitoring.log 2>&1
```

---

## 💾 Backup bazy danych

### Ręczny backup

```bash
# Backup
pg_dump "postgresql://user:pass@host:5432/therapyassistance" > backup_$(date +%Y%m%d_%H%M%S).sql

# Kompresja
gzip backup_20240101_120000.sql

# Restore
gunzip backup_20240101_120000.sql.gz
psql "postgresql://user:pass@host:5432/therapyassistance" < backup_20240101_120000.sql
```

### Automatyczny backup (cron)

```bash
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/$(whoami)/backups"
mkdir -p $BACKUP_DIR

# Backup z kompresją
pg_dump "postgresql://user:pass@host:5432/therapyassistance" | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Usuń stare backupy (starsze niż 30 dni)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $(date)"
```

```bash
chmod +x ~/backup-db.sh

# Codziennie o 2:00
crontab -e
# Dodaj: 0 2 * * * /home/your_username/backup-db.sh >> /home/your_username/backup.log 2>&1
```

---

## 📚 Dokumentacja API

Po wdrożeniu, dokumentacja Swagger będzie dostępna pod:

- **Swagger UI**: https://api.therapyassistance.io/docs
- **ReDoc**: https://api.therapyassistance.io/redoc

### Główne endpointy:

```
GET  /                              # Welcome message
GET  /health                        # Health check
POST /api/v1/auth/register         # Rejestracja użytkownika
POST /api/v1/auth/login            # Logowanie
GET  /api/v1/patients              # Lista pacjentów
POST /api/v1/patients              # Dodaj pacjenta
GET  /api/v1/appointments          # Lista wizyt
POST /api/v1/appointments          # Dodaj wizytę
GET  /api/v1/session_notes/{id}    # Notatki z sesji
POST /api/v1/session_notes         # Dodaj notatkę
```

---

## 📞 Pomoc

### Dokumenty pomocnicze

1. **[QUICK_DEPLOY_MIKRUS.md](./QUICK_DEPLOY_MIKRUS.md)** - Szybki start
2. **[MIKRUS_DEPLOYMENT.md](./MIKRUS_DEPLOYMENT.md)** - Pełna dokumentacja
3. **[README.md](./README.md)** - Dokumentacja projektu
4. **[FAQ.md](./FAQ.md)** - Często zadawane pytania

### Przydatne linki

- FastAPI: https://fastapi.tiangolo.com/
- Uvicorn: https://www.uvicorn.org/
- PostgreSQL: https://www.postgresql.org/docs/
- Let's Encrypt: https://letsencrypt.org/
- mikr.us: https://mikr.us/

---

## ✅ Checklist wdrożenia

- [ ] Baza danych utworzona w panelu mikr.us
- [ ] Dane dostępowe do bazy zapisane
- [ ] JWT_SECRET wygenerowany
- [ ] Kod wgrany na serwer
- [ ] Plik `.env.production` utworzony z poprawnymi danymi
- [ ] `setup-mikrus.sh` uruchomiony pomyślnie
- [ ] Virtual environment utworzone
- [ ] Zależności zainstalowane
- [ ] Migracje wykonane
- [ ] Test ręczny (`./start-mikrus.sh`) działa
- [ ] Katalog `logs` utworzony
- [ ] Systemd service skonfigurowany i uruchomiony
- [ ] Aplikacja działa (`systemctl status`)
- [ ] Nginx skonfigurowany
- [ ] Domena wskazuje na serwer
- [ ] SSL certyfikat zainstalowany
- [ ] API odpowiada na `https://api.therapyassistance.io/health`
- [ ] Swagger UI dostępny pod `/docs`
- [ ] Test rejestracji/logowania działa
- [ ] CORS poprawnie skonfigurowany
- [ ] Monitoring skonfigurowany (opcjonalnie)
- [ ] Backup skonfigurowany (opcjonalnie)

---

## 🎉 Gotowe!

Jeśli przeszedłeś przez wszystkie kroki, Twoja aplikacja powinna działać na:

**https://api.therapyassistance.io**

Dokumentacja API:

**https://api.therapyassistance.io/docs**

---

**Powodzenia z wdrożeniem! 🚀**