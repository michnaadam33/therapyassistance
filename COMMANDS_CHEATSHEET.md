# 🎯 Commands Cheatsheet - TherapyAssistance Deployment

Szybka ściąga z najważniejszymi komendami dla wdrożenia i zarządzania aplikacją.

---

## 📦 MIKRUS VPS - Podstawowe Komendy

### SSH & Nawigacja
```bash
# Połącz się z VPS
ssh root@m1234.mikr.us

# Przejdź do projektu
cd /opt/apps/therapyassistance

# Lista plików
ls -la

# Edytuj plik
nano .env
nano nginx.mikrus.conf
```

---

## 🚀 Deployment Script Commands

```bash
# Inicjalizacja (tylko pierwszy raz)
./deploy-mikrus.sh init

# Deploy/Redeploy aplikacji
./deploy-mikrus.sh deploy

# Restart serwisów
./deploy-mikrus.sh restart

# Stop serwisów
./deploy-mikrus.sh stop

# Zobacz logi (live)
./deploy-mikrus.sh logs

# Status kontenerów
./deploy-mikrus.sh status

# Backup bazy danych
./deploy-mikrus.sh backup

# Restore z backupu
./deploy-mikrus.sh restore

# Update (git pull + rebuild + restart)
./deploy-mikrus.sh update

# Pomoc
./deploy-mikrus.sh help
```

---

## 🐳 Docker Commands

```bash
# Lista działających kontenerów
docker ps

# Wszystkie kontenery (włączone + wyłączone)
docker ps -a

# Logi kontenera
docker logs therapyassistance-backend
docker logs therapyassistance-backend -f  # Follow (live)
docker logs therapyassistance-backend --tail 100  # Ostatnie 100 linii

# Restart kontenera
docker restart therapyassistance-backend

# Stop kontenera
docker stop therapyassistance-backend

# Start kontenera
docker start therapyassistance-backend

# Wejdź do kontenera (shell)
docker exec -it therapyassistance-backend bash
docker exec -it therapyassistance-backend sh  # jeśli bash nie działa

# Usuń kontener
docker rm therapyassistance-backend

# Usuń obraz
docker rmi therapyassistance-backend

# Statystyki (CPU, RAM)
docker stats

# Wyczyść nieużywane zasoby
docker system prune
docker system prune -a  # Wszystko (obrazy też)
docker system prune -a --volumes  # OSTRZEŻENIE: Usuwa wolumeny!

# Docker Compose commands
docker-compose -f docker-compose.mikrus.yml up -d
docker-compose -f docker-compose.mikrus.yml down
docker-compose -f docker-compose.mikrus.yml restart
docker-compose -f docker-compose.mikrus.yml logs -f
docker-compose -f docker-compose.mikrus.yml ps
docker-compose -f docker-compose.mikrus.yml build --no-cache
```

---

## 🌐 Nginx Commands

```bash
# Status Nginx
systemctl status nginx

# Start Nginx
systemctl start nginx

# Stop Nginx
systemctl stop nginx

# Restart Nginx (z krótkim downtime)
systemctl restart nginx

# Reload Nginx (bez downtime)
systemctl reload nginx

# Enable autostart
systemctl enable nginx

# Testuj konfigurację
nginx -t

# Edytuj config
nano /etc/nginx/sites-available/therapyassistance

# Symlink do sites-enabled
ln -s /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/

# Usuń default config
rm /etc/nginx/sites-enabled/default

# Logi Nginx
tail -f /var/log/nginx/therapyassistance_access.log
tail -f /var/log/nginx/therapyassistance_error.log
tail -f /var/log/nginx/*.log  # Wszystkie logi

# Wyczyść logi (oszczędź miejsce)
truncate -s 0 /var/log/nginx/*.log
```

---

## 🗄️ PostgreSQL Commands

```bash
# Połącz się z bazą
psql -h postgres.mikr.us -U m1234_username -d m1234_therapyassistance

# Jednolinijkowe query
psql -h postgres.mikr.us -U m1234_username -d m1234_db -c "SELECT * FROM users;"

# Backup bazy
pg_dump -h postgres.mikr.us -U m1234_username -d m1234_db -F c -f backup.dump

# Backup + kompresja
pg_dump -h postgres.mikr.us -U m1234_username -d m1234_db -F c -f backup.dump
gzip backup.dump

# Restore z backupu
pg_restore -h postgres.mikr.us -U m1234_username -d m1234_db --clean backup.dump

# Restore z gzipped backup
gunzip backup.dump.gz
pg_restore -h postgres.mikr.us -U m1234_username -d m1234_db --clean backup.dump
```

### SQL Queries (w psql)
```sql
-- Lista tabel
\dt

-- Opis tabeli
\d patients

-- Lista użytkowników
SELECT * FROM users;

-- Liczba pacjentów
SELECT COUNT(*) FROM patients;

-- Wyjście
\q
```

---

## 🔐 SSL/HTTPS (Let's Encrypt)

```bash
# Instalacja Certbot
apt-get install -y certbot python3-certbot-nginx

# Uzyskaj certyfikat (pierwszy raz)
certbot --nginx -d m1234.mikr.us

# Odnów certyfikat
certbot renew

# Test auto-renewal
certbot renew --dry-run

# Lista certyfikatów
certbot certificates

# Usuń certyfikat
certbot delete --cert-name m1234.mikr.us

# Status auto-renewal timer
systemctl status certbot.timer

# Włącz auto-renewal
systemctl enable certbot.timer
```

---

## 🔧 System Commands

```bash
# Sprawdź użycie dysku
df -h

# Sprawdź użycie RAM
free -h

# Sprawdź top procesy (RAM, CPU)
htop  # lub top

# Sprawdź port
netstat -tulpn | grep 8000
lsof -i :8000

# Test endpoint
curl http://localhost:8000/health
curl https://m1234.mikr.us/health

# Test z headerami
curl -I http://localhost:8000/health

# Restart VPS
reboot

# Update systemu
apt-get update
apt-get upgrade -y

# Wyczyść stare pakiety
apt-get autoremove -y
apt-get autoclean
```

---

## 📝 Git Commands

```bash
# Status
git status

# Pull latest changes
git pull origin main

# Commit changes
git add .
git commit -m "Update description"

# Push changes
git push origin main

# Zobacz ostatnie commity
git log --oneline -10

# Rollback do poprzedniej wersji
git checkout <commit-hash>

# Utwórz branch
git checkout -b feature-branch

# Przełącz branch
git checkout main

# Zobacz zmiany
git diff
```

---

## 🛠️ Troubleshooting Commands

```bash
# Sprawdź wszystko naraz
echo "=== Docker Status ==="
docker ps

echo "=== Nginx Status ==="
systemctl status nginx

echo "=== Disk Usage ==="
df -h

echo "=== Memory Usage ==="
free -h

echo "=== Backend Health ==="
curl http://localhost:8000/health

# One-liner complete check
docker ps && systemctl status nginx && curl -s http://localhost:8000/health && echo "✅ All systems operational"
```

---

## 📊 Monitoring Commands

```bash
# Real-time logs (wszystko)
docker logs therapyassistance-backend -f &
tail -f /var/log/nginx/therapyassistance_access.log &
tail -f /var/log/nginx/therapyassistance_error.log &

# Monitoruj zasoby
watch -n 2 docker stats --no-stream

# Monitoruj połączenia
watch -n 2 'netstat -an | grep :8000'

# Historia komend
history | grep docker
```

---

## 💾 Backup Commands

```bash
# Backup bazy danych (przez skrypt)
./deploy-mikrus.sh backup

# Ręczny backup + timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h postgres.mikr.us -U m1234_user -d m1234_db -F c -f "backup_${TIMESTAMP}.dump"
gzip "backup_${TIMESTAMP}.dump"

# Kopiuj backup do Mikrus backup space
cp backups/backup_*.gz /backup/therapyassistance/

# Kopiuj backup do lokalnego komputera (z lokalnego terminala)
scp root@m1234.mikr.us:/opt/apps/therapyassistance/backups/*.gz ~/backups/

# Zaplanuj automatyczny backup (cron)
crontab -e
# Dodaj: 0 3 * * * cd /opt/apps/therapyassistance && ./deploy-mikrus.sh backup
```

---

## 🌐 Network & DNS Commands

```bash
# Sprawdź DNS
nslookup m1234.mikr.us
dig m1234.mikr.us

# Sprawdź routing
traceroute m1234.mikr.us

# Sprawdź otwarte porty
nmap m1234.mikr.us

# Test HTTPS
openssl s_client -connect m1234.mikr.us:443 -servername m1234.mikr.us

# Sprawdź certyfikat
echo | openssl s_client -connect m1234.mikr.us:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔑 Environment Variables

```bash
# Zobacz zmienne (.env)
cat .env

# Edytuj .env
nano .env

# Sprawdź konkretną zmienną
cat .env | grep DATABASE_URL
cat .env | grep JWT_SECRET

# Wygeneruj nowy JWT secret
openssl rand -hex 32

# Załaduj zmienne do sesji (testowanie)
export $(cat .env | xargs)
echo $DATABASE_URL
```

---

## 🚀 Quick One-Liners

```bash
# Full restart
./deploy-mikrus.sh restart && systemctl reload nginx

# Check everything
docker ps && curl -s http://localhost:8000/health && systemctl status nginx | grep Active

# Update & deploy
git pull && ./deploy-mikrus.sh update

# Clean & rebuild
docker system prune -a -f && ./deploy-mikrus.sh deploy

# Emergency stop
docker stop therapyassistance-backend && systemctl stop nginx

# Emergency start
systemctl start nginx && ./deploy-mikrus.sh deploy

# Full health check
curl -f http://localhost:8000/health && echo "✅ Backend OK" || echo "❌ Backend FAIL"

# Backup & copy to local (from local machine)
ssh root@m1234.mikr.us "cd /opt/apps/therapyassistance && ./deploy-mikrus.sh backup"
scp root@m1234.mikr.us:/opt/apps/therapyassistance/backups/*.gz ~/Desktop/
```

---

## 📱 Vercel CLI (Opcjonalne)

```bash
# Instalacja
npm i -g vercel

# Login
vercel login

# Deploy z CLI
cd frontend
vercel

# Deploy produkcyjny
vercel --prod

# Lista deploymentów
vercel ls

# Logi
vercel logs

# Zmienne środowiskowe
vercel env ls
vercel env add VITE_API_URL
vercel env rm VITE_API_URL
```

---

## 🆘 Emergency Commands

```bash
# WSZYSTKO SIĘ POSYPAŁO - RESTART WSZYSTKIEGO
systemctl stop nginx
docker stop $(docker ps -q)
systemctl start nginx
cd /opt/apps/therapyassistance && ./deploy-mikrus.sh deploy

# BAZA PRZESTAŁA DZIAŁAĆ - RESTORE Z BACKUPU
./deploy-mikrus.sh restore

# ZA MAŁO MIEJSCA NA DYSKU
docker system prune -a -f
apt-get autoremove -y
truncate -s 0 /var/log/nginx/*.log
rm -rf /tmp/*

# ZA MAŁO RAM - DODAJ SWAP
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# KONTENER NIE STARTUJE - REBUILD OD ZERA
docker stop therapyassistance-backend
docker rm therapyassistance-backend
docker rmi $(docker images -q therapyassistance*)
./deploy-mikrus.sh deploy

# NGINX NIE DZIAŁA - RESET CONFIG
cp /opt/apps/therapyassistance/nginx.mikrus.conf /etc/nginx/sites-available/therapyassistance
nginx -t
systemctl restart nginx
```

---

## 📖 Useful Aliases (Dodaj do ~/.bashrc)

```bash
# Edytuj ~/.bashrc
nano ~/.bashrc

# Dodaj na końcu:
alias ta='cd /opt/apps/therapyassistance'
alias talogs='cd /opt/apps/therapyassistance && ./deploy-mikrus.sh logs'
alias tarestart='cd /opt/apps/therapyassistance && ./deploy-mikrus.sh restart'
alias tastatus='cd /opt/apps/therapyassistance && ./deploy-mikrus.sh status'
alias taupdate='cd /opt/apps/therapyassistance && git pull && ./deploy-mikrus.sh update'
alias tabackup='cd /opt/apps/therapyassistance && ./deploy-mikrus.sh backup'
alias nginxreload='nginx -t && systemctl reload nginx'
alias nginxlogs='tail -f /var/log/nginx/therapyassistance_*.log'

# Załaduj zmiany
source ~/.bashrc

# Teraz możesz używać:
# ta           -> przejdź do projektu
# talogs       -> zobacz logi
# tarestart    -> restart
# taupdate     -> update
```

---

## 🎓 Tips & Tricks

```bash
# Zobacz 50 ostatnich requestów
tail -n 50 /var/log/nginx/therapyassistance_access.log

# Ile requestów w ostatniej godzinie?
awk -v d1="$(date --date='-1 hour' '+%d/%b/%Y:%H')" -v d2="$(date '+%d/%b/%Y:%H')" '$4 > "["d1 && $4 < "["d2' /var/log/nginx/therapyassistance_access.log | wc -l

# Top 10 IP addresses
awk '{print $1}' /var/log/nginx/therapyassistance_access.log | sort | uniq -c | sort -rn | head -10

# Ile RAM zużywa Docker?
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"

# Szybki deploy z jednej linijki (z lokalnego komputera)
ssh root@m1234.mikr.us "cd /opt/apps/therapyassistance && git pull && ./deploy-mikrus.sh update"

# Watch na zmiany w logach (live updates)
watch -n 1 'tail -10 /var/log/nginx/therapyassistance_access.log'
```

---

**💡 Pro Tip:** Zapisz ten plik jako `commands.md` na swoim komputerze i miej zawsze pod ręką!

**🔖 Bookmark:** `Ctrl+F` aby szybko znaleźć komendę!