#!/bin/bash

# Setup script for TherapyAssistance Backend on mikr.us
# This script prepares the environment for running the FastAPI application

set -e

echo "🔧 Setting up TherapyAssistance Backend on mikr.us..."

# Get the current user's home directory
HOME_DIR="/home/$(whoami)"
PROJECT_DIR="$HOME_DIR/therapyassistance"
BACKEND_DIR="$PROJECT_DIR/backend"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found at $PROJECT_DIR"
    echo "Please clone or upload the project first."
    exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR"

# Check Python version
echo "✓ Checking Python version..."
PYTHON_VERSION=$(python3 --version)
echo "  Found: $PYTHON_VERSION"

# Create virtual environment
if [ -d "venv" ]; then
    echo "⚠️  Virtual environment already exists. Skipping creation."
else
    echo "✓ Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "✓ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "✓ Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env.production exists
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo "⚠️  Warning: .env.production not found!"
    echo "Please create $PROJECT_DIR/.env.production with your production settings."
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (PostgreSQL connection string)"
    echo "  - JWT_SECRET (strong secret key)"
    echo "  - FRONTEND_URL"
    exit 1
fi

# Load environment variables
echo "✓ Loading environment variables..."
export $(cat "$PROJECT_DIR/.env.production" | grep -v '^#' | xargs)

# Test database connection
echo "✓ Testing database connection..."
python3 -c "
from app.core.database import engine
try:
    connection = engine.connect()
    connection.close()
    print('✓ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    print('')
    print('Please check your DATABASE_URL in .env.production')
    exit(1)
"

# Run database migrations
echo "✓ Running database migrations..."
alembic upgrade head

# Optional: Seed database
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✓ Seeding database..."
    python3 seed.py
fi

# Make start script executable
echo "✓ Making start script executable..."
chmod +x "$PROJECT_DIR/start-mikrus.sh"

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application manually, run:"
echo "  cd $BACKEND_DIR"
echo "  source venv/bin/activate"
echo "  $PROJECT_DIR/start-mikrus.sh"
echo ""
echo "To set up as a systemd service, see: $PROJECT_DIR/MIKRUS_DEPLOYMENT.md"
