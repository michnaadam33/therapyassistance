# 🚀 Ściągawka komend - mikr.us deployment

Najważniejsze komendy do zarządzania aplikacją TherapyAssistance na mikr.us.

---

## 🎯 Instalacja (jednorazowo)

```bash
# 1. Wgraj kod na serwer (z lokalnego komputera)
scp -r ./therapyassistance user@server.mikr.us:~/

# 2. Zaloguj się na serwer
ssh user@server.mikr.us

# 3. Utwórz .env.production
cd ~/therapyassistance
nano .env.production
# Wklej konfigurację i zapisz (CTRL+O, Enter, CTRL+X)

# 4. Uruchom instalację
chmod +x setup-mikrus.sh
./setup-mikrus.sh

# 5. Test ręczny
./start-mikrus.sh
# (CTRL+C aby zatrzymać)

# 6. Skonfiguruj autostart
nano therapyassistance.service
# Zamień YOUR_USERNAME_HERE na swoją nazwę
mkdir -p ~/therapyassistance/logs
sudo cp therapyassistance.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable therapyassistance
sudo systemctl start therapyassistance
```

---

## 📊 Zarządzanie aplikacją

### Status
```bash
# Status usługi
sudo systemctl status therapyassistance

# Szybki check wszystkiego
./check-status.sh

# Test API
curl http://localhost:8000/health
```

### Start/Stop/Restart
```bash
# Start
sudo systemctl start therapyassistance

# Stop
sudo systemctl stop therapyassistance

# Restart
sudo systemctl restart therapyassistance

# Przeładuj konfigurację
sudo systemctl daemon-reload
sudo systemctl restart therapyassistance
```

### Logi
```bash
# Logi aplikacji (na żywo)
tail -f ~/therapyassistance/logs/backend.log

# Logi błędów
tail -f ~/therapyassistance/logs/backend.error.log

# Ostatnie 50 linii błędów
tail -n 50 ~/therapyassistance/logs/backend.error.log

# Logi systemd (na żywo)
sudo journalctl -u therapyassistance -f

# Ostatnie 50 linii systemd
sudo journalctl -u therapyassistance -n 50 --no-pager

# Wszystkie logi z dzisiaj
sudo journalctl -u therapyassistance --since today
```

---

## 🗄️ Baza danych

### Migracje
```bash
cd ~/therapyassistance/backend
source venv/bin/activate

# Status migracji
alembic current

# Uruchom migracje
alembic upgrade head

# Cofnij ostatnią migrację
alembic downgrade -1

# Historia migracji
alembic history

# Deaktywuj venv
deactivate
```

### Backup
```bash
# Backup (zastąp connection string)
pg_dump "postgresql://user:pass@host:5432/therapyassistance" > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup skompresowany
pg_dump "postgresql://user:pass@host:5432/therapyassistance" | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore
psql "postgresql://user:pass@host:5432/therapyassistance" < backup.sql

# Restore ze skompresowanego
gunzip -c backup.sql.gz | psql "postgresql://user:pass@host:5432/therapyassistance"
```

---

## 🧪 Testowanie API

### Health check
```bash
# Lokalny
curl http://localhost:8000/health

# Produkcyjny (przez domenę)
curl https://api.therapyassistance.io/health

# Z nagłówkami
curl -I http://localhost:8000/health
```

### Rejestracja
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Logowanie
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Z tokenem
```bash
# Zapisz token
export TOKEN="your_token_here"

# Lista pacjentów
curl -X GET http://localhost:8000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌐 Nginx

### Instalacja konfiguracji
```bash
# Skopiuj config
sudo cp nginx-mikrus-http.conf /etc/nginx/sites-available/therapyassistance

# Włącz
sudo ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/

# Test konfiguracji
sudo nginx -t

# Przeładuj
sudo systemctl reload nginx
```

### SSL (Let's Encrypt)
```bash
# Zainstaluj certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Uzyskaj certyfikat
sudo certbot --nginx -d api.therapyassistance.io

# Test odnowienia
sudo certbot renew --dry-run
```

### Zarządzanie
```bash
# Status
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx

# Reload (bez przerwy w działaniu)
sudo systemctl reload nginx

# Test konfiguracji
sudo nginx -t

# Logi
sudo tail -f /var/log/nginx/therapyassistance-access.log
sudo tail -f /var/log/nginx/therapyassistance-error.log
```

---

## 🔄 Aktualizacja aplikacji

```bash
# 1. Przejdź do katalogu
cd ~/therapyassistance

# 2. Pobierz nowy kod (jeśli Git)
git pull

# 3. Aktywuj venv
cd backend
source venv/bin/activate

# 4. Zainstaluj nowe zależności
pip install -r requirements.txt

# 5. Uruchom migracje
alembic upgrade head

# 6. Deaktywuj venv
deactivate

# 7. Restart aplikacji
sudo systemctl restart therapyassistance

# 8. Sprawdź status
sudo systemctl status therapyassistance
./check-status.sh
```

---

## 🔍 Diagnostyka

### Sprawdź procesy
```bash
# Co używa portu 8000
sudo lsof -i :8000

# Procesy Python
ps aux | grep python

# Użycie zasobów
htop
```

### Sprawdź połączenie z bazą
```bash
cd ~/therapyassistance/backend
source venv/bin/activate
python3 -c "from app.core.database import engine; engine.connect(); print('✓ OK')"
deactivate
```

### Sprawdź konfigurację
```bash
# Pokaż .env.production (BEZ HASEŁ!)
cat ~/therapyassistance/.env.production | grep -v PASSWORD | grep -v SECRET

# Sprawdź service file
cat /etc/systemd/system/therapyassistance.service

# Sprawdź nginx config
cat /etc/nginx/sites-available/therapyassistance
```

---

## 🆘 Troubleshooting

### Aplikacja nie startuje
```bash
# 1. Sprawdź logi
sudo journalctl -u therapyassistance -n 50 --no-pager
tail -n 50 ~/therapyassistance/logs/backend.error.log

# 2. Test ręczny
cd ~/therapyassistance
./start-mikrus.sh

# 3. Sprawdź bazę danych
sudo systemctl status postgresql
```

### Port zajęty
```bash
# Sprawdź co używa portu
sudo lsof -i :8000

# Zabij proces (ostrożnie!)
sudo kill -9 <PID>

# Restart usługi
sudo systemctl restart therapyassistance
```

### 502 Bad Gateway
```bash
# Sprawdź backend
curl http://localhost:8000/health

# Sprawdź nginx
sudo nginx -t
sudo systemctl status nginx

# Logi nginx
sudo tail -f /var/log/nginx/therapyassistance-error.log
```

### Reset kompletny (UWAGA: traci dane!)
```bash
# Stop wszystko
sudo systemctl stop therapyassistance

# Usuń bazę danych (UWAGA!)
# Zrób backup najpierw!
dropdb therapyassistance
createdb therapyassistance

# Usuń venv
rm -rf ~/therapyassistance/backend/venv

# Zainstaluj od nowa
cd ~/therapyassistance
./setup-mikrus.sh

# Start
sudo systemctl start therapyassistance
```

---

## 📁 Ważne pliki i ścieżki

```bash
# Kod aplikacji
~/therapyassistance/

# Backend
~/therapyassistance/backend/

# Virtual environment
~/therapyassistance/backend/venv/

# Konfiguracja
~/therapyassistance/.env.production

# Logi
~/therapyassistance/logs/backend.log
~/therapyassistance/logs/backend.error.log

# Systemd service
/etc/systemd/system/therapyassistance.service

# Nginx config
/etc/nginx/sites-available/therapyassistance
/etc/nginx/sites-enabled/therapyassistance

# Logi nginx
/var/log/nginx/therapyassistance-access.log
/var/log/nginx/therapyassistance-error.log
```

---

## 🔒 Bezpieczeństwo

### Zmień hasła
```bash
# Wygeneruj nowy JWT secret
openssl rand -hex 32

# Edytuj .env.production
nano ~/therapyassistance/.env.production
# Zmień JWT_SECRET i DATABASE_URL

# Restart
sudo systemctl restart therapyassistance
```

### Sprawdź firewall
```bash
# Status
sudo ufw status

# Otwórz tylko niezbędne porty
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Port 8000 powinien być ZAMKNIĘTY publicznie
```

---

## 💡 Przydatne aliasy

Dodaj do `~/.bashrc`:

```bash
# TherapyAssistance aliasy
alias ta-status='sudo systemctl status therapyassistance'
alias ta-restart='sudo systemctl restart therapyassistance'
alias ta-logs='tail -f ~/therapyassistance/logs/backend.log'
alias ta-errors='tail -f ~/therapyassistance/logs/backend.error.log'
alias ta-check='~/therapyassistance/check-status.sh'
alias ta-health='curl -s http://localhost:8000/health | jq'
```

Zastosuj: `source ~/.bashrc`

---

## 📚 Więcej informacji

- **Szybki start:** [QUICK_DEPLOY_MIKRUS.md](QUICK_DEPLOY_MIKRUS.md)
- **Pełna dokumentacja:** [MIKRUS_DEPLOYMENT.md](MIKRUS_DEPLOYMENT.md)
- **Testy API:** [API_TEST_COMMANDS.md](API_TEST_COMMANDS.md)
- **Start tutaj:** [START_HERE.md](START_HERE.md)

---

**Powodzenia! 🚀**