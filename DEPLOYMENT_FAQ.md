# ❓ FAQ - Wdrożenie TherapyAssistance

## 📋 Spis Treści

- [Pytania Ogólne](#pytania-ogólne)
- [Mikrus VPS](#mikrus-vps)
- [Vercel](#vercel)
- [Baza Danych](#baza-danych)
- [Docker](#docker)
- [Nginx](#nginx)
- [SSL/HTTPS](#sslhttps)
- [CORS](#cors)
- [Problemy Techniczne](#problemy-techniczne)
- [Koszty i Płatności](#koszty-i-płatności)
- [Aktualizacje](#aktualizacje)

---

## Pytania Ogólne

### Czy potrzebuję doświadczenia z DevOps?

**Nie!** Przewodnik jest napisany dla osób bez doświadczenia. Wystarczy:
- Podstawowa znajomość terminala/konsoli
- Umiejętność kopiowania i wklejania komend
- Cierpliwość do przeczytania instrukcji

### Ile czasu zajmuje pierwsze wdrożenie?

**Około 30-45 minut** przy pierwszym wdrożeniu, jeśli postępujesz zgodnie z przewodnikiem.

Podział:
- Przygotowanie (zakup usług): 10 min
- Backend (Mikrus): 15-20 min
- Frontend (Vercel): 5 min
- Finalizacja (CORS, testy): 10 min

### Czy mogę najpierw przetestować na darmowych usługach?

**Tak!** Możesz zacząć od:
- **Vercel** - frontend (darmowy)
- **Railway** lub **Render** - backend + DB (darmowe tier z limitami)

Potem migruj na Mikrus, gdy będziesz gotowy na produkcję.

### Co jeśli coś pójdzie nie tak?

1. Sprawdź sekcję [Rozwiązywanie Problemów](DEPLOYMENT_GUIDE.md#rozwiązywanie-problemów)
2. Zobacz logi: `./deploy-mikrus.sh logs`
3. Sprawdź [Problemy Techniczne](#problemy-techniczne) poniżej
4. Zadaj pytanie na forum Mikrus lub GitHub Issues

---

## Mikrus VPS

### Który plan Mikrus wybrać?

**Mikrus 2.1** (75 zł/rok) - **Zalecany** dla większości przypadków:
- ✅ 1GB RAM - wystarczy dla małej/średniej aplikacji
- ✅ 10GB dysk
- ✅ **Wspiera Dockera**
- ✅ Współdzielona PostgreSQL
- ✅ Idealny stosunek cena/wydajność

**Mikrus 1.0** ❌ NIE - nie wspiera Dockera!

**Mikrus 3.0** (130 zł/rok) - wybierz jeśli:
- Spodziewasz się dużego ruchu
- Potrzebujesz więcej RAM
- Planujesz dodatkowe serwisy

### Jak zalogować się do VPS przez SSH?

```bash
# Z terminala (Linux/Mac)
ssh root@m1234.mikr.us

# Windows - użyj PuTTY lub Windows Terminal
```

Hasło znajdziesz w panelu Mikrus → Twój serwer → Dostęp SSH.

### Czy mogę mieć kilka projektów na jednym VPS Mikrus?

**Tak!** Możesz hostować wiele projektów, dopóki wystarczy RAM i dysk.

Wskazówki:
- Każdy projekt w osobnym katalogu (`/opt/apps/projekt1`, `/opt/apps/projekt2`)
- Osobne kontenery Docker
- Osobne konfiguracje Nginx (różne `server_name` lub porty)

### Co to znaczy "współdzielona PostgreSQL"?

Mikrus udostępnia wspólny serwer PostgreSQL dla wszystkich użytkowników planu 2.x/3.x.

**Zalety:**
- ✅ Nie zajmuje RAM na Twoim VPS
- ✅ Zarządzana przez Mikrus (backupy, aktualizacje)
- ✅ Darmowa (w cenie VPS)

**Jak używać:**
- Tworzysz bazę w panelu Mikrus
- Dostajesz credentials (host, user, password)
- Łączysz się z `postgres.mikr.us:5432`

### Czy mogę używać własnej PostgreSQL na VPS?

**Tak**, ale nie jest to zalecane dla Mikrus 2.1 (1GB RAM):
- Własna PostgreSQL zabierze ~200-300MB RAM
- Pozostanie tylko ~700MB dla backendu
- Możliwe problemy z wydajnością

**Lepiej:** Użyj współdzielonej bazy (0MB RAM na VPS!).

### Co jeśli zapełni się dysk?

```bash
# Sprawdź wykorzystanie
df -h

# Wyczyść stare obrazy Docker
docker system prune -a

# Wyczyść logi
truncate -s 0 /var/log/nginx/*.log

# Usuń stare backupy
rm -f /opt/apps/therapyassistance/backups/*_old.dump.gz
```

Mikrus 2.1 ma 10GB - powinno wystarczyć. Jeśli nie, upgrade do 3.0 (25GB).

### Jak zrestartować VPS?

```bash
# Soft restart
reboot

# Lub z panelu Mikrus: Zarządzanie → Restart
```

**UWAGA:** Po restarcie Docker może nie uruchomić się automatycznie:
```bash
systemctl enable docker
```

---

## Vercel

### Czy Vercel FREE wystarczy?

**Tak!** Plan darmowy obejmuje:
- 100 GB bandwidth/miesiąc
- Unlimited deployments
- Custom domains
- SSL/HTTPS
- Global CDN

Dla małej/średniej aplikacji terapeutycznej to **więcej niż wystarczy**.

### Jak zmienić zmienne środowiskowe na Vercel?

1. Dashboard → Twój projekt
2. **Settings** → **Environment Variables**
3. Edytuj `VITE_API_URL`
4. **Save**
5. **Important:** Redeploy projektu!
   - Deployments → ⋯ Menu → Redeploy

### Czy mogę używać własnej domeny?

**Tak!**

1. Kup domenę (nazwa.pl, OVH, Cloudflare, itp.)
2. Vercel → Settings → Domains → Add Domain
3. Postępuj zgodnie z instrukcjami DNS
4. Vercel automatycznie skonfiguruje SSL

**Koszt domeny:** ~50-60 zł/rok dla .pl lub .com

### Dlaczego build Vercel się nie udał?

**Najczęstsze przyczyny:**

1. **Błędny Root Directory:**
   - Upewnij się: Root Directory = `frontend`

2. **Błędy TypeScript:**
   - Sprawdź logi build
   - Popraw błędy lokalnie: `npm run build`

3. **Brakujące dependencies:**
   - Sprawdź `package.json`
   - Commit i push ponownie

4. **Node version:**
   - Vercel Settings → Node.js Version → 18.x

### Jak zobaczyć logi Vercel?

Dashboard → Twój projekt → Deployments → Click na deployment → Logs

### Czy Vercel automatycznie deployuje po push?

**Tak!** Po połączeniu z GitHub:
- Push do `main` → Production deploy
- Push do innych branchy → Preview deploy
- Pull Request → Preview deploy

---

## Baza Danych

### Jak uzyskać credentials do bazy PostgreSQL na Mikrus?

1. Panel Mikrus (https://mikr.us/panel)
2. **Bazy danych** → **PostgreSQL**
3. **Dodaj nową bazę**
4. Zapisz:
   - Host: `postgres.mikr.us`
   - Port: `5432`
   - User: `m1234_username`
   - Password: `[pokazane]`
   - Database: `m1234_nazwabazy`

### Jak połączyć się z bazą z lokalnego komputera?

```bash
# Zainstaluj psql client
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# macOS:
brew install postgresql

# Połącz się:
psql -h postgres.mikr.us -U m1234_username -d m1234_therapyassistance
```

### Jak zrobić backup bazy danych?

**Automatyczny (z VPS):**
```bash
./deploy-mikrus.sh backup
```

**Ręczny (z lokalnego komputera):**
```bash
pg_dump -h postgres.mikr.us -U m1234_user -d m1234_db -F c -f backup.dump
```

### Jak przywrócić bazę z backupu?

```bash
./deploy-mikrus.sh restore
# Podaj ścieżkę do pliku backup
```

### Czy mogę zobaczyć zawartość bazy?

**Tak!** Użyj narzędzi graficznych:

- **pgAdmin** - https://www.pgadmin.org/
- **DBeaver** - https://dbeaver.io/
- **TablePlus** - https://tableplus.com/

Podaj credentials z panelu Mikrus.

### Co jeśli zapomniałem hasła do bazy?

1. Panel Mikrus → Bazy danych → PostgreSQL
2. Znajdź swoją bazę
3. Kliknij "Pokaż hasło" lub "Resetuj hasło"

---

## Docker

### Czy muszę znać Docker?

**Nie!** Skrypty automatyzują wszystko:
- `./deploy-mikrus.sh deploy` - buduje i uruchamia
- `./deploy-mikrus.sh restart` - restartuje
- `./deploy-mikrus.sh logs` - pokazuje logi

Ale podstawowa znajomość pomoże w debugowaniu.

### Jak sprawdzić czy Docker działa?

```bash
# Status Docker
systemctl status docker

# Lista kontenerów
docker ps

# Wszystkie kontenery (włączone + wyłączone)
docker ps -a
```

### Kontener nie startuje - co robić?

```bash
# Zobacz logi
docker logs therapyassistance-backend

# Sprawdź dlaczego nie działa
docker inspect therapyassistance-backend

# Restart
./deploy-mikrus.sh restart
```

### Jak wejść do kontenera (shell)?

```bash
docker exec -it therapyassistance-backend bash

# Lub sh jeśli bash nie działa
docker exec -it therapyassistance-backend sh
```

### Jak wyczyścić Docker (problem z miejscem)?

```bash
# Usuń nieużywane obrazy, kontenery, sieci
docker system prune -a

# Usuń wszystko (UWAGA: stracisz dane!)
docker system prune -a --volumes
```

### Kontener ciągle się restartuje?

```bash
# Zobacz logi
./deploy-mikrus.sh logs

# Najczęstsze przyczyny:
# 1. Błąd w kodzie (check logs)
# 2. Brak połączenia z bazą (check .env credentials)
# 3. Za mało RAM (check: docker stats)
```

---

## Nginx

### Po co mi Nginx?

Nginx to **reverse proxy** - siedzi przed Dockerem i:
- ✅ Obsługuje SSL/HTTPS
- ✅ Dodaje security headers
- ✅ Kompresuje odpowiedzi (gzip)
- ✅ Obsługuje CORS
- ✅ Loguje requesty
- ✅ Load balancing (w przyszłości)

### Jak sprawdzić czy Nginx działa?

```bash
# Status
systemctl status nginx

# Test konfiguracji
nginx -t

# Restart
systemctl restart nginx

# Reload (bez downtime)
systemctl reload nginx
```

### Błąd "nginx: configuration file test failed"

```bash
# Sprawdź składnię
nginx -t

# Zobacz dokładny błąd
# Najczęściej:
# - Brak średnika
# - Niepoprawna ścieżka do pliku SSL
# - Duplikaty server_name

# Popraw plik
nano /etc/nginx/sites-available/therapyassistance

# Testuj ponownie
nginx -t
```

### Gdzie są logi Nginx?

```bash
# Access log (wszystkie requesty)
tail -f /var/log/nginx/therapyassistance_access.log

# Error log (tylko błędy)
tail -f /var/log/nginx/therapyassistance_error.log

# Wszystkie logi Nginx
tail -f /var/log/nginx/*.log
```

### Nginx pokazuje "502 Bad Gateway"

**Przyczyna:** Nginx nie może połączyć się z backendem (Docker).

**Rozwiązanie:**
```bash
# 1. Sprawdź czy backend działa
docker ps | grep backend

# 2. Sprawdź czy backend odpowiada
curl http://localhost:8000/health

# 3. Jeśli nie - restart backend
./deploy-mikrus.sh restart

# 4. Sprawdź logi
./deploy-mikrus.sh logs
```

### Jak zmienić domenę w Nginx?

```bash
nano /etc/nginx/sites-available/therapyassistance

# Znajdź:
server_name your-domain.mikr.us;

# Zmień na:
server_name m1234.mikr.us;

# Zapisz i reload
nginx -t && systemctl reload nginx
```

---

## SSL/HTTPS

### Czy potrzebuję SSL?

**Tak!** Zwłaszcza w aplikacji medycznej/terapeutycznej.

**Dlaczego:**
- 🔒 Bezpieczeństwo danych pacjentów
- 🔒 Szyfrowanie JWT tokenów
- ✅ Zaufanie użytkowników
- ✅ SEO (Google preferuje HTTPS)
- ✅ Nowoczesne API (wymagają HTTPS)

### Jak włączyć SSL z Let's Encrypt?

```bash
# 1. Instalacja Certbot
apt-get install -y certbot python3-certbot-nginx

# 2. Uzyskaj certyfikat
certbot --nginx -d m1234.mikr.us

# 3. Postępuj zgodnie z promptami
# - Email: twoj@email.com
# - Agree to ToS: Yes
# - Redirect HTTP to HTTPS: Yes (2)

# 4. Certbot automatycznie zaktualizuje Nginx!
```

### Certyfikat SSL wygasł - co robić?

```bash
# Odnów ręcznie
certbot renew

# Sprawdź auto-renewal
certbot renew --dry-run

# Auto-renewal powinno być skonfigurowane automatycznie
systemctl status certbot.timer
```

### "Your connection is not private" - co robić?

**Przyczyny:**
1. Certyfikat wygasł → `certbot renew`
2. Niepoprawna konfiguracja SSL → sprawdź Nginx config
3. Niepoprawna domena → sprawdź `server_name`

```bash
# Sprawdź certyfikat
certbot certificates

# Sprawdź daty ważności
openssl s_client -connect m1234.mikr.us:443 -servername m1234.mikr.us
```

### Czy mogę używać HTTP zamiast HTTPS?

**Nie zalecane** w produkcji, ale możliwe dla testów.

W `nginx.mikrus.conf` użyj sekcji HTTP (zakomentowanej na dole pliku).

---

## CORS

### Co to jest CORS i dlaczego jest ważny?

**CORS** (Cross-Origin Resource Sharing) = bezpieczeństwo przeglądarek.

**Problem:** Frontend (vercel.app) ≠ Backend (mikr.us) = różne domeny

**Rozwiązanie:** Backend musi powiedzieć: "Tak, vercel.app może mnie odpytywać"

### Błąd CORS w konsoli - co robić?

```
Access to fetch at 'https://m1234.mikr.us/...' from origin 
'https://therapyassistance.vercel.app' has been blocked by CORS policy
```

**Sprawdź:**

1. **Backend `.env`:**
```bash
ssh root@m1234.mikr.us
cat /opt/apps/therapyassistance/.env | grep ALLOWED_ORIGINS

# Powinno być:
ALLOWED_ORIGINS=https://therapyassistance.vercel.app
```

2. **Nginx config:**
```bash
cat /etc/nginx/sites-available/therapyassistance | grep Access-Control

# Powinno być:
add_header Access-Control-Allow-Origin "https://therapyassistance.vercel.app" always;
```

3. **Restart wszystko:**
```bash
cd /opt/apps/therapyassistance
./deploy-mikrus.sh restart
systemctl reload nginx
```

### Czy mogę dodać wiele domen do CORS?

**Tak!**

**Backend `.env`:**
```bash
ALLOWED_ORIGINS=https://therapyassistance.vercel.app,https://twoja-domena.com,http://localhost:5173
```

**Nginx:** Niestety, tylko jedna domena. Alternatywa:
```nginx
# Usuń statyczny header, niech backend obsługuje CORS
# (usuń linię add_header Access-Control-Allow-Origin)
```

### CORS działa lokalnie, ale nie na produkcji?

**Sprawdź:**
1. Czy URL w `.env` się zgadza (http vs https)
2. Czy zrestartowałeś backend po zmianie `.env`
3. Czy Nginx ma poprawny origin
4. Czy Vercel ma poprawny `VITE_API_URL`

---

## Problemy Techniczne

### Backend nie odpowiada na requesty

**Diagnoza:**
```bash
# 1. Sprawdź czy kontener działa
docker ps | grep backend

# 2. Sprawdź health endpoint
curl http://localhost:8000/health

# 3. Zobacz logi
./deploy-mikrus.sh logs

# 4. Sprawdź Nginx
systemctl status nginx
tail -f /var/log/nginx/therapyassistance_error.log
```

**Typowe rozwiązania:**
- Restart: `./deploy-mikrus.sh restart`
- Przebuduj: `./deploy-mikrus.sh update`
- Sprawdź .env credentials

### "Cannot connect to database"

```bash
# 1. Sprawdź credentials w .env
cat .env | grep DB_

# 2. Test połączenia
psql -h postgres.mikr.us -U m1234_user -d m1234_db

# 3. Sprawdź czy DB istnieje w panelu Mikrus

# 4. Sprawdź logi backendu
./deploy-mikrus.sh logs
```

### Za mało pamięci RAM na VPS

```bash
# Sprawdź użycie
free -h
docker stats

# Rozwiązania:

# 1. Dodaj SWAP (tymczasowa pamięć)
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 2. Wyłącz niepotrzebne serwisy
systemctl disable apache2  # jeśli istnieje

# 3. Upgrade do Mikrus 3.0 (2GB RAM)
```

### Frontend nie ładuje CSS/JS

**Sprawdź:**
1. Vercel build logs - czy build się powiódł?
2. Browser Console (F12) - jakie błędy?
3. Network tab - czy pliki są pobierane?

**Rozwiązanie:**
```bash
# Lokalnie sprawdź czy build działa
cd frontend
npm run build
npm run preview

# Jeśli działa - redeploy na Vercel
```

### "500 Internal Server Error"

**Backend error** - sprawdź logi:
```bash
./deploy-mikrus.sh logs

# Najczęstsze przyczyny:
# - Błąd w kodzie Python
# - Błąd bazy danych (migracje?)
# - Brakujący .env variable
```

---

## Koszty i Płatności

### Czy Mikrus ma jakieś ukryte koszty?

**Nie!** Cena 75 zł/rok to wszystko:
- VPS 2.1
- Współdzielona PostgreSQL
- Backup space
- Bandwidth (nielimitowany w rozsądnych granicach)

### Czy mogę anulować w każdej chwili?

**Tak**, ale Mikrus **nie zwraca** pieniędzy proporcjonalnie.

Płacisz za rok z góry. Lepiej wziąć na próbę 1 miesiąc (7 zł) przed rocznym planem.

### Co się stanie gdy nie przedłużę subskrypcji?

1. **7 dni przed** - przypomnienie email
2. **Dzień wygaśnięcia** - VPS działa jeszcze kilka dni (grace period)
3. **Po grace period** - VPS wyłączony
4. **Po ~30 dniach** - dane usunięte bezpowrotnie

**WAŻNE:** Zrób backup przed wygaśnięciem!

### Czy Vercel może nagle zacząć kosztować?

**Bardzo mało prawdopodobne** dla małej aplikacji.

Free tier limity:
- 100 GB bandwidth/miesiąc
- 100 GB-hours compute/miesiąc
- Unlimited deployments
- Unlimited domains

Dla aplikacji terapeutycznej (kilkudziesięciu użytkowników) **nigdy** nie przekroczysz limitów.

Jeśli przekroczysz - Vercel Cię **ostrzeże** przed naładowaniem.

---

## Aktualizacje

### Jak zaktualizować backend?

```bash
# SSH do VPS
ssh root@m1234.mikr.us

# Przejdź do projektu
cd /opt/apps/therapyassistance

# Pobierz zmiany
git pull origin main

# Zaktualizuj
./deploy-mikrus.sh update
```

**Downtime:** ~30 sekund podczas restartu kontenera.

### Jak zaktualizować frontend?

**Automatycznie!** Wystarczy:
```bash
git push origin main
```

Vercel automatycznie zbuduje i wdropny nową wersję w ~2-3 minuty.

**Zero downtime** - Vercel robi "atomic swap".

### Jak zaktualizować zależności (npm/pip)?

**Frontend:**
```bash
cd frontend
npm update
npm audit fix
git commit -am "Update dependencies"
git push
```

**Backend:**
```bash
cd backend
pip list --outdated
# Zaktualizuj requirements.txt
git commit -am "Update dependencies"
git push

# Na VPS:
./deploy-mikrus.sh update
```

### Czy mogę rollback do poprzedniej wersji?

**Frontend (Vercel):**
- Dashboard → Deployments → Znajdź poprzedni deployment → Promote to Production

**Backend (Mikrus):**
```bash
git log  # Zobacz commity
git checkout <commit-hash>
./deploy-mikrus.sh update
```

---

## 🆘 Pilna Pomoc

### Aplikacja nie działa - co robić NAJPIERW?

```bash
# 1. Sprawdź health endpoint
curl https://m1234.mikr.us/health

# 2. Sprawdź czy kontener działa
ssh root@m1234.mikr.us
docker ps

# 3. Zobacz logi
cd /opt/apps/therapyassistance
./deploy-mikrus.sh logs

# 4. Restart wszystkiego
./deploy-mikrus.sh restart
systemctl reload nginx

# 5. Jeśli nadal nie działa - sprawdź FAQ powyżej
```

### Gdzie szukać pomocy?

1. **Ta dokumentacja:**
   - `DEPLOYMENT_GUIDE.md` - pełny przewodnik
   - `DEPLOYMENT_QUICKSTART.md` - szybkie komendy
   - `DEPLOYMENT_FAQ.md` - ten plik

2. **Mikrus:**
   - Forum: https://forum.mikr.us
   - Discord: Link w panelu Mikrus
   - Email: [email protected]

3. **Vercel:**
   - Docs: https://vercel.com/docs
   - Support: https://vercel.com/support
   - Community: https://github.com/vercel/vercel/discussions

4. **GitHub Issues:**
   - Utwórz issue w swoim repo z opisem problemu

---

**Nie znalazłeś odpowiedzi?** 

Utwórz issue na GitHub lub zapytaj na forum Mikrus - społeczność bardzo chętnie pomaga! 🚀