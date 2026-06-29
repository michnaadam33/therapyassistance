#!/bin/bash
# Szybka aktualizacja konfiguracji nginx na serwerze
# Uruchom: sudo bash apply-nginx.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[[ "$EUID" -eq 0 ]] || { echo "Uruchom jako root: sudo bash apply-nginx.sh"; exit 1; }

cp "$SCRIPT_DIR/nginx-production.conf" /etc/nginx/sites-available/therapyassistance
ln -sf /etc/nginx/sites-available/therapyassistance /etc/nginx/sites-enabled/therapyassistance
rm -f /etc/nginx/sites-enabled/default

echo "Test konfiguracji..."
nginx -t

echo "Przeładowanie nginx..."
systemctl reload nginx

echo "✅ Nginx zaktualizowany"
