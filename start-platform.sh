#!/usr/bin/env bash
# ==============================================================================
# ALGOLSOFT ENTERPRISE ERP PLATFORM - LOCAL STARTUP SCRIPT (BASH)
# ==============================================================================

set -e

echo "================================================================="
echo "  ALGOLSOFT AI-Native Enterprise ERP Platform Startup"
echo "================================================================="

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH."
    exit 1
fi

echo -e "\n[1/3] Starting Polyglot Persistence Stack via Docker Compose..."
docker compose up -d postgres clickhouse redis kafka minio

echo -e "\n[2/3] Waiting for PostgreSQL 16 to be ready..."
until docker exec algolsoft-postgres pg_isready -U algolsoft_admin -d algolsoft_erp > /dev/null 2>&1; do
    echo "Waiting for database initialization..."
    sleep 2
done
echo "PostgreSQL is healthy and ready!"

echo -e "\n[3/3] Platform Stack Initialized Successfully!"
echo "Endpoints available:"
echo "  • PostgreSQL 16 (OLTP):    localhost:5432 (DB: algolsoft_erp)"
echo "  • ClickHouse (OLAP):       http://localhost:8123"
echo "  • Redis 7:                 localhost:6379"
echo "  • Apache Kafka:            localhost:9092"
echo "  • MinIO S3 Console:        http://localhost:9001 (User: minio_admin)"
echo ""
echo "To start the Go Finance Microservice:"
echo "  cd services/finance && go run cmd/server/main.go"
echo ""
echo "To start the Python AI Agent Swarm:"
echo "  cd services/ai_swarm && python main.py"
echo "================================================================="
