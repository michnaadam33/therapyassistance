# 🚀 Szybki przewodnik wdrożenia na mikr.us

## Przygotowanie (na lokalnym komputerze)

### 1. Wygeneruj JWT Secret
```bash
openssl rand -hex 32
```
Zapisz wynik - użyjesz go w kroku 3.

### 2. Przygotuj dane połączenia z bazą danych
Potrzebujesz od mikr.us:
- Host bazy danych (np. `localhost` lub IP serwera)
- Port (zazwyczaj `5432`)
- Nazwa użytkownika bazy danych
- Hasło do bazy danych
- Nazwa bazy danych (np. `therapyassistance`)

---

## Wdrożenie (na serwerze mikr.us)

### 1. Wgraj kod na serwer

**Opcja A: Przez Git**
```bash
ssh your_username@your_server.mikr.us
cd ~
git clone https://github.com/your-repo/therapyassistance.git
```

**Opcja B: Przez SCP (z lokalnego komputera)**
```bash
scp -r ./therapyassistance your_username@your_server.mikr.us:~/
```

### 2. Zaloguj się na serwer
```bash
ssh your_username@your_server.mikr.us
```

### 3. Utwórz plik konfiguracyjny produkcyjny
```bash
cd ~/therapyassistance
nano .env.production
```

Wklej i dostosuj:
```env
# ⚠️ ZMIEŃ TE WARTOŚCI!
DATABASE_URL=postgresql+psycopg2://db_user:db_password@db_host:5432/therapyassistance

# Wklej wygenerowany wcześniej secret
JWT_SECRET=twoj_wygenerowany_secret_z_kroku_1
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Twoja domena frontendu
ALLOWED_ORIGINS=https://therapyassistance.io,https://api.therapyassistance.io
FRONTEND_URL=https://therapyassistance.io

# API configuration
API_V1_STR=/api/v1
PROJECT_NAME=TherapyAssistance

# Port aplikacji
BACKEND_PORT=8000

# Environment
ENVIRONMENT=production
```

Zapisz: `CTRL+O`, `Enter`, `CTRL+X`

### 4. Uruchom automatyczną instalację
```bash
chmod +x setup-mikrus.sh
./setup-mikrus.sh
```

Skrypt:
- Utworzy środowisko wirtualne
- Zainstaluje wszystkie zależności
- Sprawdzi połączenie z bazą danych
- Uruchomi migracje
- Zaproponuje załadowanie danych testowych

### 5. Test ręczny
```bash
./start-mikrus.sh
```

Jeśli zobaczysz:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```
To wszystko działa! Naciśnij `CTRL+C`.

### 6. Skonfiguruj autostart (systemd)

Najpierw edytuj plik service:
```bash
nano therapyassistance.service
```

Zamień wszystkie wystąpienia `YOUR_USERNAME_HERE` na swoją nazwę użytkownika.
Przykład: jeśli Twój user to `john`, zamień na `john`.

Zapisz i zamknij (`CTRL+O`, `Enter`, `CTRL+X`).

Utwórz katalog na logi:
```bash
mkdir -p ~/therapyassistance/logs
```

Skopiuj i uruchom usługę:
```bash
sudo cp ~/therapyassistance/therapyassistance.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable therapyassistance
sudo systemctl start therapyassistance
```

Sprawdź status:
```bash
sudo systemctl status therapyassistance
```

Powinno pokazać: **active (running)** ✅

---

## Konfiguracja domeny (nginx)

### 1. Utwórz konfigurację nginx
```bash
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

Zapisz i zamknij.

### 2. Włącz konfigurację
```bash
sudo ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Zainstaluj SSL (Let's Encrypt)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.therapyassistance.io
```

Postępuj zgodnie z instrukcjami certbot (podaj email, zaakceptuj ToS).

---

## ✅ Weryfikacja

### 1. Test lokalny na serwerze
```bash
curl http://localhost:8000/health
```
Wynik: `{"status":"healthy"}`

### 2. Test przez domenę
```bash
curl https://api.therapyassistance.io/health
```
Wynik: `{"status":"healthy"}`

### 3. Sprawdź Swagger UI
Otwórz w przeglądarce:
```
https://api.therapyassistance.io/docs
```

### 4. Test rejestracji
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

## 📊 Zarządzanie

### Restart aplikacji
```bash
sudo systemctl restart therapyassistance
```

### Sprawdź status
```bash
sudo systemctl status therapyassistance
```

### Logi na żywo
```bash
# Logi aplikacji
tail -f ~/therapyassistance/logs/backend.log

# Logi systemd
sudo journalctl -u therapyassistance -f
```

### Stop aplikacji
```bash
sudo systemctl stop therapyassistance
```

### Start aplikacji
```bash
sudo systemctl start therapyassistance
```

---

## 🔄 Aktualizacja kodu

```bash
cd ~/therapyassistance
git pull  # jeśli używasz Git
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart therapyassistance
```

---

## 🆘 Problemy?

### Aplikacja nie startuje
```bash
# Sprawdź logi
sudo journalctl -u therapyassistance -n 50 --no-pager
tail -n 50 ~/therapyassistance/logs/backend.error.log
```

### Błąd połączenia z bazą danych
```bash
# Sprawdź czy PostgreSQL działa
sudo systemctl status postgresql

# Sprawdź DATABASE_URL w .env.production
nano ~/therapyassistance/.env.production
```

### 502 Bad Gateway (nginx)
```bash
# Sprawdź czy backend działa
curl http://localhost:8000/health

# Sprawdź logi nginx
sudo tail -f /var/log/nginx/therapyassistance-error.log
```

### Port zajęty
```bash
# Sprawdź co używa portu 8000
sudo lsof -i :8000

# Możesz zmienić port w .env.production
# BACKEND_PORT=8001
```

---

## 📚 Pełna dokumentacja

Więcej informacji znajdziesz w:
- `MIKRUS_DEPLOYMENT.md` - pełna dokumentacja wdrożenia
- `README.md` - ogólna dokumentacja projektu

---

## ✅ Checklist

- [ ] Kod wgrany na serwer
- [ ] Plik `.env.production` utworzony
- [ ] JWT_SECRET wygenerowany
- [ ] DATABASE_URL poprawny
- [ ] `setup-mikrus.sh` uruchomiony pomyślnie
- [ ] Migracje wykonane
- [ ] Test ręczny (`./start-mikrus.sh`) działa
- [ ] Systemd service skonfigurowany i działa
- [ ] Nginx skonfigurowany
- [ ] SSL certyfikat zainstalowany
- [ ] API odpowiada na `/health`
- [ ] Swagger dostępny pod `/docs`
- [ ] Test rejestracji działa

---

**Gotowe! Twoja aplikacja działa na https://api.therapyassistance.io 🎉**