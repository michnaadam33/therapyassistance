#!/bin/bash
# ============================================================
# TherapyAssistance - Diagnostyka i naprawa połączenia
# Uruchom na serwerze: sudo bash fix-connection.sh
# ============================================================

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err_msg() { echo -e "${RED}[ERR]${NC}   $*"; }
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
section() { echo -e "\n${BOLD}━━ $* ━━${NC}"; }

[[ "$EUID" -eq 0 ]] || { echo "Uruchom jako root: sudo bash fix-connection.sh"; exit 1; }

section "Diagnostyka sieci i nginx"

# ── 1. Firewall ────────────────────────────────────────────────
echo
info "▶ Sprawdzam firewall (ufw)..."
if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
    warn "ufw jest AKTYWNY. Otwieram porty 80 i 443..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp    # SSH – nie zablokuj się!
    ufw reload
    ok "Porty 80 i 443 odblokowane w ufw"
else
    ok "ufw nieaktywny lub porty już otwarte"
fi

info "▶ Sprawdzam iptables..."
if iptables -L INPUT -n | grep -qE "REJECT|DROP"; then
    warn "iptables ma reguły blokujące. Sprawdź ręcznie: iptables -L INPUT -n"
    info "Dodaję regułę dla portu 80 i 443 jeśli ich nie ma..."
    iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null \
        || iptables -I INPUT -p tcp --dport 80 -j ACCEPT
    iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null \
        || iptables -I INPUT -p tcp --dport 443 -j ACCEPT
    ok "Reguły iptables dodane dla portów 80 i 443"
else
    ok "iptables bez blokujących reguł"
fi

# ── 2. Nginx ──────────────────────────────────────────────────
section "Stan nginx"

info "▶ Test konfiguracji nginx..."
if nginx -t 2>&1; then
    ok "Konfiguracja nginx poprawna"
else
    err_msg "Błąd konfiguracji nginx! Szczegóły powyżej."
    echo
    info "Sprawdzam czy nginx-production.conf jest zainstalowany..."
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || true
    exit 1
fi

info "▶ Włączam i restartuję nginx..."
systemctl enable nginx --quiet
systemctl restart nginx
sleep 1

if systemctl is-active --quiet nginx; then
    ok "nginx działa"
else
    err_msg "nginx nie uruchomił się. Logi:"
    journalctl -u nginx -n 30 --no-pager
    exit 1
fi

# ── 3. Backend ────────────────────────────────────────────────
section "Stan backendu (uvicorn)"

if systemctl is-active --quiet therapyassistance 2>/dev/null; then
    ok "therapyassistance.service działa"
else
    warn "therapyassistance.service nie działa. Próbuję uruchomić..."
    systemctl restart therapyassistance 2>/dev/null || true
    sleep 3
    if systemctl is-active --quiet therapyassistance; then
        ok "therapyassistance.service uruchomiony"
    else
        err_msg "therapyassistance.service nie uruchomił się."
        info "Ostatnie logi:"
        journalctl -u therapyassistance -n 20 --no-pager
    fi
fi

# ── 4. Porty ──────────────────────────────────────────────────
section "Nasłuchujące porty"

echo
info "Porty 80, 443, 8000:"
ss -tlnp | grep -E ":80 |:443 |:8000 " || warn "Żaden z portów 80/443/8000 nie nasłuchuje!"

echo
info "Pełna lista nasłuchujących socketów:"
ss -tlnp

# ── 5. Test lokalny ────────────────────────────────────────────
section "Test lokalny HTTP"

echo
info "▶ curl http://localhost (nginx → frontend)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -qE "^(200|301|302)"; then
    ok "Frontend odpowiada lokalnie na HTTP"
else
    warn "Frontend nie odpowiada na localhost:80"
    err_msg "Sprawdź: cat /var/log/nginx/therapyassistance-frontend-error.log"
fi

info "▶ curl http://localhost:8000/health (backend)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -qE "^200"; then
    ok "Backend odpowiada na porcie 8000"
else
    warn "Backend nie odpowiada na porcie 8000"
    err_msg "Sprawdź: journalctl -u therapyassistance -n 30"
fi

# ── Podsumowanie ───────────────────────────────────────────────
section "Podsumowanie"

echo
echo -e "${BOLD}IP serwera:${NC}"
curl -s https://api.ipify.org 2>/dev/null && echo
echo
echo -e "${BOLD}Następne kroki jeśli nadal nie działa:${NC}"
echo "  1. Sprawdź DNS: dig therapyassistance.io +short"
echo "     → IP musi wskazywać na ten serwer"
echo "  2. Logi nginx:   tail -f /var/log/nginx/therapyassistance-frontend-error.log"
echo "  3. Logi backend: journalctl -u therapyassistance -f"
echo "  4. mikr.us panel: sprawdź czy porty 80/443 są odblokowane w panelu VPS"
