# 📦 Pliki Konfiguracyjne Wdrożenia

Ten katalog zawiera wszystkie pliki niezbędne do wdrożenia aplikacji TherapyAssistance na Vercel (frontend) i Mikrus (backend + baza danych).

## 📁 Struktura Plików

```
therapyassistance/
│
├── 📄 DEPLOYMENT_GUIDE.md           # Pełny przewodnik wdrożenia (ZACZNIJ TUTAJ!)
├── 📄 DEPLOYMENT_QUICKSTART.md      # Szybki start - komendy i checklist
├── 📄 DEPLOYMENT_README.md          # Ten plik - przegląd konfiguracji
│
├── 🐳 docker-compose.mikrus.yml     # Docker Compose dla Mikrus (tylko backend)
├── 🔧 nginx.mikrus.conf             # Konfiguracja Nginx dla backendu
├── 🚀 deploy-mikrus.sh              # Skrypt automatyzacji wdrożenia
├── 📋 .env.mikrus.template          # Szablon zmiennych środowiskowych
│
├── frontend/
│   ├── 📄 vercel.json               # Konfiguracja Vercel
│   └── 📄 .env.production           # Zmienne środowiskowe dla Vercel
│
└── backend/
    ├── 🐳 Dockerfile                # Docker image dla FastAPI
    ├── 📋 requirements.txt          # Zależności Python
    └── alembic/                     # Migracje bazy danych
```

---

## 🎯 Szybki Start

### Jeśli wdrażasz pierwszy raz:
👉 **Przeczytaj: `DEPLOYMENT_GUIDE.md`** - szczegółowy przewodnik krok po kroku

### Jeśli znasz proces:
👉 **Zobacz: `DEPLOYMENT_QUICKSTART.md`** - komendy i checklist

---

## 📄 Opis Plików Konfiguracyjnych

### 1. `docker-compose.mikrus.yml`

**Cel:** Definicja serwisu backend dla Mikrus VPS  
**Używa:** Współdzielonej PostgreSQL z Mikrusa (nie uruchamia własnej bazy)

```yaml
services:
  backend:  # FastAPI + Uvicorn
    - Mapuje port 8000
    - Używa zmiennych z .env
    - Automatyczne migracje Alembic
    - Healthcheck dla monitoringu
```

**Użycie:**
```bash
docker-compose -f docker-compose.mikrus.yml up -d
```

---

### 2. `nginx.mikrus.conf`

**Cel:** Reverse proxy dla backendu na Mikrus VPS  
**Funkcje:**
- Proxy do Docker container (port 8000)
- CORS headers dla Vercel frontend
- SSL/HTTPS support (Let's Encrypt)
- Security headers
- Gzip compression
- Access/Error logging

**Kluczowe konfiguracje:**
```nginx
# Musisz zmienić:
server_name your-domain.mikr.us;              # → m1234.mikr.us
add_header Access-Control-Allow-Origin "..."; # → URL Vercel
```

**Instalacja:**
```bash
cp nginx.mikrus.conf /etc/nginx/sites-available/therapyassistance
ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

### 3. `deploy-mikrus.sh`

**Cel:** Automatyzacja wdrożenia i zarządzania na Mikrus VPS  
**Skrypt wykonawczy** - wymaga uprawnień: `chmod +x deploy-mikrus.sh`

**Dostępne komendy:**

| Komenda | Opis |
|---------|------|
| `init` | Inicjalizacja - pierwsza instalacja, migracje DB |
| `deploy` | Wdrożenie/aktualizacja aplikacji |
| `restart` | Restart serwisów Docker |
| `stop` | Zatrzymanie serwisów |
| `logs` | Wyświetlenie logów na żywo |
| `status` | Status kontenerów |
| `backup` | Backup bazy danych PostgreSQL |
| `restore` | Przywrócenie z backupu |
| `update` | Git pull + rebuild + restart |

**Przykłady:**
```bash
./deploy-mikrus.sh init      # Pierwsza instalacja
./deploy-mikrus.sh deploy    # Deploy aplikacji
./deploy-mikrus.sh logs      # Zobacz logi
./deploy-mikrus.sh backup    # Backup bazy
```

---

### 4. `.env.mikrus.template`

**Cel:** Szablon zmiennych środowiskowych dla Mikrus  
**Użycie:** Skopiuj do `.env` i wypełnij

```bash
cp .env.mikrus.template .env
nano .env
```

**Kluczowe zmienne (MUSISZ wypełnić):**

#### 🗄️ Baza Danych (z panelu Mikrus)
```bash
DB_HOST=postgres.mikr.us
DB_PORT=5432
DB_USER=m1234_username          # Z panelu Mikrus → Bazy danych
DB_PASSWORD=haslo               # Z panelu Mikrus → Bazy danych
DB_NAME=m1234_therapyassistance # Z panelu Mikrus → Bazy danych
```

#### 🔐 JWT Authentication
```bash
JWT_SECRET=$(openssl rand -hex 32)  # Wygeneruj bezpieczny klucz!
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

#### 🌐 CORS (po wdrożeniu Vercel)
```bash
ALLOWED_ORIGINS=https://therapyassistance.vercel.app,https://twoja-domena.com
```

#### 🖥️ Mikrus
```bash
MIKRUS_HOSTNAME=m1234.mikr.us   # Twój hostname z panelu
```

---

### 5. `frontend/vercel.json`

**Cel:** Konfiguracja deploymentu Vercel  
**Framework:** Vite + React

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [...],    // Proxy API calls do Mikrus
  "headers": [...],     // Security headers
  "env": {
    "VITE_API_URL": "https://your-domain.mikr.us"
  }
}
```

**Rewrites:** Przekierowują `/api/*`, `/auth/*`, itp. do backendu na Mikrus

**⚠️ UWAGA:** Zmień `your-domain.mikr.us` na swój rzeczywisty hostname!

---

### 6. `frontend/.env.production`

**Cel:** Zmienne środowiskowe dla Vercel (produkcja)

```bash
VITE_API_URL=https://m1234.mikr.us
```

**W Vercel Dashboard:**
Settings → Environment Variables → Add:
```
Name:  VITE_API_URL
Value: https://m1234.mikr.us  # Twój backend URL
```

---

## 🔄 Workflow Wdrożenia

### Pierwszy Deploy:

```
1. Panel Mikrus → Utwórz bazę PostgreSQL
   ↓
2. VPS Mikrus → Sklonuj repo, konfiguruj .env
   ↓
3. VPS Mikrus → ./deploy-mikrus.sh init
   ↓
4. VPS Mikrus → ./deploy-mikrus.sh deploy
   ↓
5. VPS Mikrus → Konfiguruj Nginx
   ↓
6. Vercel → Import projektu
   ↓
7. Vercel → Ustaw VITE_API_URL
   ↓
8. Vercel → Deploy
   ↓
9. Mikrus → Zaktualizuj CORS w .env i Nginx
   ↓
10. Test → Frontend ↔ Backend
```

### Kolejne Aktualizacje:

#### Backend (Mikrus):
```bash
ssh root@m1234.mikr.us
cd /opt/apps/therapyassistance
git pull origin main
./deploy-mikrus.sh update
```

#### Frontend (Vercel):
```bash
git push origin main  # Auto-deploy!
```

---

## 🏗️ Architektura Deploymentu

```
┌─────────────────────────────────────────┐
│  Użytkownik                             │
└────────────┬────────────────────────────┘
             │
             ├─────────────────┬──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
    ┌─────────────────┐  ┌──────────┐   ┌──────────┐
    │  Vercel CDN     │  │  Mikrus  │   │ Browser  │
    │  (Frontend)     │  │  Nginx   │   │  Cache   │
    │                 │  │  (Proxy) │   │          │
    │  - React SPA    │  └─────┬────┘   └──────────┘
    │  - Static files │        │
    │  - Global CDN   │        ▼
    └─────────────────┘  ┌──────────────┐
                         │  Docker      │
                         │  FastAPI     │
                         │  Port 8000   │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  PostgreSQL  │
                         │  Shared DB   │
                         │  Mikrus      │
                         └──────────────┘
```

---

## ⚙️ Wymagania

### Mikrus VPS:
- **Plan:** Mikrus 2.1 lub wyższy (wspiera Dockera)
- **RAM:** 1GB minimum
- **Dysk:** 10GB
- **OS:** Ubuntu/Debian (zalecane)
- **Dostęp:** Root SSH

### Lokalne:
- Git
- SSH client
- Node.js 18+ (tylko do lokalnego developmentu)

### Usługi:
- Konto GitHub (hosting kodu)
- Konto Vercel (frontend hosting - darmowe)
- Mikrus VPS 2.1 (backend + DB - 75 zł/rok)

---

## 🔐 Bezpieczeństwo

### ✅ Zaimplementowane:

1. **JWT Authentication** - bezpieczne tokeny
2. **CORS** - tylko dozwolone origins
3. **Environment Variables** - wrażliwe dane w .env
4. **SSL/HTTPS** - Let's Encrypt (opcjonalnie)
5. **Security Headers** - Nginx (X-Frame-Options, CSP, itp.)
6. **Docker Isolation** - konteneryzacja
7. **Non-root User** - Docker container

### 🔒 Best Practices:

- ❌ NIE commituj `.env` do Git!
- ✅ Użyj silnych haseł dla DB
- ✅ Wygeneruj unikalny JWT_SECRET
- ✅ Włącz SSL/HTTPS (Let's Encrypt)
- ✅ Regularnie aktualizuj zależności
- ✅ Backupy bazy danych (codziennie)
- ✅ Monitoruj logi pod kątem ataków

---

## 📊 Monitoring i Logi

### Backend (Mikrus):

```bash
# Logi Docker
./deploy-mikrus.sh logs

# Logi Nginx
tail -f /var/log/nginx/therapyassistance_access.log
tail -f /var/log/nginx/therapyassistance_error.log

# Status
./deploy-mikrus.sh status
docker stats

# Zasoby systemu
htop
df -h
```

### Frontend (Vercel):

- **Dashboard:** https://vercel.com/dashboard
- **Deployment Logs:** Każdy deploy ma szczegółowe logi
- **Analytics:** Vercel Analytics (opcjonalnie)
- **Real-time:** Browser DevTools Console

---

## 💾 Backup i Recovery

### Automatyczny Backup (Cron):

```bash
# Edytuj crontab
crontab -e

# Dodaj (backup o 3:00 każdego dnia)
0 3 * * * cd /opt/apps/therapyassistance && ./deploy-mikrus.sh backup

# Backup co tydzień (niedziela, 4:00)
0 4 * * 0 cd /opt/apps/therapyassistance && ./deploy-mikrus.sh backup
```

### Ręczny Backup:

```bash
./deploy-mikrus.sh backup
# Zapisuje do: ./backups/backup_YYYYMMDD_HHMMSS.dump.gz
```

### Restore:

```bash
./deploy-mikrus.sh restore
# Poda prompt z pytaniem o ścieżkę do pliku
```

### Backup do Mikrus Backup Space:

```bash
# W .env dodaj:
BACKUP_PATH=/backup/therapyassistance

# Skrypt automatycznie skopiuje tam backupy
```

---

## 🔧 Konfiguracje per Environment

### Development (lokalnie):
```bash
docker-compose.yml          # Z lokalną PostgreSQL
.env.local / .env           # Lokalne credentials
VITE_API_URL=http://localhost:8000
```

### Production (Mikrus + Vercel):
```bash
docker-compose.mikrus.yml   # Bez PostgreSQL (shared DB)
.env (na VPS)               # Production credentials
VITE_API_URL=https://m1234.mikr.us
```

---

## 🆘 Troubleshooting

### Problem: Deploy failed

```bash
# Sprawdź logi
./deploy-mikrus.sh logs

# Sprawdź czy .env jest poprawny
cat .env | grep DB_

# Sprawdź połączenie z bazą
psql -h postgres.mikr.us -U m1234_user -d m1234_db

# Przebuduj od zera
./deploy-mikrus.sh stop
docker system prune -a
./deploy-mikrus.sh deploy
```

### Problem: CORS errors

```bash
# 1. Sprawdź backend .env
cat .env | grep ALLOWED_ORIGINS

# 2. Sprawdź Nginx config
cat /etc/nginx/sites-available/therapyassistance | grep Access-Control

# 3. Sprawdź czy URL Vercel się zgadza
# 4. Zrestartuj wszystko
./deploy-mikrus.sh restart
systemctl reload nginx
```

### Problem: Database connection failed

```bash
# Test połączenia
psql -h postgres.mikr.us -U m1234_user -d m1234_db

# Sprawdź credentials w panelu Mikrus
# Zaktualizuj .env
nano .env

# Restart
./deploy-mikrus.sh restart
```

---

## 📚 Dokumentacja Szczegółowa

| Plik | Opis |
|------|------|
| **DEPLOYMENT_GUIDE.md** | Pełny przewodnik wdrożenia (krok po kroku) |
| **DEPLOYMENT_QUICKSTART.md** | Szybki start - najważniejsze komendy |
| **DEPLOYMENT_README.md** | Ten plik - przegląd konfiguracji |
| **INSTALL.md** | Instalacja lokalna (development) |
| **README.md** | Główny README projektu |

---

## 💰 Koszty Miesięczne/Roczne

| Usługa | Plan | Koszt |
|--------|------|-------|
| Vercel | Hobby | 0 zł |
| Mikrus | 2.1 (1GB RAM) | 75 zł/rok |
| PostgreSQL | Shared (Mikrus) | 0 zł |
| SSL | Let's Encrypt | 0 zł |
| **TOTAL** | | **75 zł/rok** |
| **Miesięcznie** | | **~6,25 zł** |

**Alternatywy:**
- Mikrus 3.0 (2GB RAM): 130 zł/rok
- Mikrus 3.5 (4GB RAM): 197 zł/rok

---

## 🚀 Co Dalej?

Po udanym wdrożeniu:

1. **Custom Domain** - Kup domenę i podłącz do Vercel
2. **Monitoring** - Dodaj Sentry, UptimeRobot
3. **Analytics** - Google Analytics, Vercel Analytics
4. **Email Notifications** - SMTP dla przypomnień o wizytach
5. **Automated Tests** - GitHub Actions CI/CD
6. **Backup Automation** - Cron job + monitoring
7. **Performance** - CDN, caching, optimization
8. **Security** - Fail2ban, firewall, regular updates

---

## 📞 Wsparcie

- **Mikrus:** https://forum.mikr.us / Discord
- **Vercel:** https://vercel.com/support
- **FastAPI:** https://fastapi.tiangolo.com
- **React:** https://react.dev

---

## ✨ Podsumowanie

Ten zestaw plików konfiguracyjnych umożliwia:

✅ Wdrożenie frontendu na Vercel (darmowe)  
✅ Wdrożenie backendu na Mikrus VPS (75 zł/rok)  
✅ Użycie współdzielonej PostgreSQL (0 zł)  
✅ Automatyzację deploymentu (skrypty)  
✅ Backup i recovery bazy danych  
✅ SSL/HTTPS (Let's Encrypt)  
✅ Monitoring i logi  
✅ Łatwe aktualizacje  

**Całkowity koszt:** ~6,25 zł/miesiąc 🎉

---

**Powodzenia z wdrożeniem!** 🚀

Jeśli napotkasz problemy, sprawdź `DEPLOYMENT_GUIDE.md` lub `DEPLOYMENT_QUICKSTART.md`.