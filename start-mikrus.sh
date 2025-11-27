#!/bin/bash

# Start script for TherapyAssistance Backend on mikr.us
# This script starts the FastAPI application using uvicorn

set -e

echo "🚀 Starting TherapyAssistance Backend..."

# Navigate to backend directory
cd /home/$(whoami)/therapyassistance/backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "✓ Activating virtual environment..."
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Please run setup-mikrus.sh first."
    exit 1
fi

# Load environment variables
if [ -f "../.env.production" ]; then
    echo "✓ Loading production environment variables..."
    export $(cat ../.env.production | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env.production not found, using .env"
    if [ -f "../.env" ]; then
        export $(cat ../.env | grep -v '^#' | xargs)
    fi
fi

# Check if database is accessible
echo "✓ Checking database connection..."
python3 -c "
from app.core.database import engine
try:
    connection = engine.connect()
    connection.close()
    print('✓ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
"

# Run database migrations
echo "✓ Running database migrations..."
alembic upgrade head

# Start the application
echo "✓ Starting uvicorn server on port ${BACKEND_PORT:-8000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port ${BACKEND_PORT:-8000} \
    --workers 2 \
    --log-level info \
    --proxy-headers \
    --forwarded-allow-ips='*'
