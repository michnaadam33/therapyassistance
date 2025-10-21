#!/bin/bash

# TherapyAssistance Development Helper Script
# This script helps with common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

# Print header
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_message "Docker is not installed. Please install Docker first." "$RED"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        if ! command -v docker-compose &> /dev/null; then
            print_message "Docker Compose is not installed. Please install Docker Compose first." "$RED"
            exit 1
        fi
        # Use docker-compose if docker compose is not available
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi
}

# Show help menu
show_help() {
    print_header "TherapyAssistance Development Helper"
    echo "Usage: ./start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services (build if needed)"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  rebuild     - Rebuild and start all services"
    echo "  logs        - Show logs from all services"
    echo "  logs-f      - Follow logs from all services"
    echo "  seed        - Seed the database with sample data"
    echo "  migrate     - Run database migrations"
    echo "  shell-db    - Open PostgreSQL shell"
    echo "  shell-back  - Open backend container shell"
    echo "  shell-front - Open frontend container shell"
    echo "  test        - Run tests"
    echo "  clean       - Remove all containers and volumes"
    echo "  status      - Show status of all services"
    echo "  help        - Show this help menu"
    echo ""
}

# Start services
start_services() {
    print_header "Starting TherapyAssistance Services"

    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_message "Creating .env file from .env.example..." "$YELLOW"
        cp .env.example .env
    fi

    # Start services
    print_message "Starting Docker containers..." "$GREEN"
    $DOCKER_COMPOSE up -d --build

    print_message "\nWaiting for services to be ready..." "$YELLOW"
    sleep 10

    print_message "\n✅ Services started successfully!" "$GREEN"
    print_message "\nAccess the application at:" "$BLUE"
    print_message "  Frontend:    http://localhost:5173" "$GREEN"
    print_message "  Backend API: http://localhost:8000" "$GREEN"
    print_message "  API Docs:    http://localhost:8000/docs" "$GREEN"
    print_message "\nDefault credentials:" "$BLUE"
    print_message "  Email: terapeuta@example.com" "$YELLOW"
    print_message "  Pass:  haslo123" "$YELLOW"
}

# Stop services
stop_services() {
    print_header "Stopping TherapyAssistance Services"
    $DOCKER_COMPOSE down
    print_message "✅ Services stopped successfully!" "$GREEN"
}

# Restart services
restart_services() {
    print_header "Restarting TherapyAssistance Services"
    $DOCKER_COMPOSE restart
    print_message "✅ Services restarted successfully!" "$GREEN"
}

# Rebuild services
rebuild_services() {
    print_header "Rebuilding TherapyAssistance Services"
    $DOCKER_COMPOSE down
    $DOCKER_COMPOSE up -d --build --force-recreate
    print_message "✅ Services rebuilt successfully!" "$GREEN"
}

# Show logs
show_logs() {
    print_header "TherapyAssistance Logs"
    $DOCKER_COMPOSE logs
}

# Follow logs
follow_logs() {
    print_header "Following TherapyAssistance Logs (Ctrl+C to exit)"
    $DOCKER_COMPOSE logs -f
}

# Seed database
seed_database() {
    print_header "Seeding Database"
    $DOCKER_COMPOSE exec backend python seed.py
    print_message "✅ Database seeded successfully!" "$GREEN"
}

# Run migrations
run_migrations() {
    print_header "Running Database Migrations"
    $DOCKER_COMPOSE exec backend alembic upgrade head
    print_message "✅ Migrations completed successfully!" "$GREEN"
}

# Open PostgreSQL shell
shell_postgres() {
    print_header "Opening PostgreSQL Shell"
    print_message "Type \\q to exit" "$YELLOW"
    $DOCKER_COMPOSE exec db psql -U postgres -d therapyassistance
}

# Open backend shell
shell_backend() {
    print_header "Opening Backend Shell"
    print_message "Type 'exit' to leave the shell" "$YELLOW"
    $DOCKER_COMPOSE exec backend /bin/sh
}

# Open frontend shell
shell_frontend() {
    print_header "Opening Frontend Shell"
    print_message "Type 'exit' to leave the shell" "$YELLOW"
    $DOCKER_COMPOSE exec frontend /bin/sh
}

# Run tests
run_tests() {
    print_header "Running Tests"
    print_message "Running backend tests..." "$YELLOW"
    $DOCKER_COMPOSE exec backend pytest || print_message "Backend tests not configured yet" "$YELLOW"

    print_message "\nRunning frontend tests..." "$YELLOW"
    $DOCKER_COMPOSE exec frontend npm test || print_message "Frontend tests not configured yet" "$YELLOW"
}

# Clean everything
clean_all() {
    print_header "Cleaning TherapyAssistance"
    print_message "This will remove all containers, volumes, and data!" "$RED"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $DOCKER_COMPOSE down -v --remove-orphans
        print_message "✅ Cleanup completed!" "$GREEN"
    else
        print_message "Cleanup cancelled." "$YELLOW"
    fi
}

# Show status
show_status() {
    print_header "TherapyAssistance Status"
    $DOCKER_COMPOSE ps
}

# Main script
main() {
    check_docker

    case "$1" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        rebuild)
            rebuild_services
            ;;
        logs)
            show_logs
            ;;
        logs-f)
            follow_logs
            ;;
        seed)
            seed_database
            ;;
        migrate)
            run_migrations
            ;;
        shell-db)
            shell_postgres
            ;;
        shell-back)
            shell_backend
            ;;
        shell-front)
            shell_frontend
            ;;
        test)
            run_tests
            ;;
        clean)
            clean_all
            ;;
        status)
            show_status
            ;;
        help)
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            print_message "Unknown command: $1" "$RED"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
