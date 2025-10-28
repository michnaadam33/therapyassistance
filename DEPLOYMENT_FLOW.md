# 🔄 Deployment Flow - TherapyAssistance

## 📊 Wizualizacja Procesu Wdrożenia

### 🎯 Architektura Końcowa

```
┌──────────────────────────────────────────────────────────────────┐
│                         UŻYTKOWNIK                                │
│                    (Przeglądarka WWW)                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │   HTTPS Request   │
                   └─────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│   Statyczne   │    │  API Calls   │    │   WebSocket  │
│   Zasoby      │    │  (JSON)      │    │   (Future)   │
└───────┬───────┘    └──────┬───────┘    └──────────────┘
        │                   │
        ▼                   │
┌─────────────────────────┐ │
│  VERCEL CDN (Frontend)  │ │
│  ┌──────────────────┐   │ │
│  │  React + Vite    │   │ │
│  │  TypeScript      │   │ │
│  │  TailwindCSS     │   │ │
│  └──────────────────┘   │ │
│                          │ │
│  ✅ FREE Plan            │ │
│  ✅ Global CDN           │ │
│  ✅ Auto SSL/HTTPS       │ │
│  ✅ Auto Deploy (Git)    │ │
└──────────────────────────┘ │
                             │
                             │ HTTPS API Requests
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│  MIKRUS VPS 2.1 (Finlandia)                         │
│  ┌──────────────────────────────────────────────┐   │
│  │  NGINX (Reverse Proxy)                       │   │
│  │  - Port 80 → 443 redirect                    │   │
│  │  - SSL/TLS (Let's Encrypt)                   │   │
│  │  - CORS Headers                              │   │
│  │  - Gzip Compression                          │   │
│  │  - Security Headers                          │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│                 ▼                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  DOCKER CONTAINER                            │   │
│  │  ┌────────────────────────────────────────┐  │   │
│  │  │  FastAPI Backend                       │  │   │
│  │  │  - Python 3.11                         │  │   │
│  │  │  - Uvicorn (ASGI)                      │  │   │
│  │  │  - SQLAlchemy ORM                      │  │   │
│  │  │  - JWT Auth                            │  │   │
│  │  │  - Alembic Migrations                  │  │   │
│  │  │  Port: 8000                            │  │   │
│  │  └────────────────────────────────────────┘  │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│                 │ SQL Queries                        │
│                 │                                    │
│                 ▼                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  PostgreSQL Connection                       │   │
│  │  postgres.mikr.us:5432                       │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│  💰 75 zł/rok                                        │
│  📦 1GB RAM, 10GB Disk                               │
│  🐳 Docker Support                                   │
└─────────────────┼────────────────────────────────────┘
                  │
                  │ Network Connection
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  WSPÓŁDZIELONA POSTGRESQL (Mikrus)                  │
│  postgres.mikr.us                                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Database: m1234_therapyassistance          │   │
│  │  - Users table                              │   │
│  │  - Patients table                           │   │
│  │  - Appointments table                       │   │
│  │  - Session_notes table                      │   │
│  │  - Payments table                           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ✅ Included in VPS price                            │
│  ✅ Backups available                                │
│  ✅ No extra RAM usage on VPS                        │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Proces Wdrożenia - Timeline

### FAZA 1: Przygotowanie (10 minut)

```
┌─────────────────────────────────────────────────────┐
│  1. Zakup Usług                                     │
└─────────────────────────────────────────────────────┘
          │
          ├─→ Mikrus VPS 2.1 (75 zł/rok)
          │   https://mikr.us
          │
          ├─→ Vercel Account (FREE)
          │   https://vercel.com
          │
          └─→ GitHub Repository
              https://github.com

┌─────────────────────────────────────────────────────┐
│  2. Panel Mikrus - Konfiguracja                     │
└─────────────────────────────────────────────────────┘
          │
          ├─→ Utwórz bazę PostgreSQL
          │   ├─ Nazwa: m1234_therapyassistance
          │   ├─ User: m1234_username
          │   └─ Password: [wygenerowane]
          │
          └─→ Zapisz credentials!
```

---

### FAZA 2: Backend na Mikrus (15-20 minut)

```
┌─────────────────────────────────────────────────────┐
│  KROK 1: SSH do VPS                                 │
└─────────────────────────────────────────────────────┘
   ssh root@m1234.mikr.us
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 2: Instalacja Dependencies                    │
└─────────────────────────────────────────────────────┐
   curl -fsSL https://get.docker.com | sh              │
   apt-get install -y docker-compose nginx git         │
          │                                            │
          ▼                                            │
┌─────────────────────────────────────────────────────┐
│  KROK 3: Klonowanie Projektu                        │
└─────────────────────────────────────────────────────┘
   cd /opt/apps
   git clone https://github.com/user/therapyassistance.git
   cd therapyassistance
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 4: Konfiguracja .env                          │
└─────────────────────────────────────────────────────┘
   cp .env.mikrus.template .env
   nano .env
   
   [Wypełnij:]
   ├─ DB_HOST=postgres.mikr.us
   ├─ DB_USER=m1234_username
   ├─ DB_PASSWORD=***
   ├─ DB_NAME=m1234_therapyassistance
   ├─ JWT_SECRET=$(openssl rand -hex 32)
   └─ ALLOWED_ORIGINS=(ustaw po Vercel)
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 5: Inicjalizacja                              │
└─────────────────────────────────────────────────────┘
   chmod +x deploy-mikrus.sh
   ./deploy-mikrus.sh init
   
   [Wykonuje:]
   ├─ Test połączenia z DB
   ├─ Migracje Alembic
   └─ (Opcjonalnie) Seed danych
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 6: Deploy Backend                             │
└─────────────────────────────────────────────────────┘
   ./deploy-mikrus.sh deploy
   
   [Wykonuje:]
   ├─ Build Docker image
   ├─ Start container
   └─ Health check
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 7: Konfiguracja Nginx                         │
└─────────────────────────────────────────────────────┘
   cp nginx.mikrus.conf /etc/nginx/sites-available/therapyassistance
   nano /etc/nginx/sites-available/therapyassistance
   
   [Zmień:]
   ├─ server_name your-domain.mikr.us → m1234.mikr.us
   └─ CORS origin → (ustaw po Vercel)
   
   ln -s /etc/nginx/sites-available/therapyassistance \
         /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 8: Test Backend                               │
└─────────────────────────────────────────────────────┘
   curl http://localhost:8000/health
   
   ✅ Response: {"status":"healthy"}
```

---

### FAZA 3: Frontend na Vercel (5 minut)

```
┌─────────────────────────────────────────────────────┐
│  KROK 1: Push do GitHub                             │
└─────────────────────────────────────────────────────┘
   git add .
   git commit -m "Add deployment config"
   git push origin main
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 2: Vercel Dashboard                           │
└─────────────────────────────────────────────────────┘
   1. https://vercel.com/new
   2. Import Project
   3. Select GitHub → therapyassistance
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 3: Configure Build                            │
└─────────────────────────────────────────────────────┘
   Root Directory:     frontend
   Framework Preset:   Vite
   Build Command:      npm run build
   Output Directory:   dist
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 4: Environment Variables                      │
└─────────────────────────────────────────────────────┘
   Name:  VITE_API_URL
   Value: https://m1234.mikr.us
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 5: Deploy                                     │
└─────────────────────────────────────────────────────┘
   Click "Deploy"
   
   ⏳ Building... (2-3 min)
   
   ✅ Deployed!
   📍 URL: https://therapyassistance.vercel.app
```

---

### FAZA 4: Finalizacja CORS (5 minut)

```
┌─────────────────────────────────────────────────────┐
│  KROK 1: Zaktualizuj Backend .env                   │
└─────────────────────────────────────────────────────┘
   [Na VPS Mikrus]
   cd /opt/apps/therapyassistance
   nano .env
   
   ALLOWED_ORIGINS=https://therapyassistance.vercel.app
   
   ./deploy-mikrus.sh restart
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 2: Zaktualizuj Nginx CORS                     │
└─────────────────────────────────────────────────────┘
   nano /etc/nginx/sites-available/therapyassistance
   
   add_header Access-Control-Allow-Origin 
     "https://therapyassistance.vercel.app" always;
   
   nginx -t
   systemctl reload nginx
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  KROK 3: Test Integration                           │
└─────────────────────────────────────────────────────┘
   1. Otwórz: https://therapyassistance.vercel.app
   2. F12 → Console (sprawdź błędy CORS)
   3. Zaloguj się: terapeuta@example.com / haslo123
   4. Sprawdź Network tab
   
   ✅ 200 OK responses
   ✅ Brak błędów CORS
   ✅ Działające funkcje
```

---

## 🔄 Continuous Deployment Flow

### Auto-deployment (po pierwszym wdrożeniu)

```
┌─────────────────────────────────────────────────────┐
│  DEVELOPER                                          │
└─────────────────────────────────────────────────────┘
          │
          │ git commit -m "New feature"
          │ git push origin main
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  GITHUB                                             │
└─────────────────────────────────────────────────────┘
          │
          ├─────────────────┬─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  VERCEL      │  │  MIKRUS VPS  │  │  GITHUB      │
│  (Frontend)  │  │  (Backend)   │  │  ACTIONS     │
└──────────────┘  └──────────────┘  └──────────────┘
          │                 │                 │
          │                 │                 │
    [AUTO DEPLOY]     [MANUAL UPDATE]   [CI/CD Tests]
          │                 │                 │
          ▼                 ▼                 ▼
   ✅ Build           ssh root@vps      ✅ Tests Pass
   ✅ Deploy          cd /opt/apps      ✅ Lint Check
   ✅ Live in         git pull           ✅ Build Check
      2-3 min         ./deploy-mikrus.sh
                      update
```

---

## 📊 Data Flow - Runtime

```
┌─────────────────────────────────────────────────────┐
│  User Action: "Dodaj pacjenta"                      │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  1. Frontend (React)                                │
│     - Formularz validacja                           │
│     - Przygotowanie JSON                            │
└─────────────────────────────────────────────────────┘
          │
          │ POST /patients
          │ Authorization: Bearer <JWT>
          │ Body: {name, phone, email, ...}
          ▼
┌─────────────────────────────────────────────────────┐
│  2. Vercel Edge Network                             │
│     - TLS Termination                               │
│     - CDN Cache (jeśli GET)                         │
└─────────────────────────────────────────────────────┘
          │
          │ HTTPS
          ▼
┌─────────────────────────────────────────────────────┐
│  3. Mikrus Nginx                                    │
│     - SSL Termination                               │
│     - CORS Check                                    │
│     - Proxy to Docker                               │
└─────────────────────────────────────────────────────┘
          │
          │ HTTP (localhost)
          ▼
┌─────────────────────────────────────────────────────┐
│  4. FastAPI Backend                                 │
│     - JWT Validation                                │
│     - Request Validation (Pydantic)                 │
│     - Business Logic                                │
└─────────────────────────────────────────────────────┘
          │
          │ SQL INSERT
          ▼
┌─────────────────────────────────────────────────────┐
│  5. PostgreSQL (Shared)                             │
│     - Transaction                                   │
│     - INSERT INTO patients                          │
│     - COMMIT                                        │
└─────────────────────────────────────────────────────┘
          │
          │ Success Response
          ▼
┌─────────────────────────────────────────────────────┐
│  6. Response Path (Reverse)                         │
│     Backend → Nginx → Vercel → Browser              │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  7. Frontend Update                                 │
│     - State update                                  │
│     - UI refresh                                    │
│     - Success toast                                 │
└─────────────────────────────────────────────────────┘

⏱️  Total Time: ~200-500ms
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────┐
│  AUTHENTICATION FLOW                                │
└─────────────────────────────────────────────────────┘

User Login
    │
    ▼
Frontend: POST /auth/login
    │ {email, password}
    ▼
Backend: Validate credentials
    ├─ Hash password check
    ├─ User exists?
    └─ Generate JWT
        │
        ▼
    Return: {
        access_token: "eyJ...",
        token_type: "bearer"
    }
        │
        ▼
Frontend: Store in localStorage
        │
        ▼
    Every API Request:
    Headers: {
        Authorization: "Bearer eyJ..."
    }
        │
        ▼
Backend: JWT Middleware
    ├─ Decode token
    ├─ Verify signature
    ├─ Check expiration
    └─ Extract user_id
        │
        ▼
    ✅ Allow request
    ❌ 401 Unauthorized

┌─────────────────────────────────────────────────────┐
│  CORS PROTECTION                                    │
└─────────────────────────────────────────────────────┘

Browser Request
    │
    ├─ Origin: https://therapyassistance.vercel.app
    ▼
Nginx CORS Check
    │
    ├─ Allowed Origins?
    │  ✅ therapyassistance.vercel.app → ALLOW
    │  ❌ other-domain.com → BLOCK
    │
    └─ Add CORS Headers:
        ├─ Access-Control-Allow-Origin
        ├─ Access-Control-Allow-Methods
        └─ Access-Control-Allow-Headers
```

---

## 💾 Backup Flow

```
┌─────────────────────────────────────────────────────┐
│  AUTOMATED DAILY BACKUP (Cron)                      │
└─────────────────────────────────────────────────────┘

03:00 AM Daily
    │
    ▼
./deploy-mikrus.sh backup
    │
    ├─→ pg_dump
    │   ├─ Connect to postgres.mikr.us
    │   ├─ Export database
    │   └─ Format: custom (.dump)
    │
    ├─→ Compress (gzip)
    │   └─ backup_20250123_030000.dump.gz
    │
    ├─→ Save locally
    │   └─ /opt/apps/therapyassistance/backups/
    │
    └─→ Copy to Mikrus Backup Space
        └─ /backup/therapyassistance/

┌─────────────────────────────────────────────────────┐
│  RESTORE (Manual)                                   │
└─────────────────────────────────────────────────────┘

./deploy-mikrus.sh restore
    │
    ├─→ Select backup file
    ├─→ Decompress (if .gz)
    ├─→ pg_restore
    │   ├─ Connect to DB
    │   ├─ DROP existing tables
    │   └─ RESTORE from backup
    │
    └─→ ✅ Database restored!
```

---

## 🔄 Update Flow

```
┌─────────────────────────────────────────────────────┐
│  BACKEND UPDATE (Mikrus)                            │
└─────────────────────────────────────────────────────┘

ssh root@m1234.mikr.us
    │
    ▼
cd /opt/apps/therapyassistance
    │
    ▼
git pull origin main
    │
    ├─ New code downloaded
    │
    ▼
./deploy-mikrus.sh update
    │
    ├─→ Docker build --no-cache
    ├─→ Alembic upgrade head (migrations)
    └─→ Docker restart
        │
        ▼
    ✅ Backend updated!
    ⏱️  Downtime: ~30 seconds


┌─────────────────────────────────────────────────────┐
│  FRONTEND UPDATE (Vercel)                           │
└─────────────────────────────────────────────────────┘

git push origin main
    │
    ▼
Vercel Auto-Deploy
    │
    ├─→ Detect changes
    ├─→ Install dependencies
    ├─→ Build (npm run build)
    ├─→ Deploy to CDN
    └─→ Atomic swap
        │
        ▼
    ✅ Frontend updated!
    ⏱️  Total: 2-3 minutes
    ⚡  Zero downtime
```

---

## 📈 Monitoring Flow

```
┌─────────────────────────────────────────────────────┐
│  CONTINUOUS MONITORING                              │
└─────────────────────────────────────────────────────┘

┌──────────────┐
│  UptimeRobot │ → Ping every 5 min
│  (Optional)  │   ├─ https://therapyassistance.vercel.app
└──────────────┘   └─ https://m1234.mikr.us/health

┌──────────────┐
│  Nginx Logs  │ → Access & Error logs
└──────────────┘   ├─ /var/log/nginx/therapyassistance_access.log
                   └─ /var/log/nginx/therapyassistance_error.log

┌──────────────┐
│  Docker Logs │ → Application logs
└──────────────┘   └─ docker logs therapyassistance-backend

┌──────────────┐
│  Vercel      │ → Build & Runtime logs
│  Dashboard   │   └─ Real-time analytics
└──────────────┘

┌──────────────┐
│  Sentry      │ → Error tracking (Optional)
│  (Optional)  │   └─ Frontend & Backend errors
└──────────────┘
```

---

## 💰 Cost Breakdown

```
┌─────────────────────────────────────────────────────┐
│  MONTHLY COST STRUCTURE                             │
└─────────────────────────────────────────────────────┘

Vercel (Frontend)
    ├─ Hobby Plan: FREE
    ├─ 100 GB Bandwidth: FREE
    ├─ Global CDN: FREE
    └─ SSL/HTTPS: FREE
    Total: 0 zł

Mikrus VPS 2.1 (Backend + DB)
    ├─ VPS 2.1: 75 zł/year = 6.25 zł/month
    ├─ 1GB RAM: included
    ├─ 10GB Disk: included
    ├─ PostgreSQL: included (shared)
    └─ Docker: included
    Total: 6.25 zł/month

Domain (Optional)
    ├─ .pl domain: ~50 zł/year = 4.17 zł/month
    └─ .com domain: ~60 zł/year = 5 zł/month
    Total: 0-5 zł/month (optional)

SSL Certificate
    ├─ Let's Encrypt: FREE
    └─ Auto-renewal: FREE
    Total: 0 zł

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 6.25 zł/month (75 zł/year)
       + optional domain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For comparison:
    Heroku Hobby: $7/month = ~32 zł/month = 384 zł/year
    Railway Hobby: $5/month = ~23 zł/month = 276 zł/year
    DigitalOcean: $6/month = ~27 zł/month = 324 zł/year
    
    💰 Savings with Mikrus + Vercel: 
       vs Heroku: 309 zł/year (80%)
       vs Railway: 201 zł/year (73%)
       vs DigitalOcean: 249 zł/year (77%)
```

---

## ✅ Final Deployment Checklist

```
PRE-DEPLOYMENT
  ☐ Mikrus VPS 2.1 purchased
  ☐ PostgreSQL database created in Mikrus panel
  ☐ Database credentials saved
  ☐ Vercel account created
  ☐ GitHub repository ready
  ☐ Code pushed to GitHub

BACKEND (MIKRUS)
  ☐ SSH access working
  ☐ Docker installed
  ☐ Docker Compose installed
  ☐ Nginx installed
  ☐ Git installed
  ☐ Repository cloned
  ☐ .env configured
  ☐ JWT_SECRET generated
  ☐ Database migrations run
  ☐ Backend deployed
  ☐ Health check passing
  ☐ Nginx configured
  ☐ Nginx running

FRONTEND (VERCEL)
  ☐ Project imported
  ☐ Root directory set to 'frontend'
  ☐ Framework set to 'Vite'
  ☐ VITE_API_URL environment variable set
  ☐ First deployment successful
  ☐ URL accessible

FINALIZATION
  ☐ CORS configured in backend .env
  ☐ CORS configured in Nginx
  ☐ Backend restarted
  ☐ Nginx reloaded
  ☐ SSL/HTTPS enabled (optional but recommended)
  ☐ Frontend can call backend APIs
  ☐ Login works
  ☐ CRUD operations work
  ☐ No CORS errors

POST-DEPLOYMENT
  ☐ Backup script tested
  ☐ Monitoring set up
  ☐ Documentation updated
  ☐ Team notified
  ☐ DNS configured (if custom domain)
```

---

## 🎯 Success Metrics

After deployment, verify:

```
✅ Frontend accessible at: https://therapyassistance.vercel.app
✅ Backend API at: https://m1234.mikr.us
✅ Health endpoint: https://m1234.mikr.us/health
✅ API docs: https://m1234.mikr.us/docs
✅ Login functionality working
✅ CRUD operations working
✅ No console errors
✅ Response times < 500ms
✅ SSL certificate valid
✅ Backups running
✅ Logs accessible
```

---

**🚀 Deployment Complete! Your app is live!**