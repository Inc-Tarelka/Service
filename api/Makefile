.PHONY: build run test clean swagger migrate-up migrate-down docker-up docker-down

# Build
build:
	go build -o bin/api ./cmd/api

# Run locally
run:
	go run ./cmd/api

# Run tests
test:
	go test -v ./...

# Clean
clean:
	rm -rf bin/

# Generate swagger docs
swagger:
	swag init -g cmd/api/main.go -o docs

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-build:
	docker-compose build

# Database migrations (manual)
# Requires: go install github.com/rubenv/sql-migrate/...@latest
migrate-up:
	sql-migrate up -config=dbconfig.yml

migrate-down:
	sql-migrate down -config=dbconfig.yml

migrate-status:
	sql-migrate status -config=dbconfig.yml

# Alternative: using psql directly
db-migrate:
	@echo "Applying migrations manually..."
	@for f in migrations/*.sql; do \
		echo "Applying $$f..."; \
		psql "$(DATABASE_URL)" -f "$$f"; \
	done

# Development
dev: docker-up
	@echo "Waiting for database..."
	@sleep 3
	go run ./cmd/api

# Install dependencies
deps:
	go mod download
	go mod tidy

# Install tools
tools:
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/rubenv/sql-migrate/...@latest
