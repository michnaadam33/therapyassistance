# ⚡ Szybki Start - Wdrożenie TherapyAssistance

## 🎯 TL;DR - Najważniejsze Komendy

### 🔵 MIKRUS (Backend + DB)
```bash
# 1. Połącz się z VPS
ssh root@m1234.mikr.us

# 2. Zainstaluj podstawy
curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose nginx git

# 3. Sklonuj projekt
cd /opt/apps
git clone https://github.com/twoj-user/therapyassistance.git
cd therapyassistance

# 4. Konfiguruj .env
cp .env.mikrus.template .env
nano .env  # Uzupełnij DB credentials z panelu Mikrus

# 5. Wdróż
chmod +x deploy-mikrus.sh
./deploy-mikrus.sh init
./deploy-mikrus.sh deploy

# 6. Nginx
cp nginx.mikrus.conf /etc/nginx/sites-available/therapyassistance
nano /etc/nginx/sites-available/therapyassistance  # Zmień your-domain na m1234.mikr.us
ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 7. SSL (opcjonalnie)
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d m1234.mikr.us
```

### 🟢 VERCEL (Frontend)
```bash
# 1. Push do GitHub
git add .
git commit -m "Deploy config"
git push origin main

# 2. Vercel Dashboard (https://vercel.com)
# - Import Project → Wybierz repo
# - Root Directory: frontend
# - Framework: Vite
# - Add Environment Variable:
#   VITE_API_URL = https://m1234.mikr.us
# - Deploy
```

---

## 📋 Checklist 5 Minut

### Przygotowanie (2 min)
- [ ] Kupiony Mikrus 2.1: https://mikr.us
- [ ] Utworzona baza PostgreSQL w panelu Mikrus
- [ ] Konto Vercel: https://vercel.com
- [ ] Kod na GitHub

### Backend - Mikrus (2 min)
- [ ] SSH zalogowany
- [ ] Docker + Nginx zainstalowane
- [ ] Projekt sklonowany
- [ ] `.env` skonfigurowany (DB credentials!)
- [ ] `./deploy-mikrus.sh init` wykonany
- [ ] `./deploy-mikrus.sh deploy` wykonany
- [ ] Nginx skonfigurowany
- [ ] Test: `curl http://localhost:8000/health`

### Frontend - Vercel (1 min)
- [ ] Projekt zaimportowany
- [ ] `VITE_API_URL` ustawiony
- [ ] Deploy successful
- [ ] Test: Otwórz URL w przeglądarce

---

## 🔑 Najważniejsze Pliki

```
therapyassistance/
├── .env.mikrus.template       → Kopiuj do .env i wypełnij
├── docker-compose.mikrus.yml  → Backend dla Mikrus (bez DB)
├── nginx.mikrus.conf          → Config Nginx
├── deploy-mikrus.sh           → Skrypt deployment
│
├── frontend/
│   ├── vercel.json           → Config Vercel
│   └── .env.production       → Env vars dla Vercel
│
└── backend/
    ├── Dockerfile            → Docker image
    └── alembic/              → Migracje DB
```

---

## 🗄️ Panel Mikrus - Co Musisz Zrobić

1. **Bazy Danych** → PostgreSQL → Dodaj nową bazę
   - Zapisz: Host, Port, User, Password, Database Name
   
2. **Przekierowania Portów** (opcjonalnie)
   - Port 80 (HTTP) → Forward do VPS
   - Port 443 (HTTPS) → Forward do VPS

3. **Backup Space** (opcjonalnie)
   - Dostępny przez SSH/SCP dla backupów

---

## 🌐 Vercel - Environment Variables

W Vercel Dashboard → Settings → Environment Variables:

```
Name:  VITE_API_URL
Value: https://m1234.mikr.us

(Zamień m1234 na swój hostname!)
```

**WAŻNE:** Po zmianie env vars → Redeploy!

---

## 📝 .env dla Mikrus - Minimalna Konfiguracja

```bash
# DATABASE - Z panelu Mikrus
DB_HOST=postgres.mikr.us
DB_PORT=5432
DB_USER=m1234_twojuser              # ← Z panelu!
DB_PASSWORD=haslo_z_panelu          # ← Z panelu!
DB_NAME=m1234_therapyassistance     # ← Z panelu!

# JWT SECRET - Wygeneruj nowy!
JWT_SECRET=super_tajny_klucz_min_32_znaki_zmien_mnie

# CORS - URL Vercel (ustaw po wdrożeniu)
ALLOWED_ORIGINS=https://therapyassistance.vercel.app

# MIKRUS
MIKRUS_HOSTNAME=m1234.mikr.us       # ← Twój hostname!
```

**Generuj JWT Secret:**
```bash
openssl rand -hex 32
```

---

## 🚀 Deployment w 10 Krokach

### Backend (Mikrus)

1. **SSH do VPS:**
   ```bash
   ssh root@m1234.mikr.us
   ```

2. **Instaluj narzędzia:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   apt-get install -y docker-compose nginx git
   ```

3. **Sklonuj projekt:**
   ```bash
   mkdir -p /opt/apps && cd /opt/apps
   git clone https://github.com/twoj-user/therapyassistance.git
   cd therapyassistance
   ```

4. **Konfiguruj .env:**
   ```bash
   cp .env.mikrus.template .env
   nano .env  # Wypełnij DB credentials
   ```

5. **Inicjalizacja:**
   ```bash
   chmod +x deploy-mikrus.sh
   ./deploy-mikrus.sh init
   ```

6. **Deploy:**
   ```bash
   ./deploy-mikrus.sh deploy
   ```

7. **Nginx:**
   ```bash
   cp nginx.mikrus.conf /etc/nginx/sites-available/therapyassistance
   nano /etc/nginx/sites-available/therapyassistance  # Zmień domeny
   ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
   nginx -t && systemctl restart nginx
   ```

### Frontend (Vercel)

8. **Push do GitHub:**
   ```bash
   git add .
   git commit -m "Add deployment config"
   git push origin main
   ```

9. **Vercel Dashboard:**
   - New Project → Import z GitHub
   - Root: `frontend`
   - Framework: Vite
   - Env: `VITE_API_URL=https://m1234.mikr.us`
   - Deploy

10. **Finalizuj CORS:**
    ```bash
    # Na VPS, zaktualizuj .env:
    nano /opt/apps/therapyassistance/.env
    # ALLOWED_ORIGINS=https://therapyassistance.vercel.app
    
    # Zrestartuj:
    ./deploy-mikrus.sh restart
    
    # Zaktualizuj Nginx:
    nano /etc/nginx/sites-available/therapyassistance
    # add_header Access-Control-Allow-Origin "https://therapyassistance.vercel.app"
    
    systemctl reload nginx
    ```

---

## ✅ Testy

### Backend
```bash
# Health check
curl http://m1234.mikr.us/health
# → {"status":"healthy"}

# API docs
curl http://m1234.mikr.us/docs
# → HTML Swagger UI
```

### Frontend
1. Otwórz: `https://therapyassistance.vercel.app`
2. Sprawdź Console (F12) - brak błędów CORS
3. Zaloguj się test userem

### Połączenie Frontend ↔ Backend
1. Otwórz frontend w przeglądarce
2. F12 → Network
3. Próbuj się zalogować
4. Sprawdź czy request idzie do `m1234.mikr.us`
5. Sprawdź response - 200 OK

---

## 🔧 Podstawowe Komendy

### Mikrus (na VPS przez SSH)

```bash
cd /opt/apps/therapyassistance

# Logi
./deploy-mikrus.sh logs

# Status
./deploy-mikrus.sh status

# Restart
./deploy-mikrus.sh restart

# Backup
./deploy-mikrus.sh backup

# Update (po git pull)
./deploy-mikrus.sh update

# Stop
./deploy-mikrus.sh stop
```

### Vercel (automatyczne)

- **Push do main branch** → Auto deploy
- **Pull Request** → Preview deployment
- **Manual redeploy:** Vercel Dashboard → Deployments → Redeploy

---

## 🐛 Szybkie Rozwiązywanie Problemów

### Backend nie działa
```bash
./deploy-mikrus.sh logs
./deploy-mikrus.sh restart
```

### CORS error
```bash
# Sprawdź .env
cat .env | grep ALLOWED_ORIGINS

# Sprawdź Nginx
cat /etc/nginx/sites-available/therapyassistance | grep Access-Control

# Zrestartuj oba
./deploy-mikrus.sh restart
systemctl reload nginx
```

### Błąd bazy danych
```bash
# Test połączenia
psql -h postgres.mikr.us -U m1234_user -d m1234_therapyassistance

# Sprawdź credentials
cat .env | grep DB_
```

### Frontend nie łączy się z API
1. Vercel → Settings → Environment Variables
2. Sprawdź `VITE_API_URL`
3. Redeploy

---

## 📊 Monitoring

### Zasoby VPS
```bash
# CPU, RAM, Disk
htop

# Docker
docker stats
```

### Logi
```bash
# Backend (Docker)
docker logs therapyassistance-backend -f

# Nginx access
tail -f /var/log/nginx/therapyassistance_access.log

# Nginx errors
tail -f /var/log/nginx/therapyassistance_error.log
```

---

## 🔒 SSL/HTTPS (Let's Encrypt)

```bash
# Instalacja
apt-get install -y certbot python3-certbot-nginx

# Uzyskaj certyfikat
certbot --nginx -d m1234.mikr.us

# Auto-renewal (sprawdź)
certbot renew --dry-run

# Po SSL - zaktualizuj Vercel env:
# VITE_API_URL=https://m1234.mikr.us (z HTTPS!)
```

---

## 💾 Backup & Restore

### Backup
```bash
./deploy-mikrus.sh backup
# Zapisuje do: ./backups/backup_YYYYMMDD_HHMMSS.dump.gz
```

### Restore
```bash
./deploy-mikrus.sh restore
# Podaj ścieżkę do pliku backup
```

### Automated Daily Backup
```bash
crontab -e

# Dodaj (backup o 3:00 każdego dnia):
0 3 * * * cd /opt/apps/therapyassistance && ./deploy-mikrus.sh backup
```

---

## 💰 Koszty

| Element | Koszt |
|---------|-------|
| Mikrus 2.1 | 75 zł/rok |
| Vercel Hobby | 0 zł |
| PostgreSQL | 0 zł (współdzielona) |
| SSL | 0 zł (Let's Encrypt) |
| **TOTAL** | **75 zł/rok** |

**= 6,25 zł/miesiąc** 🎉

---

## 📞 Pomoc

- **Mikrus Discord/Forum:** https://mikr.us
- **Vercel Support:** https://vercel.com/support
- **Pełna dokumentacja:** Zobacz `DEPLOYMENT_GUIDE.md`

---

## ⚡ One-Liner Deploy (Zaawansowane)

**MIKRUS:**
```bash
ssh root@m1234.mikr.us "curl -fsSL https://get.docker.com | sh && apt-get install -y docker-compose nginx git && mkdir -p /opt/apps && cd /opt/apps && git clone https://github.com/twoj-user/therapyassistance.git"
```

**Potem ręcznie:**
- Konfiguruj `.env`
- Uruchom `./deploy-mikrus.sh init && ./deploy-mikrus.sh deploy`
- Konfiguruj Nginx

---

**Gotowe! Backend + Frontend w ~10 minut! 🚀**