#!/bin/bash

# Quick status check script for TherapyAssistance Backend on mikr.us
# This script checks the status of the application and its components

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 TherapyAssistance Backend - Status Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if systemd service exists
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Systemd Service Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if systemctl is-enabled therapyassistance.service &>/dev/null; then
    if systemctl is-active therapyassistance.service &>/dev/null; then
        echo -e "${GREEN}✓ Service: ACTIVE (running)${NC}"
    else
        echo -e "${RED}✗ Service: INACTIVE (not running)${NC}"
    fi

    # Show service status
    sudo systemctl status therapyassistance.service --no-pager -l | head -n 15
else
    echo -e "${YELLOW}⚠ Systemd service not installed${NC}"
    echo "  Run: sudo cp therapyassistance.service /etc/systemd/system/"
fi
echo ""

# Check if backend is responding
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 API Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ API responding: http://localhost:8000${NC}"
    HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
    echo "  Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ API not responding (HTTP $HTTP_STATUS)${NC}"
fi
echo ""

# Check port 8000
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 Port Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if lsof -i :8000 &>/dev/null; then
    echo -e "${GREEN}✓ Port 8000 is in use${NC}"
    sudo lsof -i :8000 | head -n 10
else
    echo -e "${RED}✗ Port 8000 is not in use${NC}"
    echo "  Backend is not running"
fi
echo ""

# Check PostgreSQL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  PostgreSQL Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if systemctl is-active postgresql &>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL service is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL service is not running${NC}"
fi
echo ""

# Check virtual environment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐍 Python Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "$HOME/therapyassistance/backend/venv" ]; then
    echo -e "${GREEN}✓ Virtual environment exists${NC}"
    PYTHON_VERSION=$($HOME/therapyassistance/backend/venv/bin/python --version 2>&1)
    echo "  Python: $PYTHON_VERSION"
else
    echo -e "${RED}✗ Virtual environment not found${NC}"
    echo "  Run: ./setup-mikrus.sh"
fi
echo ""

# Check configuration files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 Configuration Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "$HOME/therapyassistance/.env.production" ]; then
    echo -e "${GREEN}✓ .env.production exists${NC}"
else
    echo -e "${RED}✗ .env.production not found${NC}"
    echo "  Create it with: nano ~/therapyassistance/.env.production"
fi

if [ -f "/etc/systemd/system/therapyassistance.service" ]; then
    echo -e "${GREEN}✓ systemd service file installed${NC}"
else
    echo -e "${YELLOW}⚠ systemd service file not installed${NC}"
fi

if [ -f "/etc/nginx/sites-enabled/therapyassistance" ]; then
    echo -e "${GREEN}✓ nginx configuration enabled${NC}"
else
    echo -e "${YELLOW}⚠ nginx configuration not enabled${NC}"
fi
echo ""

# Check logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Recent Logs (last 5 lines)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "$HOME/therapyassistance/logs/backend.log" ]; then
    echo -e "${BLUE}Backend log:${NC}"
    tail -n 5 "$HOME/therapyassistance/logs/backend.log" 2>/dev/null || echo "  (empty or no access)"
else
    echo -e "${YELLOW}⚠ Log file not found${NC}"
fi

if [ -f "$HOME/therapyassistance/logs/backend.error.log" ]; then
    ERROR_COUNT=$(wc -l < "$HOME/therapyassistance/logs/backend.error.log" 2>/dev/null || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠ Error log (last 5 lines):${NC}"
        tail -n 5 "$HOME/therapyassistance/logs/backend.error.log" 2>/dev/null
    fi
fi
echo ""

# Check nginx (if installed)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 Nginx Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v nginx &>/dev/null; then
    if systemctl is-active nginx &>/dev/null; then
        echo -e "${GREEN}✓ Nginx is running${NC}"
        nginx -t 2>&1 | grep -E "(syntax|test)" || true
    else
        echo -e "${RED}✗ Nginx is not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Nginx not installed${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ISSUES=0

# Count issues
if ! systemctl is-active therapyassistance.service &>/dev/null; then
    ((ISSUES++))
fi
if [ "$HTTP_STATUS" != "200" ]; then
    ((ISSUES++))
fi
if ! systemctl is-active postgresql &>/dev/null; then
    ((ISSUES++))
fi
if [ ! -f "$HOME/therapyassistance/.env.production" ]; then
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ Everything looks good!${NC}"
    echo ""
    echo "🎉 Your API is running and healthy!"
    echo ""
    echo "Available at:"
    echo "  • Local: http://localhost:8000"
    echo "  • Docs:  http://localhost:8000/docs"
else
    echo -e "${RED}⚠ Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Check the details above and:"
    echo "  1. Read: MIKRUS_DEPLOYMENT.md (Troubleshooting section)"
    echo "  2. Check logs: tail -f ~/therapyassistance/logs/backend.error.log"
    echo "  3. Check systemd: sudo journalctl -u therapyassistance -n 50"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Quick commands
echo "💡 Quick commands:"
echo "  View logs:    tail -f ~/therapyassistance/logs/backend.log"
echo "  Restart:      sudo systemctl restart therapyassistance"
echo "  Status:       sudo systemctl status therapyassistance"
echo "  Test API:     curl http://localhost:8000/health"
echo ""
