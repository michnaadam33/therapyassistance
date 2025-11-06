#!/bin/bash

# ============================================
# TherapyAssistance - Mikrus Deployment Script
# ============================================
# This script automates deployment to Mikrus VPS
# Usage: ./deploy-mikrus.sh [init|deploy|restart|logs|backup]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="therapyassistance"
BACKEND_DIR="backend"
DOCKER_COMPOSE_FILE="docker-compose.mikrus.yml"
ENV_FILE=".env"

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    print_info "Checking requirements..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error ".env file not found!"
        print_info "Please copy .env.mikrus.example to .env and configure it:"
        echo "    cp .env.mikrus.example .env"
        echo "    nano .env"
        echo ""
        print_warning "IMPORTANT: For Mikrus, set DB_HOST to 'localhost' or '127.0.0.1'"
        print_warning "           NOT 'db' (that's only for Docker Compose)"
        exit 1
    fi

    print_success "All requirements met!"
}

load_and_export_env() {
    # Export all variables from .env file
    set -a
    source "$ENV_FILE"
    set +a

    # Build DATABASE_URL if not set or contains variable references
    if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *'${'* ]]; then
        DATABASE_URL="postgresql+psycopg2://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        export DATABASE_URL
    fi

    # Validate DB_HOST for Mikrus deployment
    if [ "$DB_HOST" = "db" ]; then
        print_error "DB_HOST is set to 'db' which is for Docker Compose only!"
        print_warning "For Mikrus deployment, set DB_HOST to 'localhost' or '127.0.0.1'"
        print_info "Edit your .env file and change DB_HOST value"
        exit 1
    fi
}

init_deployment() {
    print_info "Initializing Mikrus deployment..."

    check_requirements
    load_and_export_env

    # Check if database credentials are set
    if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
        print_error "Database credentials not set in .env file!"
        exit 1
    fi

    print_info "Testing database connection..."
    if docker run --rm \
        --network host \
        -e PGPASSWORD="$DB_PASSWORD" \
        postgres:15-alpine \
        psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful!"
    else
        print_warning "Could not connect to database. Please check your credentials."
    fi

    # Run database migrations
    print_info "Running database migrations..."
    cd "$BACKEND_DIR"
    if [ -d "alembic" ]; then
        docker run --rm \
            --network host \
            -v "$(pwd)":/app \
            -w /app \
            -e DATABASE_URL="$DATABASE_URL" \
            -e DB_HOST="$DB_HOST" \
            -e DB_PORT="$DB_PORT" \
            -e DB_USER="$DB_USER" \
            -e DB_PASSWORD="$DB_PASSWORD" \
            -e DB_NAME="$DB_NAME" \
            -e SECRET_KEY="${SECRET_KEY:-changeme}" \
            python:3.11-slim \
            bash -c "pip install -q -r requirements.txt && alembic upgrade head"
        print_success "Database migrations completed!"
    else
        print_warning "No Alembic migrations found. Skipping..."
    fi
    cd ..

    # Seed initial data (optional)
    read -p "Do you want to seed initial data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding database..."
        cd "$BACKEND_DIR"
        docker run --rm \
            --network host \
            -v "$(pwd)":/app \
            -w /app \
            -e DATABASE_URL="$DATABASE_URL" \
            -e DB_HOST="$DB_HOST" \
            -e DB_PORT="$DB_PORT" \
            -e DB_USER="$DB_USER" \
            -e DB_PASSWORD="$DB_PASSWORD" \
            -e DB_NAME="$DB_NAME" \
            -e SECRET_KEY="${SECRET_KEY:-changeme}" \
            python:3.11-slim \
            bash -c "pip install -q -r requirements.txt && python seed.py" || print_warning "Seeding skipped or failed"
        cd ..
    fi

    print_success "Initialization complete!"
    print_info "Next steps:"
    echo "  1. Deploy application: ./deploy-mikrus.sh deploy"
    echo "  2. Configure Nginx: sudo cp nginx.mikrus.conf /etc/nginx/sites-available/$PROJECT_NAME"
    echo "  3. Enable site: sudo ln -s /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/"
    echo "  4. Test Nginx: sudo nginx -t"
    echo "  5. Reload Nginx: sudo systemctl reload nginx"
    echo ""
    print_info "Application will be available at:"
    echo "  Backend: http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
}

deploy() {
    print_info "Deploying to Mikrus..."

    check_requirements

    # Pull latest changes (if git repo)
    if [ -d .git ]; then
        print_info "Pulling latest changes from git..."
        git pull || print_warning "Git pull failed or not in a git repository"
    fi

    # Build and start containers
    print_info "Building Docker images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

    print_info "Starting containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    # Wait for backend to be healthy
    print_info "Waiting for backend to be ready..."
    sleep 10

    # Check if backend is running
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        print_success "Deployment successful!"
        print_info "Backend is running on http://localhost:8000"
        print_info "Check logs with: ./deploy-mikrus.sh logs"
    else
        print_error "Deployment failed. Check logs with: ./deploy-mikrus.sh logs"
        exit 1
    fi
}

restart() {
    print_info "Restarting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" restart
    print_success "Services restarted!"
}

stop() {
    print_info "Stopping services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    print_success "Services stopped!"
}

logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
}

status() {
    print_info "Service status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

backup() {
    print_info "Creating backup..."

    load_and_export_env

    BACKUP_DIR="backups"
    BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="${BACKUP_DIR}/backup_${BACKUP_DATE}.sql"

    mkdir -p "$BACKUP_DIR"

    # Backup database
    print_info "Backing up database..."
    docker run --rm \
        --network host \
        -e PGPASSWORD="$DB_PASSWORD" \
        -v "$(pwd)/$BACKUP_DIR":/backup \
        postgres:15-alpine \
        pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -F c -f "/backup/backup_${BACKUP_DATE}.dump"

    if [ -f "$BACKUP_DIR/backup_${BACKUP_DATE}.dump" ]; then
        print_success "Database backup created: $BACKUP_DIR/backup_${BACKUP_DATE}.dump"

        # Compress backup
        gzip "$BACKUP_DIR/backup_${BACKUP_DATE}.dump"
        print_success "Backup compressed: $BACKUP_DIR/backup_${BACKUP_DATE}.dump.gz"

        # Optional: Copy to Mikrus backup space
        if [ -n "$BACKUP_PATH" ]; then
            print_info "Copying to Mikrus backup space..."
            cp "$BACKUP_DIR/backup_${BACKUP_DATE}.dump.gz" "$BACKUP_PATH/" || print_warning "Could not copy to backup space"
        fi
    else
        print_error "Backup failed!"
        exit 1
    fi
}

restore() {
    print_warning "This will restore the database from a backup file."
    read -p "Enter backup file path: " BACKUP_FILE

    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    # Decompress if needed
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        print_info "Decompressing backup..."
        DECOMPRESSED_FILE="${BACKUP_FILE%.gz}"
        gunzip -k "$BACKUP_FILE"
        BACKUP_FILE="$DECOMPRESSED_FILE"
    fi

    print_warning "This will overwrite the current database!"
    read -p "Are you sure? (yes/NO): " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        print_info "Restore cancelled."
        exit 0
    fi

    load_and_export_env

    print_info "Restoring database..."
    docker run --rm \
        --network host \
        -e PGPASSWORD="$DB_PASSWORD" \
        -v "$(pwd)/$(dirname "$BACKUP_FILE")":/backup \
        postgres:15-alpine \
        pg_restore -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists "/backup/$(basename "$BACKUP_FILE")"

    print_success "Database restored!"
}

update() {
    print_info "Updating deployment..."

    # Pull latest changes
    if [ -d .git ]; then
        print_info "Pulling latest changes..."
        git pull
    fi

    # Rebuild and restart
    print_info "Rebuilding containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

    print_info "Restarting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    print_success "Update complete!"
}

show_help() {
    echo "TherapyAssistance - Mikrus Deployment Script"
    echo ""
    echo "Usage: ./deploy-mikrus.sh [command]"
    echo ""
    echo "Commands:"
    echo "  init      - Initialize deployment (first time setup)"
    echo "  deploy    - Deploy/redeploy the application"
    echo "  restart   - Restart all services"
    echo "  stop      - Stop all services"
    echo "  logs      - Show application logs"
    echo "  status    - Show service status"
    echo "  backup    - Create database backup"
    echo "  restore   - Restore database from backup"
    echo "  update    - Pull latest changes and redeploy"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy-mikrus.sh init      # First time setup"
    echo "  ./deploy-mikrus.sh deploy    # Deploy application"
    echo "  ./deploy-mikrus.sh logs      # View logs"
    echo "  ./deploy-mikrus.sh backup    # Backup database"
}

# Main script logic
case "${1:-}" in
    init)
        init_deployment
        ;;
    deploy)
        deploy
        ;;
    restart)
        restart
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    restore)
        restore
        ;;
    update)
        update
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: ${1:-}"
        echo ""
        show_help
        exit 1
        ;;
esac

exit 0
