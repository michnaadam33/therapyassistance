#!/bin/bash
# ============================================================
# TherapyAssistance - Wdrożenie na mikr.us
# Uruchom na serwerze: bash deploy.sh
#
# Tryby:
#   bash deploy.sh          # pierwsze wdrożenie (pełna instalacja)
#   bash deploy.sh update   # aktualizacja po zmianach w kodzie
#   bash deploy.sh ssl      # konfiguracja SSL (certbot) – po DNS
# ============================================================

set -euo pipefail

# ── Kolory ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()     { echo -e "${RED}[ERR]${NC}   $*"; exit 1; }
section() { echo -e "\n${BOLD}━━ $* ━━${NC}"; }

# ── Konfiguracja ──────────────────────────────────────────────
APP_USER="${SUDO_USER:-$(whoami)}"
HOME_DIR=$(eval echo "~$APP_USER")
PROJECT_DIR="$HOME_DIR/therapyassistance"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
FRONTEND_DIST="$FRONTEND_DIR/dist"
NGINX_WEBROOT="/var/www/therapyassistance"
ENV_FILE="$PROJECT_DIR/.env.production"
SERVICE_NAME="therapyassistance"
DOMAIN_FRONTEND="therapyassistance.io"
DOMAIN_API="api.therapyassistance.io"

# ── Sprawdzenia wstępne ───────────────────────────────────────
check_env() {
    section "Sprawdzanie środowiska"

    [[ -f "$ENV_FILE" ]] || err ".env.production nie istnieje!
    Utwórz go na podstawie szablonu:
      cp $PROJECT_DIR/.env.production.example $ENV_FILE
      nano $ENV_FILE
    Następnie uruchom ponownie: bash deploy.sh"

    # Wczytaj zmienne
    set -a; source "$ENV_FILE"; set +a

    [[ -n "${JWT_SECRET:-}" && "$JWT_SECRET" != "ZMIEN_NA_SILNY_LOSOWY_KLUCZ" ]] \
        || err "JWT_SECRET nie jest ustawiony lub jest domyślny. Zmień go w .env.production"

    [[ -n "${DATABASE_URL:-}" ]] \
        || err "DATABASE_URL nie jest ustawiony w .env.production"

    ok "Plik .env.production wczytany"
}

# ── Pakiety systemowe ─────────────────────────────────────────
install_system_packages() {
    section "Instalacja pakietów systemowych"

    apt-get update -qq

    PACKAGES=(
        nginx
        python3 python3-venv python3-pip
        postgresql postgresql-contrib
        certbot python3-certbot-nginx
        curl git
    )

    apt-get install -y "${PACKAGES[@]}" -qq
    ok "Pakiety systemowe zainstalowane"

    # Node.js 20 LTS (jeśli nie ma)
    if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
        info "Instaluję Node.js 20 LTS..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs -qq
        ok "Node.js $(node -v) zainstalowany"
    else
        ok "Node.js $(node -v) już dostępny"
    fi
}

# ── PostgreSQL ────────────────────────────────────────────────
setup_database() {
    section "Konfiguracja bazy danych"

    set -a; source "$ENV_FILE"; set +a

    DB_NAME="${DB_NAME:-therapyassistance}"
    DB_USER="${DB_USER:-therapydb_user}"
    DB_PASSWORD="${DB_PASSWORD:-}"

    [[ -n "$DB_PASSWORD" ]] || err "DB_PASSWORD nie ustawione w .env.production"

    # Upewnij się, że postgres działa
    systemctl enable postgresql --quiet
    systemctl start postgresql

    # Utwórz użytkownika i bazę (idempotentne)
    sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 \
        || sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

    sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
        || sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" -q

    ok "Baza danych '$DB_NAME' gotowa"
}

# ── Backend (Python/FastAPI) ───────────────────────────────────
setup_backend() {
    section "Konfiguracja backendu (FastAPI)"

    cd "$BACKEND_DIR"

    # Virtualenv
    if [[ ! -d "venv" ]]; then
        python3 -m venv venv
        ok "Virtualenv utworzony"
    else
        ok "Virtualenv już istnieje"
    fi

    source venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    ok "Zależności Pythona zainstalowane"

    # Migracje
    set -a; source "$ENV_FILE"; set +a
    alembic upgrade head
    ok "Migracje bazy danych wykonane"

    deactivate
}

# ── Frontend (React/Vite) ──────────────────────────────────────
build_frontend() {
    section "Budowanie frontendu (React)"

    if [[ -d "$FRONTEND_DIST" && -f "$FRONTEND_DIST/index.html" ]]; then
        warn "Katalog dist/ już istnieje – pomijam budowanie."
        warn "Usuń $FRONTEND_DIST żeby wymusić rebuild."
        return 0
    fi

    cd "$FRONTEND_DIR"

    info "Instaluję zależności npm..."
    npm ci --silent

    info "Buduję aplikację (npm run build)..."
    npm run build

    ok "Frontend zbudowany: $FRONTEND_DIST"
}

deploy_frontend() {
    section "Wdrożenie frontendu do nginx"

    [[ -d "$FRONTEND_DIST" ]] \
        || err "Brak $FRONTEND_DIST – uruchom najpierw budowanie."

    mkdir -p "$NGINX_WEBROOT"
    rsync -a --delete "$FRONTEND_DIST/" "$NGINX_WEBROOT/"
    chown -R www-data:www-data "$NGINX_WEBROOT"

    ok "Pliki frontendu skopiowane do $NGINX_WEBROOT"
}

# ── Nginx ──────────────────────────────────────────────────────
setup_nginx() {
    section "Konfiguracja nginx"

    NGINX_CONF="/etc/nginx/sites-available/$SERVICE_NAME"

    cp "$PROJECT_DIR/nginx-production.conf" "$NGINX_CONF"

    # Aktywuj stronę
    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$SERVICE_NAME"

    # Wyłącz domyślną stronę nginx jeśli aktywna
    rm -f /etc/nginx/sites-enabled/default

    nginx -t && systemctl reload nginx
    ok "Nginx skonfigurowany i przeładowany"
}

# ── Systemd service ────────────────────────────────────────────
setup_service() {
    section "Konfiguracja usługi systemd"

    SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

    mkdir -p "$HOME_DIR/therapyassistance/logs"
    chown "$APP_USER:$APP_USER" "$HOME_DIR/therapyassistance/logs"

    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=TherapyAssistance FastAPI Backend
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
EnvironmentFile=$ENV_FILE
ExecStart=$BACKEND_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 --log-level info --proxy-headers --forwarded-allow-ips='*'
Restart=always
RestartSec=10
StandardOutput=append:$HOME_DIR/therapyassistance/logs/backend.log
StandardError=append:$HOME_DIR/therapyassistance/logs/backend.error.log
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    systemctl restart "$SERVICE_NAME"

    sleep 3
    systemctl is-active --quiet "$SERVICE_NAME" \
        && ok "Usługa $SERVICE_NAME uruchomiona" \
        || err "Usługa $SERVICE_NAME nie uruchomiła się. Sprawdź: journalctl -u $SERVICE_NAME -n 50"
}

# ── SSL (certbot) ──────────────────────────────────────────────
setup_ssl() {
    section "Konfiguracja SSL (Let's Encrypt)"

    command -v certbot &>/dev/null || err "certbot nie jest zainstalowany. Uruchom najpierw: bash deploy.sh"

    info "Domena DNS musi wskazywać na ten serwer PRZED uzyskaniem certyfikatu."
    info "Sprawdź: dig $DOMAIN_FRONTEND +short"
    echo
    read -rp "Podaj email do Let's Encrypt: " LE_EMAIL
    [[ -n "$LE_EMAIL" ]] || err "Email jest wymagany"

    certbot --nginx \
        -d "$DOMAIN_FRONTEND" \
        -d "www.$DOMAIN_FRONTEND" \
        -d "$DOMAIN_API" \
        --non-interactive \
        --agree-tos \
        --email "$LE_EMAIL" \
        --redirect

    ok "SSL skonfigurowany dla $DOMAIN_FRONTEND i $DOMAIN_API"
    ok "Certbot automatycznie odnowi certyfikat co 90 dni"
}

# ── Update (szybka aktualizacja) ───────────────────────────────
do_update() {
    section "Aktualizacja aplikacji"
    check_env

    # Aktualizacja backendu
    cd "$BACKEND_DIR"
    source venv/bin/activate
    set -a; source "$ENV_FILE"; set +a
    pip install -r requirements.txt -q
    alembic upgrade head
    deactivate
    ok "Backend zaktualizowany"

    # Przebuduj frontend
    rm -rf "$FRONTEND_DIST"
    build_frontend
    deploy_frontend

    # Restart serwisu
    systemctl restart "$SERVICE_NAME"
    sleep 2
    systemctl is-active --quiet "$SERVICE_NAME" \
        && ok "Backend zrestartowany" \
        || err "Backend nie uruchomił się po restarcie"

    systemctl reload nginx
    ok "Nginx przeładowany"
    ok "Aktualizacja zakończona!"
}

# ── Pełne wdrożenie ────────────────────────────────────────────
do_deploy() {
    [[ "$EUID" -eq 0 ]] || err "Uruchom jako root: sudo bash deploy.sh"

    echo -e "${BOLD}"
    echo "  ╔══════════════════════════════════╗"
    echo "  ║  TherapyAssistance → mikr.us     ║"
    echo "  ╚══════════════════════════════════╝"
    echo -e "${NC}"

    check_env
    install_system_packages
    setup_database
    setup_backend
    build_frontend
    deploy_frontend
    setup_nginx
    setup_service

    echo
    echo -e "${GREEN}${BOLD}✅ Wdrożenie zakończone pomyślnie!${NC}"
    echo
    echo "  Frontend : http://$DOMAIN_FRONTEND"
    echo "  Backend  : http://$DOMAIN_API"
    echo "  Swagger  : http://$DOMAIN_API/docs"
    echo
    echo -e "${YELLOW}Następny krok – SSL:${NC}"
    echo "  sudo bash deploy.sh ssl"
    echo
    echo -e "${YELLOW}Logi backendu:${NC}"
    echo "  journalctl -u $SERVICE_NAME -f"
    echo "  tail -f $HOME_DIR/therapyassistance/logs/backend.log"
}

# ── Główny switch ──────────────────────────────────────────────
case "${1:-deploy}" in
    deploy)  do_deploy  ;;
    update)  do_update  ;;
    ssl)
        [[ "$EUID" -eq 0 ]] || err "Uruchom jako root: sudo bash deploy.sh ssl"
        check_env
        setup_ssl
        ;;
    *)
        echo "Użycie: bash deploy.sh [deploy|update|ssl]"
        echo "  deploy  - pełne pierwsze wdrożenie (wymaga sudo)"
        echo "  update  - szybka aktualizacja kodu"
        echo "  ssl     - konfiguracja HTTPS (wymaga sudo, po deploy)"
        exit 1
        ;;
esac
