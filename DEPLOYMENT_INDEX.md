# 📚 Indeks Dokumentacji Wdrożenia - TherapyAssistance

## 🎯 Szybki Start

### Nigdy wcześniej nie wdrażałeś? Zacznij tutaj:
👉 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Kompletny przewodnik krok po kroku (ZACZNIJ TUTAJ!)

### Znasz proces? Szybka ściąga:
👉 **[DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)** - Wszystkie komendy w 10 minut

### Masz problem? Sprawdź FAQ:
👉 **[DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md)** - Odpowiedzi na najczęstsze pytania

---

## 📁 Struktura Dokumentacji

### 🎓 Przewodniki (Przeczytaj przed wdrożeniem)

| Plik | Opis | Dla kogo | Czas czytania |
|------|------|----------|---------------|
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Pełny przewodnik wdrożenia krok po kroku | Początkujący | 15-20 min |
| **[DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)** | Szybki start - komendy i checklist | Zaawansowani | 5 min |
| **[DEPLOYMENT_README.md](DEPLOYMENT_README.md)** | Opis plików konfiguracyjnych | Wszyscy | 10 min |
| **[DEPLOYMENT_FLOW.md](DEPLOYMENT_FLOW.md)** | Wizualizacja procesu wdrożenia | Wizualnie myślący | 10 min |
| **[DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md)** | Najczęściej zadawane pytania | Rozwiązywanie problemów | Jak potrzebujesz |

### 🔧 Pliki Konfiguracyjne (Nie edytuj bez powodu)

| Plik | Opis | Gdzie używany |
|------|------|---------------|
| `docker-compose.mikrus.yml` | Docker Compose dla Mikrus (tylko backend) | Mikrus VPS |
| `nginx.mikrus.conf` | Konfiguracja Nginx reverse proxy | Mikrus VPS |
| `.env.mikrus.template` | Szablon zmiennych środowiskowych | Mikrus VPS (kopiuj do `.env`) |
| `deploy-mikrus.sh` | Skrypt automatyzacji deployment | Mikrus VPS |
| `frontend/vercel.json` | Konfiguracja Vercel | Vercel |
| `frontend/.env.production` | Zmienne środowiskowe dla Vercel | Vercel |

### 📖 Referencje (Trzymaj pod ręką)

| Plik | Opis | Kiedy używać |
|------|------|--------------|
| **[COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)** | Ściąga z wszystkimi komendami | Codzienne zarządzanie |
| **[DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md)** | Ten plik - przegląd dokumentacji | Nawigacja |

---

## 🚀 Proces Wdrożenia - Quick Reference

```
┌─────────────────────────────────────────────┐
│  1. PRZYGOTOWANIE (10 min)                  │
│     - Kup Mikrus VPS 2.1                    │
│     - Załóż konto Vercel                    │
│     - Utwórz bazę PostgreSQL w Mikrus       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. BACKEND - MIKRUS (15-20 min)            │
│     - SSH do VPS                            │
│     - Instaluj Docker, Nginx, Git           │
│     - Sklonuj projekt                       │
│     - Konfiguruj .env                       │
│     - ./deploy-mikrus.sh init               │
│     - ./deploy-mikrus.sh deploy             │
│     - Konfiguruj Nginx                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. FRONTEND - VERCEL (5 min)               │
│     - Push do GitHub                        │
│     - Import projektu w Vercel              │
│     - Ustaw VITE_API_URL                    │
│     - Deploy                                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. FINALIZACJA (5 min)                     │
│     - Zaktualizuj CORS w .env               │
│     - Zaktualizuj CORS w Nginx              │
│     - Restart backend                       │
│     - Test całości                          │
└─────────────────────────────────────────────┘

⏱️  TOTAL: 30-45 minut
💰 KOSZT: 75 zł/rok (~6 zł/miesiąc)
```

---

## 🎯 Który plik przeczytać?

### Sytuacja 1: "Pierwszy raz wdrażam aplikację"
1. ✅ Przeczytaj: **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**
2. ✅ Miej otwarte: **[COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)**
3. ✅ Jak problem: **[DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md)**

### Sytuacja 2: "Znam Docker/DevOps, chcę szybko wdrożyć"
1. ✅ Przeczytaj: **[DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)**
2. ✅ Sprawdź: **[DEPLOYMENT_README.md](DEPLOYMENT_README.md)** (pliki config)
3. ✅ Miej pod ręką: **[COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)**

### Sytuacja 3: "Coś nie działa!"
1. ✅ Sprawdź: **[DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md)** - sekcja "Problemy Techniczne"
2. ✅ Zobacz: **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - sekcja "Rozwiązywanie Problemów"
3. ✅ Użyj komend z: **[COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)** - sekcja "Troubleshooting"

### Sytuacja 4: "Chcę zrozumieć jak to działa"
1. ✅ Przeczytaj: **[DEPLOYMENT_FLOW.md](DEPLOYMENT_FLOW.md)** - wizualizacje
2. ✅ Potem: **[DEPLOYMENT_README.md](DEPLOYMENT_README.md)** - opis plików
3. ✅ Szczegóły: **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - pełny guide

### Sytuacja 5: "Potrzebuję komendy do..."
1. ✅ **[COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)** - wszystkie komendy
2. ✅ Ctrl+F i szukaj

---

## 📊 Podsumowanie Kosztów

```
┌─────────────────────────────────────────────┐
│  MIESIĘCZNE KOSZTY                          │
├─────────────────────────────────────────────┤
│  Vercel (Frontend)           0 zł           │
│  Mikrus VPS 2.1              6,25 zł/mies   │
│  PostgreSQL (shared)         0 zł           │
│  SSL Certificate             0 zł           │
├─────────────────────────────────────────────┤
│  TOTAL                       6,25 zł/mies   │
│  ROCZNE                      75 zł/rok      │
└─────────────────────────────────────────────┘

Porównanie z innymi:
  Heroku:         ~32 zł/mies (384 zł/rok)
  Railway:        ~23 zł/mies (276 zł/rok)
  DigitalOcean:   ~27 zł/mies (324 zł/rok)
  
💰 Oszczędzasz: 201-309 zł/rok (73-80%)
```

---

## 🏗️ Architektura (Uproszczona)

```
┌──────────────┐
│  Użytkownik  │
└──────┬───────┘
       │
       ├────────────────────┬─────────────────┐
       │                    │                 │
       ▼                    ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Mikrus    │    │ PostgreSQL  │
│  (Frontend) │◄───┤   (Backend) │◄───┤  (Shared)   │
│    FREE     │    │  75 zł/rok  │    │   0 zł      │
└─────────────┘    └─────────────┘    └─────────────┘
  React + Vite      FastAPI + Docker    Mikrus Panel
```

---

## ✅ Checklist Przed Wdrożeniem

### Przygotowanie:
- [ ] Mikrus VPS 2.1 zakupiony
- [ ] Baza PostgreSQL utworzona w panelu Mikrus
- [ ] Credentials zapisane (DB_USER, DB_PASSWORD, DB_NAME)
- [ ] Konto Vercel założone
- [ ] Kod na GitHub

### Wiedza:
- [ ] Przeczytałem przewodnik deployment
- [ ] Wiem jak połączyć się przez SSH
- [ ] Mam ściągawkę z komendami

### Narzędzia (na lokalnym komputerze):
- [ ] SSH client
- [ ] Git
- [ ] Terminal/Command Line

---

## 🔄 Workflow po Wdrożeniu

### Aktualizacja Backendu:
```bash
ssh root@m1234.mikr.us
cd /opt/apps/therapyassistance
git pull
./deploy-mikrus.sh update
```
⏱️ Downtime: ~30 sekund

### Aktualizacja Frontendu:
```bash
git push origin main
```
⏱️ Auto-deploy w 2-3 minuty, zero downtime

### Backup:
```bash
./deploy-mikrus.sh backup
```
⏱️ 1-2 minuty, zapisuje do `./backups/`

---

## 🆘 Najczęstsze Problemy

| Problem | Sprawdź | Rozwiązanie |
|---------|---------|-------------|
| Backend nie odpowiada | `docker ps` | `./deploy-mikrus.sh restart` |
| CORS error | .env, Nginx config | Zaktualizuj ALLOWED_ORIGINS |
| Błąd bazy danych | Credentials w .env | Sprawdź panel Mikrus |
| Frontend nie łączy się | VITE_API_URL w Vercel | Ustaw i redeploy |
| 502 Bad Gateway | Backend status | Restart Dockera |
| SSL nie działa | Certbot certificates | `certbot renew` |

**Szczegóły:** Zobacz [DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md)

---

## 📞 Pomoc i Wsparcie

### Dokumentacja:
- **TherapyAssistance Docs:** Pliki DEPLOYMENT_*.md w tym katalogu
- **Mikrus Wiki:** https://wiki.mikr.us
- **Vercel Docs:** https://vercel.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **React Docs:** https://react.dev

### Community:
- **Mikrus Forum:** https://forum.mikr.us
- **Mikrus Discord:** Link w panelu Mikrus
- **Vercel Community:** https://github.com/vercel/vercel/discussions

### Support:
- **Mikrus:** [email protected], Discord, Forum
- **Vercel:** https://vercel.com/support

---

## 📝 Notatki

### Ważne URLs:
- Panel Mikrus: https://mikr.us/panel
- Vercel Dashboard: https://vercel.com/dashboard
- Twój VPS: `ssh root@m1234.mikr.us` (zamień m1234)
- Twój Backend: https://m1234.mikr.us
- Twój Frontend: https://therapyassistance.vercel.app

### Ważne Pliki na VPS:
- Projekt: `/opt/apps/therapyassistance`
- Nginx config: `/etc/nginx/sites-available/therapyassistance`
- Backupy: `/opt/apps/therapyassistance/backups/`
- Logi Nginx: `/var/log/nginx/`

### Komendy do zapamiętania:
```bash
./deploy-mikrus.sh logs      # Zobacz logi
./deploy-mikrus.sh restart   # Restart
./deploy-mikrus.sh backup    # Backup
./deploy-mikrus.sh update    # Update
```

---

## 🎓 Kolejność Nauki

### Poziom 1 - Podstawy (Musisz wiedzieć):
1. ✅ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Przeczytaj całość
2. ✅ [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) - Zapamiętaj główne komendy
3. ✅ Wykonaj pierwsze wdrożenie

### Poziom 2 - Zarządzanie (Po wdrożeniu):
1. ✅ [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md) - Zapoznaj się ze wszystkimi komendami
2. ✅ [DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md) - Przeczytaj najczęstsze problemy
3. ✅ Wykonaj backup, update, restart

### Poziom 3 - Zaawansowane (Opcjonalne):
1. ✅ [DEPLOYMENT_FLOW.md](DEPLOYMENT_FLOW.md) - Zrozum cały proces
2. ✅ [DEPLOYMENT_README.md](DEPLOYMENT_README.md) - Szczegóły konfiguracji
3. ✅ Skonfiguruj monitoring, custom domain, SSL

---

## 🚀 Quick Links

| Co chcesz zrobić? | Gdzie szukać? |
|-------------------|---------------|
| Wdrożyć pierwszy raz | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| Szybko wdrożyć (znam proces) | [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) |
| Znaleźć komendę | [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md) |
| Rozwiązać problem | [DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md) |
| Zrozumieć jak działa | [DEPLOYMENT_FLOW.md](DEPLOYMENT_FLOW.md) |
| Zrozumieć pliki config | [DEPLOYMENT_README.md](DEPLOYMENT_README.md) |

---

**Gotowy do wdrożenia? Zacznij od [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)! 🚀**

**Pytania? Sprawdź [DEPLOYMENT_FAQ.md](DEPLOYMENT_FAQ.md)! ❓**

**Powodzenia! 🎉**