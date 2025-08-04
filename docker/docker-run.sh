#!/bin/bash

# Docker run script for Cypress Automation Framework
# Usage: ./docker-run.sh [command] [environment] [browser] [test-suite]

set -e

# Default values
COMMAND=${1:-"run"}
ENVIRONMENT=${2:-"local"}
BROWSER=${3:-"chrome"}
TEST_SUITE=${4:-"smoke"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Print usage information
usage() {
    print_color $BLUE "Cypress Automation Framework - Docker Runner"
    echo ""
    print_color $YELLOW "Usage: $0 [command] [environment] [browser] [test-suite]"
    echo ""
    print_color $GREEN "Commands:"
    echo "  run        - Run tests in headless mode (default)"
    echo "  open       - Open Cypress Test Runner GUI"
    echo "  build      - Build Docker images"
    echo "  clean      - Clean up containers and volumes"
    echo "  logs       - Show container logs"
    echo "  shell      - Access container shell"
    echo "  parallel   - Run tests in parallel"
    echo "  reports    - Generate and serve reports"
    echo "  setup      - Set up complete testing environment"
    echo ""
    print_color $GREEN "Environments:"
    echo "  local      - Local development (default)"
    echo "  dev        - Development environment"
    echo "  staging    - Staging environment"
    echo "  prod       - Production environment"
    echo ""
    print_color $GREEN "Browsers:"
    echo "  chrome     - Google Chrome (default)"
    echo "  firefox    - Mozilla Firefox"
    echo "  edge       - Microsoft Edge"
    echo "  all        - All browsers"
    echo ""
    print_color $GREEN "Test Suites:"
    echo "  smoke      - Smoke tests (default)"
    echo "  regression - Regression tests"
    echo "  integration - Integration tests"
    echo "  visual     - Visual regression tests"
    echo "  all        - All test suites"
    echo ""
    print_color $GREEN "Examples:"
    echo "  $0 run staging chrome smoke"
    echo "  $0 open local"
    echo "  $0 parallel staging all regression"
    echo "  $0 build"
    echo ""
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_color $RED "Error: Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Build Docker images
build_images() {
    print_color $BLUE "Building Docker images..."
    
    # Build main Cypress image
    docker build -f docker/Dockerfile -t cypress-framework:latest --target production .
    
    # Build development image
    docker build -f docker/Dockerfile -t cypress-framework:dev --target development .
    
    # Build CI image
    docker build -f docker/Dockerfile -t cypress-framework:ci --target ci .
    
    print_color $GREEN "Docker images built successfully!"
}

# Clean up containers and volumes
cleanup() {
    print_color $YELLOW "Cleaning up Docker containers and volumes..."
    
    # Stop and remove containers
    docker-compose -f docker/docker-compose.yml down --remove-orphans
    
    # Remove volumes
    docker volume prune -f
    
    # Remove unused images
    docker image prune -f
    
    print_color $GREEN "Cleanup completed!"
}

# Show container logs
show_logs() {
    container_name=${1:-"cypress-framework"}
    print_color $BLUE "Showing logs for container: $container_name"
    docker logs -f $container_name
}

# Access container shell
access_shell() {
    container_name=${1:-"cypress-framework"}
    print_color $BLUE "Accessing shell for container: $container_name"
    docker exec -it $container_name /bin/bash
}

# Set environment variables
set_environment() {
    export ENVIRONMENT=$ENVIRONMENT
    export CYPRESS_ENV=$ENVIRONMENT
    
    case $ENVIRONMENT in
        "local")
            export CYPRESS_BASE_URL="http://localhost:3000"
            ;;
        "dev")
            export CYPRESS_BASE_URL="https://dev.example.com"
            ;;
        "staging")
            export CYPRESS_BASE_URL="https://staging.example.com"
            ;;
        "prod")
            export CYPRESS_BASE_URL="https://example.com"
            ;;
        *)
            print_color $YELLOW "Warning: Unknown environment '$ENVIRONMENT', using default settings"
            export CYPRESS_BASE_URL="http://localhost:3000"
            ;;
    esac
    
    print_color $GREEN "Environment set to: $ENVIRONMENT"
    print_color $GREEN "Base URL: $CYPRESS_BASE_URL"
}

# Run tests
run_tests() {
    print_color $BLUE "Running Cypress tests..."
    print_color $GREEN "Environment: $ENVIRONMENT"
    print_color $GREEN "Browser: $BROWSER"
    print_color $GREEN "Test Suite: $TEST_SUITE"
    
    # Determine the test command based on test suite
    case $TEST_SUITE in
        "smoke")
            TEST_COMMAND="npm run cy:run:smoke"
            ;;
        "regression")
            TEST_COMMAND="npm run cy:run:regression"
            ;;
        "integration")
            TEST_COMMAND="npm run cy:run:integration"
            ;;
        "visual")
            TEST_COMMAND="npm run cy:run:visual"
            ;;
        "all")
            TEST_COMMAND="npm run cy:run"
            ;;
        *)
            print_color $YELLOW "Warning: Unknown test suite '$TEST_SUITE', running all tests"
            TEST_COMMAND="npm run cy:run"
            ;;
    esac
    
    # Run with specific browser if not 'all'
    if [ "$BROWSER" != "all" ]; then
        TEST_COMMAND="$TEST_COMMAND -- --browser $BROWSER"
    fi
    
    # Run the tests
    docker run --rm \
        -v $(pwd):/workspace \
        -v cypress-reports:/workspace/cypress/reports \
        -v cypress-screenshots:/workspace/cypress/screenshots \
        -v cypress-videos:/workspace/cypress/videos \
        -e CYPRESS_baseUrl="$CYPRESS_BASE_URL" \
        -e CYPRESS_ENV="$ENVIRONMENT" \
        -e NO_COLOR=1 \
        --network cypress-network \
        cypress-framework:latest \
        sh -c "$TEST_COMMAND"
}

# Open Cypress Test Runner
open_cypress() {
    print_color $BLUE "Opening Cypress Test Runner..."
    
    # Ensure X11 forwarding is available (for macOS users)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v xquartz &> /dev/null && ! command -v socat &> /dev/null; then
            print_color $YELLOW "Warning: X11 forwarding may not work. Install XQuartz for GUI support."
        fi
    fi
    
    docker-compose -f docker/docker-compose.yml --profile dev up cypress
}

# Run tests in parallel
run_parallel() {
    print_color $BLUE "Running tests in parallel..."
    
    docker-compose -f docker/docker-compose.yml --profile parallel up --scale cypress-parallel=4
}

# Generate and serve reports
serve_reports() {
    print_color $BLUE "Starting Allure report server..."
    
    docker-compose -f docker/docker-compose.yml --profile reports up allure
    
    print_color $GREEN "Allure reports available at: http://localhost:5050"
}

# Set up complete testing environment
setup_environment() {
    print_color $BLUE "Setting up complete testing environment..."
    
    # Build images
    build_images
    
    # Start all services
    docker-compose -f docker/docker-compose.yml --profile app --profile database --profile cache up -d
    
    # Wait for services to be ready
    print_color $YELLOW "Waiting for services to be ready..."
    sleep 10
    
    # Run health checks
    print_color $BLUE "Running health checks..."
    
    # Check if app is running
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_color $GREEN "✓ Test application is running"
    else
        print_color $RED "✗ Test application is not responding"
    fi
    
    # Check if database is running  
    if docker exec test-database pg_isready -U testuser > /dev/null 2>&1; then
        print_color $GREEN "✓ Database is running"
    else
        print_color $RED "✗ Database is not responding"
    fi
    
    print_color $GREEN "Environment setup completed!"
    print_color $BLUE "Available services:"
    echo "  - Test Application: http://localhost:3000"
    echo "  - Database: localhost:5432"
    echo "  - Redis: localhost:6379"
}

# Create test data
create_test_data() {
    print_color $BLUE "Creating test data..."
    
    # Run data seeding script in database container
    docker exec test-database psql -U testuser -d testdb -c "
        INSERT INTO users (id, username, email, created_at) VALUES 
        (1, 'testuser1', 'test1@example.com', NOW()),
        (2, 'testuser2', 'test2@example.com', NOW()),
        (3, 'admin', 'admin@example.com', NOW())
        ON CONFLICT (id) DO NOTHING;
    "
    
    print_color $GREEN "Test data created successfully!"
}

# Monitor system resources
monitor_resources() {
    print_color $BLUE "Monitoring system resources..."
    
    while true; do
        clear
        print_color $BLUE "=== Docker Container Resources ==="
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
        echo ""
        print_color $YELLOW "Press Ctrl+C to stop monitoring"
        sleep 5
    done
}

# Main execution logic
main() {
    # Check for help
    if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
        usage
        exit 0
    fi
    
    # Check if Docker is running
    check_docker
    
    # Set environment variables
    set_environment
    
    # Execute command
    case $COMMAND in
        "run")
            run_tests
            ;;
        "open")
            open_cypress
            ;;
        "build")
            build_images
            ;;
        "clean")
            cleanup
            ;;
        "logs")
            show_logs $2
            ;;
        "shell")
            access_shell $2
            ;;
        "parallel")
            run_parallel
            ;;
        "reports")
            serve_reports
            ;;
        "setup")
            setup_environment
            ;;
        "data")
            create_test_data
            ;;
        "monitor")
            monitor_resources
            ;;
        *)
            print_color $RED "Error: Unknown command '$COMMAND'"
            echo ""
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"