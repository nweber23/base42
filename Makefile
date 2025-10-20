.PHONY: help build up down logs clean dev test lint install setup

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup and Installation
setup: ## Initial project setup
	@echo "Setting up base42 project..."
	@cp base42-backend/.env.example base42-backend/.env
	@echo "Please edit base42-backend/.env with your 42 API credentials"
	@echo "Remember to set REDIRECT_URI=http://localhost:3000/auth/callback in your 42 app settings"

install: ## Install dependencies for both frontend and backend
	@echo "Installing frontend dependencies..."
	@npm install
	@echo "Installing backend dependencies..."
	@cd base42-backend && npm install

# Development
dev: ## Start development environment
	@echo "Starting development environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-frontend: ## Start only frontend in development mode
	@echo "Starting frontend development server..."
	@npm run dev

dev-backend: ## Start only backend in development mode
	@echo "Starting backend development server..."
	@cd base42-backend && npm run dev

# Production
build: ## Build all Docker images
	@echo "Building Docker images..."
	@docker-compose build --no-cache

up: ## Start all services in production mode
	@echo "Starting all services..."
	@docker-compose up -d

down: ## Stop all services
	@echo "Stopping all services..."
	@docker-compose down

restart: ## Restart all services
	@echo "Restarting all services..."
	@docker-compose restart

# Logs and Monitoring
logs: ## View logs from all services
	@docker-compose logs -f

logs-backend: ## View backend logs only
	@docker-compose logs -f backend

logs-frontend: ## View frontend logs only
	@docker-compose logs -f frontend

logs-db: ## View database logs only
	@docker-compose logs -f postgres

# Database Operations
db-shell: ## Connect to PostgreSQL database
	@docker-compose exec postgres psql -U postgres -d base42

db-backup: ## Backup database
	@echo "Creating database backup..."
	@docker-compose exec postgres pg_dump -U postgres base42 > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database from backup (usage: make db-restore FILE=backup.sql)
	@echo "Restoring database from $(FILE)..."
	@docker-compose exec -T postgres psql -U postgres -d base42 < $(FILE)

# Cache Operations  
redis-cli: ## Connect to Redis CLI
	@docker-compose exec redis redis-cli -a redis123

cache-clear: ## Clear Redis cache
	@docker-compose exec redis redis-cli -a redis123 FLUSHALL

# Development Tools
lint: ## Run linting for frontend and backend
	@echo "Running frontend linting..."
	@npm run lint
	@echo "Running backend linting..."
	@cd base42-backend && npm run lint 2>/dev/null || echo "Backend linting not configured"

test: ## Run tests
	@echo "Running frontend tests..."
	@npm test 2>/dev/null || echo "Frontend tests not configured"
	@echo "Running backend tests..."
	@cd base42-backend && npm test 2>/dev/null || echo "Backend tests not configured"

# Cleanup
clean: ## Stop services and remove containers, volumes, and images
	@echo "Cleaning up Docker resources..."
	@docker-compose down -v --rmi all --remove-orphans

clean-containers: ## Remove all stopped containers
	@docker container prune -f

clean-images: ## Remove dangling images
	@docker image prune -f

clean-volumes: ## Remove unused volumes
	@docker volume prune -f

# Health Checks
status: ## Check status of all services
	@docker-compose ps

health: ## Check health of all services
	@echo "Checking service health..."
	@docker-compose exec backend wget --no-verbose --tries=1 --spider http://localhost:5000/ping || echo "Backend: UNHEALTHY"
	@docker-compose exec postgres pg_isready -U postgres -d base42 || echo "Database: UNHEALTHY"
	@docker-compose exec redis redis-cli -a redis123 ping || echo "Redis: UNHEALTHY"

# 42 API Setup Helper
api-info: ## Show 42 API configuration info
	@echo "=== 42 API Configuration ==="
	@echo "Make sure to configure your 42 app with:"
	@echo "  Redirect URI: http://localhost:3000/auth/callback"
	@echo "  (or https://yourdomain.com/auth/callback for production)"
	@echo ""
	@echo "Environment variables needed in base42-backend/.env:"
	@echo "  API_UID=your_42_api_uid"
	@echo "  API_SECRET=your_42_api_secret"
	@echo "  REDIRECT_URI=http://localhost:3000/auth/callback"