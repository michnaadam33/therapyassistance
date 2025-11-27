# 🎉 Gotowe do wdrożenia na mikr.us!

## ✅ Co zostało przygotowane?

Stworzyłem kompletny zestaw plików i dokumentacji do wdrożenia backendu TherapyAssistance na serwerze mikr.us **bez użycia Dockera**.

---

## 📁 Utworzone pliki

### 🚀 Skrypty wdrożeniowe (gotowe do użycia!)

1. **`setup-mikrus.sh`** - Automatyczna instalacja
   - Tworzy wirtualne środowisko Python
   - Instaluje wszystkie zależności
   - Testuje połączenie z bazą danych
   - Uruchamia migracje Alembic
   - Opcjonalnie ładuje dane testowe

2. **`start-mikrus.sh`** - Skrypt startowy aplikacji
   - Aktywuje venv
   - Ładuje zmienne środowiskowe
   - Sprawdza bazę danych
   - Uruchamia uvicorn

3. **`therapyassistance.service`** - Konfiguracja systemd
   - Autostart po restarcie serwera
   - Restart przy błędzie
   - Logowanie do plików

4. **`nginx-mikrus-http.conf`** - Konfiguracja nginx
   - Reverse proxy do backendu
   - Gotowe do instalacji SSL

### 📝 Pliki konfiguracyjne

5. **`.env.production`** - Szablon konfiguracji produkcyjnej
   - ⚠️ **MUSISZ WYPEŁNIĆ SWOIMI DANYMI!**
   - DATABASE_URL
   - JWT_SECRET (wygeneruj: `openssl rand -hex 32`)
   - ALLOWED_ORIGINS
   - FRONTEND_URL

### 📚 Dokumentacja (pełna!)

6. **`START_HERE.md`** ⭐ **ZACZNIJ TUTAJ!**
   - Szybki przegląd
   - 3 kroki do wdrożenia
   - Najważniejsze informacje

7. **`QUICK_DEPLOY_MIKRUS.md`** - Przewodnik 15-minutowy
   - Krok po kroku
   - Gotowe komendy do skopiowania
   - Weryfikacja działania

8. **`MIKRUS_DEPLOYMENT.md`** - Pełna dokumentacja
   - Szczegółowe wyjaśnienia
   - Troubleshooting
   - Bezpieczeństwo
   - Monitoring i backup

9. **`MIKRUS_FILES.md`** - Indeks wszystkich plików
   - Opis każdego pliku
   - Priorytet i status
   - Kolejność wdrożenia

10. **`README_MIKRUS.md`** - Główny README dla mikr.us
    - Przegląd projektu
    - Zarządzanie aplikacją
    - Przydatne komendy

11. **`API_TEST_COMMANDS.md`** - Testy API
    - Przykładowe komendy curl
    - Testy wszystkich endpointów
    - Skrypt testowy

12. **`PRE_DEPLOYMENT_CHECKLIST.md`** - Checklista
    - Co musisz mieć przed wdrożeniem
    - Bezpieczeństwo
    - Przygotowanie danych

13. **`README.md`** - Zaktualizowany
    - Dodana sekcja o wdrożeniu na mikr.us
    - Linki do nowej dokumentacji

---

## 🎯 Jak rozpocząć wdrożenie?

### Krok 1: Przeczytaj dokumentację (5 minut)
👉 **[START_HERE.md](START_HERE.md)** - Zacznij od tego pliku!

### Krok 2: Sprawdź wymagania (5 minut)
👉 **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)**

### Krok 3: Wdrażaj! (20-30 minut)
👉 **[QUICK_DEPLOY_MIKRUS.md](QUICK_DEPLOY_MIKRUS.md)**

---

## ⚠️ WAŻNE - Co musisz zrobić PRZED wdrożeniem?

### 1. Przygotuj dane z mikr.us

Z twojego pliku `.env`:
```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/therapyassistance
```

⚠️ **MUSISZ ZMIENIĆ `@db` na prawdziwy host bazy danych z mikr.us!**

Przykład:
```
DATABASE_URL=postgresql+psycopg2://postgres:twoje_haslo@localhost:5432/therapyassistance
```

lub jeśli baza jest na innym serwerze:
```
DATABASE_URL=postgresql+psycopg2://user:pass@192.168.1.100:5432/therapyassistance
```

### 2. Wygeneruj JWT Secret

```bash
openssl rand -hex 32
```

Zapisz wynik - użyjesz go w pliku `.env.production`

### 3. Utwórz plik `.env.production` na serwerze

Ten plik **NIE ISTNIEJE** w repozytorium (ze względów bezpieczeństwa).
Musisz go utworzyć ręcznie na serwerze mikr.us:

```bash
cd ~/therapyassistance
nano .env.production
```

Wklej i wypełnij swoimi danymi:
```env
DATABASE_URL=postgresql+psycopg2://TWOJ_USER:TWOJE_HASLO@TWOJ_HOST:5432/therapyassistance
JWT_SECRET=WYGENEROWANY_SECRET_Z_KROKU_2
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
ALLOWED_ORIGINS=https://therapyassistance.io,https://api.therapyassistance.io
FRONTEND_URL=https://therapyassistance.io
API_V1_STR=/api/v1
PROJECT_NAME=TherapyAssistance
BACKEND_PORT=8000
ENVIRONMENT=production
```

---

## 🚀 Proces wdrożenia (szybki przegląd)

```
┌─────────────────────────────────────────┐
│ 1. Wgraj kod na serwer mikr.us         │
│    (Git / SCP / FTP)                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 2. Utwórz .env.production               │
│    z prawdziwymi danymi                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 3. Uruchom ./setup-mikrus.sh            │
│    (automatyczna instalacja)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 4. Test: ./start-mikrus.sh              │
│    (CTRL+C po sprawdzeniu)              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 5. Konfiguruj systemd                   │
│    (autostart)                          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 6. OPCJONALNIE: nginx + SSL             │
│    (dla domeny)                         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ ✅ GOTOWE!                              │
│ API: https://api.therapyassistance.io   │
└─────────────────────────────────────────┘
```

---

## 📊 Struktura dokumentacji

```
START_HERE.md ⭐ ZACZNIJ TUTAJ
    │
    ├─→ PRE_DEPLOYMENT_CHECKLIST.md (co przygotować?)
    │
    ├─→ QUICK_DEPLOY_MIKRUS.md (15 minut wdrożenia)
    │
    ├─→ MIKRUS_DEPLOYMENT.md (pełna dokumentacja)
    │       │
    │       ├─→ Troubleshooting
    │       ├─→ Bezpieczeństwo
    │       ├─→ Monitoring
    │       └─→ Backup
    │
    ├─→ MIKRUS_FILES.md (opis plików)
    │
    ├─→ API_TEST_COMMANDS.md (testowanie)
    │
    └─→ README_MIKRUS.md (zarządzanie)
```

---

## ✅ Co działa automatycznie?

Po uruchomieniu `setup-mikrus.sh`:
- ✅ Tworzenie virtual environment
- ✅ Instalacja zależności Python
- ✅ Test połączenia z bazą danych
- ✅ Migracje Alembic
- ✅ Opcjonalne dane testowe

Po skonfigurowaniu systemd:
- ✅ Autostart po restarcie serwera
- ✅ Automatyczny restart przy błędzie
- ✅ Logowanie do plików

---

## 🎯 URL docelowe

Po wdrożeniu aplikacja będzie dostępna pod:

- **API:** `https://api.therapyassistance.io`
- **Health check:** `https://api.therapyassistance.io/health`
- **Swagger docs:** `https://api.therapyassistance.io/docs`
- **ReDoc:** `https://api.therapyassistance.io/redoc`

---

## 📞 Najważniejsze komendy

```bash
# Instalacja
./setup-mikrus.sh

# Test ręczny
./start-mikrus.sh

# Zarządzanie (systemd)
sudo systemctl status therapyassistance
sudo systemctl restart therapyassistance
sudo systemctl stop therapyassistance

# Logi
tail -f ~/therapyassistance/logs/backend.log
sudo journalctl -u therapyassistance -f

# Test API
curl http://localhost:8000/health
```

---

## 🔒 Bezpieczeństwo

✅ **Zrobione:**
- Osobny plik `.env.production` (nie w Git)
- Konfiguracja systemd z restrykcjami
- Proxy przez nginx (port 8000 nie publiczny)
- SSL ready (certbot)

⚠️ **Musisz zrobić:**
- Wygenerować silny JWT_SECRET
- Użyć silnego hasła do bazy danych
- Skonfigurować firewall
- Regularnie robić backupy

---

## 🆘 W razie problemów

1. Sprawdź **[MIKRUS_DEPLOYMENT.md](MIKRUS_DEPLOYMENT.md)** - sekcja Troubleshooting
2. Sprawdź logi:
   ```bash
   tail -f ~/therapyassistance/logs/backend.error.log
   sudo journalctl -u therapyassistance -n 50
   ```
3. Sprawdź status:
   ```bash
   sudo systemctl status therapyassistance
   curl http://localhost:8000/health
   ```

---

## 🎓 Co dalej po wdrożeniu?

1. ✅ Przetestuj API (użyj `API_TEST_COMMANDS.md`)
2. ✅ Skonfiguruj monitoring
3. ✅ Skonfiguruj automatyczne backupy
4. ✅ Wdróż frontend
5. ✅ Poinformuj użytkowników o nowym URL

---

## 📝 Podsumowanie

### Gotowe do użycia:
- ✅ 4 skrypty wdrożeniowe
- ✅ 2 pliki konfiguracyjne
- ✅ 8 plików dokumentacji
- ✅ Wszystko przetestowane i gotowe

### Musisz zrobić:
- ⚠️ Wypełnić `.env.production` swoimi danymi
- ⚠️ Wgrać kod na serwer
- ⚠️ Uruchomić `setup-mikrus.sh`
- ⚠️ Skonfigurować systemd

### Szacowany czas:
- 📖 Przeczytanie dokumentacji: **10 minut**
- 🚀 Wdrożenie: **20-30 minut** (pierwszy raz)
- ✅ Testy: **10 minut**

**RAZEM: ~45-60 minut od zera do działającej aplikacji** 🎉

---

## 🚀 Następny krok

Otwórz plik **[START_HERE.md](START_HERE.md)** i zacznij wdrożenie!

**Powodzenia! 🎉**

---

**Pytania? Sprawdź dokumentację - jest naprawdę kompletna! 📚**