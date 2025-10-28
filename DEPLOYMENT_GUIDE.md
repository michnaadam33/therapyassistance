# 🚀 Przewodnik Wdrożenia - TherapyAssistance

## 📋 Spis treści

1. [Architektura Wdrożenia](#architektura-wdrożenia)
2. [Wymagania](#wymagania)
3. [Krok 1: Konfiguracja Bazy Danych na Mikrus](#krok-1-konfiguracja-bazy-danych-na-mikrus)
4. [Krok 2: Wdrożenie Backendu na Mikrus](#krok-2-wdrożenie-backendu-na-mikrus)
5. [Krok 3: Wdrożenie Frontendu na Vercel](#krok-3-wdrożenie-frontendu-na-vercel)
6. [Krok 4: Konfiguracja CORS i SSL](#krok-4-konfiguracja-cors-i-ssl)
7. [Monitorowanie i Utrzymanie](#monitorowanie-i-utrzymanie)
8. [Rozwiązywanie Problemów](#rozwiązywanie-problemów)

---

## 🏗️ Architektura Wdrożenia

```
┌─────────────────────────────────────┐
│     Użytkownik (Przeglądarka)       │
└─────────────┬───────────────────────┘
              │
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│   Vercel CDN (Frontend)             │
│   - React + Vite                    │
│   - Statyczne pliki                 │
│   - Global CDN                      │
│   - Auto SSL/HTTPS                  │
└─────────────┬───────────────────────┘
              │
              │ API Calls (HTTPS)
              ▼
┌─────────────────────────────────────┐
│   Mikrus VPS 2.1 (Backend)          │
│   ┌───────────────────────────┐     │
│   │  Nginx (Reverse Proxy)    │     │
│   └─────────────┬─────────────┘     │
│                 │                    │
│   ┌─────────────▼─────────────┐     │
│   │  Docker: FastAPI          │     │
│   │  - uvicorn                │     │
│   │  - Port 8000              │     │
│   └─────────────┬─────────────┘     │
│                 │                    │
│                 │ SQL                │
│                 ▼                    │
│   ┌─────────────────────────────┐   │
│   │  Współdzielona PostgreSQL   │   │
│   │  (postgres.mikr.us)         │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Koszt:** ~75 zł/rok (Mikrus 2.1) + Vercel FREE = **75 zł/rok total**

---

## ✅ Wymagania

### Na Lokalnym Komputerze:
- Git zainstalowany
- Node.js 18+ i npm
- Konto GitHub
- Klient SSH (np. OpenSSH, PuTTY)

### Konta i Usługi:
- ✅ Konto Vercel (darmowe) - [vercel.com](https://vercel.com)
- ✅ Mikrus VPS 2.1 lub wyższy - [mikr.us](https://mikr.us)
- ✅ Repozytorium GitHub z projektem

---

## 🗄️ Krok 1: Konfiguracja Bazy Danych na Mikrus

### 1.1. Zaloguj się do Panelu Mikrus

1. Przejdź do: https://mikr.us/panel
2. Zaloguj się swoim kontem
3. Wybierz swój serwer VPS

### 1.2. Utwórz Bazę Danych PostgreSQL

1. W panelu Mikrus przejdź do sekcji **"Bazy danych"**
2. Wybierz **PostgreSQL**
3. Kliknij **"Dodaj nową bazę"**
4. Utwórz bazę danych:
   ```
   Nazwa: m1234_therapyassistance
   ```
5. **ZAPISZ** dane dostępowe:
   ```
   Host: postgres.mikr.us
   Port: 5432
   User: m1234_twoj_user
   Password: [wygenerowane hasło]
   Database: m1234_therapyassistance
   ```

### 1.3. Testuj Połączenie (opcjonalnie)

Z lokalnego komputera:

```bash
# Zainstaluj klienta PostgreSQL (jeśli nie masz)
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# macOS:
brew install postgresql

# Testuj połączenie:
psql -h postgres.mikr.us -U m1234_twoj_user -d m1234_therapyassistance
```

---

## 🖥️ Krok 2: Wdrożenie Backendu na Mikrus

### 2.1. Połącz się z VPS przez SSH

```bash
ssh root@m1234.mikr.us
# Wpisz hasło dostępowe z panelu Mikrus
```

### 2.2. Zainstaluj Wymagane Narzędzia

```bash
# Aktualizuj system
apt-get update && apt-get upgrade -y

# Zainstaluj Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Zainstaluj Docker Compose
apt-get install docker-compose -y

# Zainstaluj Nginx
apt-get install nginx -y

# Zainstaluj Git
apt-get install git -y
```

### 2.3. Sklonuj Repozytorium

```bash
# Utwórz katalog dla projektu
mkdir -p /opt/apps
cd /opt/apps

# Sklonuj projekt
git clone https://github.com/twoj-username/therapyassistance.git
cd therapyassistance
```

### 2.4. Skonfiguruj Zmienne Środowiskowe

```bash
# Skopiuj szablon .env
cp .env.mikrus.template .env

# Edytuj .env
nano .env
```

**Wypełnij następujące wartości:**

```bash
# DATABASE
DB_HOST=postgres.mikr.us
DB_PORT=5432
DB_USER=m1234_twoj_user              # Z panelu Mikrus
DB_PASSWORD=twoje_haslo_z_panelu    # Z panelu Mikrus
DB_NAME=m1234_therapyassistance     # Z panelu Mikrus

# JWT SECRET - wygeneruj nowy!
JWT_SECRET=$(openssl rand -hex 32)

# CORS - ustaw po wdrożeniu Vercel
ALLOWED_ORIGINS=https://therapyassistance.vercel.app

# MIKRUS
MIKRUS_HOSTNAME=m1234.mikr.us       # Twój hostname
```

Zapisz plik: `Ctrl + O`, `Enter`, `Ctrl + X`

### 2.5. Uruchom Migracje Bazy Danych

```bash
# Nadaj uprawnienia do skryptu
chmod +x deploy-mikrus.sh

# Inicjalizacja (pierwsze uruchomienie)
./deploy-mikrus.sh init
```

Skrypt:
- ✅ Sprawdzi połączenie z bazą
- ✅ Uruchomi migracje Alembic
- ✅ (Opcjonalnie) Załaduje dane testowe

### 2.6. Wdróż Backend

```bash
./deploy-mikrus.sh deploy
```

Sprawdź czy działa:
```bash
curl http://localhost:8000/health
# Powinno zwrócić: {"status":"healthy"}
```

### 2.7. Skonfiguruj Nginx

```bash
# Skopiuj konfigurację Nginx
cp nginx.mikrus.conf /etc/nginx/sites-available/therapyassistance

# Edytuj konfigurację - zamień 'your-domain.mikr.us' na swój hostname
nano /etc/nginx/sites-available/therapyassistance

# Zmień:
# server_name your-domain.mikr.us;
# NA:
# server_name m1234.mikr.us;

# Zmień także w CORS:
# add_header Access-Control-Allow-Origin "https://your-app.vercel.app"
# NA (ustaw po wdrożeniu Vercel):
# add_header Access-Control-Allow-Origin "https://therapyassistance.vercel.app"

# Włącz konfigurację
ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/

# Usuń domyślną konfigurację (jeśli istnieje)
rm -f /etc/nginx/sites-enabled/default

# Testuj konfigurację
nginx -t

# Jeśli OK, uruchom Nginx
systemctl enable nginx
systemctl restart nginx
```

### 2.8. Konfiguracja Portów (Panel Mikrus)

1. Zaloguj się do panelu Mikrus
2. Przejdź do **"Przekierowania portów"**
3. Dodaj przekierowania:
   - **Port 80** (HTTP) → forward do VPS
   - **Port 443** (HTTPS) → forward do VPS (jeśli używasz SSL)

### 2.9. Testuj Backend

```bash
# Z lokalnego komputera:
curl http://m1234.mikr.us/health

# Jeśli działa, zobaczysz:
# {"status":"healthy"}
```

---

## 🌐 Krok 3: Wdrożenie Frontendu na Vercel

### 3.1. Przygotuj Repozytorium GitHub

```bash
# Na lokalnym komputerze, upewnij się że masz najnowszą wersję
cd /path/to/therapyassistance
git add .
git commit -m "Add Vercel and Mikrus deployment configs"
git push origin main
```

### 3.2. Zaloguj się do Vercel

1. Przejdź do: https://vercel.com
2. Zaloguj się przez GitHub
3. Kliknij **"Add New..."** → **"Project"**

### 3.3. Importuj Projekt

1. Wybierz repozytorium: `therapyassistance`
2. **Framework Preset:** Vite
3. **Root Directory:** `frontend`
4. Kliknij **"Configure Project"**

### 3.4. Konfiguruj Zmienne Środowiskowe

W sekcji **"Environment Variables"** dodaj:

```
Name: VITE_API_URL
Value: https://m1234.mikr.us
```

*(Zamień `m1234` na swój rzeczywisty hostname Mikrus)*

### 3.5. Ustaw Build Settings

Vercel powinien automatycznie wykryć:
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Jeśli nie, ustaw ręcznie.

### 3.6. Wdróż

1. Kliknij **"Deploy"**
2. Poczekaj 2-3 minuty na build
3. Otrzymasz URL: `https://therapyassistance.vercel.app`

### 3.7. Konfiguruj Custom Domain (opcjonalnie)

W ustawieniach projektu Vercel:
1. **Settings** → **Domains**
2. Dodaj swoją domenę
3. Ustaw rekordy DNS zgodnie z instrukcjami

---

## 🔐 Krok 4: Konfiguracja CORS i SSL

### 4.1. Aktualizuj CORS na Backendzie

```bash
# Połącz się z VPS
ssh root@m1234.mikr.us

# Edytuj .env
cd /opt/apps/therapyassistance
nano .env

# Zaktualizuj ALLOWED_ORIGINS swoim rzeczywistym URL Vercel:
ALLOWED_ORIGINS=https://therapyassistance.vercel.app,https://twoja-domena.com
```

Zapisz i zrestartuj backend:
```bash
./deploy-mikrus.sh restart
```

### 4.2. Aktualizuj Nginx CORS

```bash
nano /etc/nginx/sites-available/therapyassistance

# Znajdź linię:
# add_header Access-Control-Allow-Origin "https://your-app.vercel.app" always;

# Zmień na:
add_header Access-Control-Allow-Origin "https://therapyassistance.vercel.app" always;

# Zapisz i przetestuj
nginx -t

# Jeśli OK, przeładuj
systemctl reload nginx
```

### 4.3. Włącz SSL/HTTPS z Let's Encrypt (ZALECANE)

```bash
# Zainstaluj Certbot
apt-get install certbot python3-certbot-nginx -y

# Uzyskaj certyfikat
certbot --nginx -d m1234.mikr.us

# Postępuj zgodnie z instrukcjami:
# 1. Podaj email
# 2. Zaakceptuj ToS
# 3. Wybierz opcję przekierowania HTTP → HTTPS

# Certyfikat automatycznie odnowi się co 90 dni
# Sprawdź auto-renewal:
certbot renew --dry-run
```

### 4.4. Aktualizuj Nginx Config (po SSL)

Edytuj `/etc/nginx/sites-available/therapyassistance`:

```bash
nano /etc/nginx/sites-available/therapyassistance
```

Odkomentuj sekcje SSL (usuń `#`):
```nginx
ssl_certificate /etc/letsencrypt/live/m1234.mikr.us/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/m1234.mikr.us/privkey.pem;
```

Przeładuj Nginx:
```bash
nginx -t && systemctl reload nginx
```

### 4.5. Zaktualizuj Vercel Environment Variables

W Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. Edytuj `VITE_API_URL`:
   ```
   https://m1234.mikr.us  (z HTTPS!)
   ```
3. **Redeploy:** Settings → Deployments → ⋯ Menu → Redeploy

---

## 📊 Monitorowanie i Utrzymanie

### Logi Backendu

```bash
# Połącz się z VPS
ssh root@m1234.mikr.us
cd /opt/apps/therapyassistance

# Zobacz logi Docker
./deploy-mikrus.sh logs

# Logi Nginx
tail -f /var/log/nginx/therapyassistance_access.log
tail -f /var/log/nginx/therapyassistance_error.log
```

### Status Serwisów

```bash
# Status Docker containers
./deploy-mikrus.sh status

# Status Nginx
systemctl status nginx

# Użycie zasobów
docker stats
htop
```

### Backup Bazy Danych

```bash
# Utwórz backup
./deploy-mikrus.sh backup

# Backupy zapisywane są w: ./backups/

# Przywróć z backupu
./deploy-mikrus.sh restore
```

### Aktualizacja Aplikacji

```bash
# Połącz się z VPS
ssh root@m1234.mikr.us
cd /opt/apps/therapyassistance

# Zaktualizuj kod
git pull origin main

# Wdróż aktualizację
./deploy-mikrus.sh update
```

**Frontend (Vercel):** Automatycznie wdraża przy push do GitHub!

---

## 🐛 Rozwiązywanie Problemów

### Problem: Backend nie odpowiada

```bash
# Sprawdź status
./deploy-mikrus.sh status

# Zobacz logi
./deploy-mikrus.sh logs

# Zrestartuj
./deploy-mikrus.sh restart
```

### Problem: Błąd CORS

Objawy: W konsoli przeglądarki:
```
Access to fetch at '...' has been blocked by CORS policy
```

Rozwiązanie:
1. Sprawdź `ALLOWED_ORIGINS` w `.env` na VPS
2. Sprawdź CORS headers w Nginx config
3. Upewnij się, że URL Vercel jest poprawny
4. Zrestartuj backend i Nginx

```bash
cd /opt/apps/therapyassistance
./deploy-mikrus.sh restart
systemctl reload nginx
```

### Problem: Błąd połączenia z bazą danych

```bash
# Testuj połączenie
psql -h postgres.mikr.us -U m1234_twoj_user -d m1234_therapyassistance

# Sprawdź credentials w .env
cat .env | grep DB_

# Sprawdź logi backendu
./deploy-mikrus.sh logs
```

### Problem: Frontend nie łączy się z backendem

1. Sprawdź `VITE_API_URL` w Vercel:
   - Settings → Environment Variables
2. Upewnij się że backend jest dostępny:
   ```bash
   curl https://m1234.mikr.us/health
   ```
3. Sprawdź logi przeglądarki (F12 → Console)
4. Redeploy Vercel po zmianie zmiennych

### Problem: SSL nie działa

```bash
# Sprawdź certyfikat
certbot certificates

# Odnów ręcznie jeśli wygasł
certbot renew

# Sprawdź Nginx config
nginx -t

# Zrestartuj Nginx
systemctl restart nginx
```

### Problem: Za mało RAM na VPS

Mikrus 2.1 ma 1GB RAM. Jeśli to za mało:

**Opcja 1:** Użyj pamięci tymczasowej (Swap)
```bash
# Utwórz swap 1GB
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Dodaj do /etc/fstab dla auto-mount
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Opcja 2:** Upgrade do Mikrus 3.0 (2GB RAM, 130 zł/rok)

---

## 📝 Checklist Wdrożenia

### Przed Wdrożeniem:
- [ ] Konto Vercel założone
- [ ] Mikrus VPS 2.1 zakupiony
- [ ] Repozytorium GitHub utworzone
- [ ] Kod projektu na GitHub

### Mikrus (Backend):
- [ ] VPS zalogowany przez SSH
- [ ] Docker i Docker Compose zainstalowane
- [ ] Nginx zainstalowany
- [ ] Baza PostgreSQL utworzona w panelu
- [ ] Repozytorium sklonowane na VPS
- [ ] Plik `.env` skonfigurowany
- [ ] Migracje bazy danych uruchomione
- [ ] Backend wdrożony i działa
- [ ] Nginx skonfigurowany
- [ ] Porty przekierowane w panelu
- [ ] SSL certyfikat zainstalowany (opcjonalnie)

### Vercel (Frontend):
- [ ] Projekt zaimportowany
- [ ] `VITE_API_URL` ustawiony
- [ ] Build successful
- [ ] Aplikacja dostępna pod URL

### Finalizacja:
- [ ] CORS poprawnie skonfigurowany
- [ ] Frontend łączy się z backendem
- [ ] Login działa
- [ ] Tworzenie pacjentów działa
- [ ] Wszystkie funkcje działają
- [ ] SSL/HTTPS włączony
- [ ] Backup skonfigurowany

---

## 🎯 Następne Kroki

### Opcjonalne Ulepszenia:

1. **Custom Domain:**
   - Kup domenę (np. na OVH, nazwa.pl)
   - Dodaj do Vercel (frontend)
   - Dodaj subdomenę dla API (backend)

2. **Monitoring:**
   - Dodaj Sentry dla error tracking
   - Konfiguruj UptimeRobot dla monitoringu dostępności

3. **Email Notifications:**
   - Skonfiguruj SMTP dla powiadomień email
   - Przypomnienia o wizytach

4. **Automated Backups:**
   - Utwórz cron job dla codziennych backupów
   ```bash
   crontab -e
   # Dodaj:
   0 3 * * * /opt/apps/therapyassistance/deploy-mikrus.sh backup
   ```

5. **CI/CD:**
   - GitHub Actions dla automatycznych testów
   - Automatyczne wdrożenie na Mikrus po push

---

## 💰 Koszty (Podsumowanie)

| Usługa | Plan | Koszt |
|--------|------|-------|
| **Mikrus VPS** | 2.1 (1GB RAM, 10GB) | **75 zł/rok** |
| **Vercel** | Hobby (Frontend) | **0 zł** |
| **PostgreSQL** | Współdzielona (w Mikrus) | **0 zł** |
| **SSL Certificate** | Let's Encrypt | **0 zł** |
| **TOTAL** | | **75 zł/rok (~6,25 zł/miesiąc)** |

---

## 📚 Przydatne Linki

- **Mikrus:** https://mikr.us
- **Mikrus Dokumentacja:** https://wiki.mikr.us
- **Mikrus Forum:** https://forum.mikr.us
- **Vercel:** https://vercel.com
- **Vercel Docs:** https://vercel.com/docs
- **Docker Docs:** https://docs.docker.com
- **Nginx Docs:** https://nginx.org/en/docs
- **Let's Encrypt:** https://letsencrypt.org

---

## 🆘 Potrzebujesz Pomocy?

- **Mikrus Support:** Discord/Forum na mikr.us
- **Vercel Support:** https://vercel.com/support
- **GitHub Issues:** Utwórz issue w swoim repo

---

**Powodzenia z wdrożeniem! 🚀**

Stworzone dla projektu TherapyAssistance