# ==============================================================================
# ALGOLSOFT ENTERPRISE ERP PLATFORM - LOCAL STARTUP SCRIPT (POWERSHELL)
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ALGOLSOFT AI-Native Enterprise ERP Platform Startup" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Check Docker status
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop."
    exit 1
}

Write-Host "`n[1/3] Starting Polyglot Persistence Stack via Docker Compose..." -ForegroundColor Yellow
docker compose up -d postgres clickhouse redis kafka minio

Write-Host "`n[2/3] Waiting for PostgreSQL 16 to be ready..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
while ($retryCount -lt $maxRetries) {
    $status = docker inspect -f '{{.State.Health.Status}}' algolsoft-postgres 2>$null
    if ($status -eq "healthy") {
        Write-Host "PostgreSQL is healthy and ready!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $retryCount++
    Write-Host "Waiting for database initialization ($retryCount/$maxRetries)..."
}

Write-Host "`n[3/3] Platform Stack Initialized Successfully!" -ForegroundColor Green
Write-Host "`nEndpoints available:"
Write-Host "  • PostgreSQL 16 (OLTP):    localhost:5432 (DB: algolsoft_erp)" -ForegroundColor White
Write-Host "  • ClickHouse (OLAP):       http://localhost:8123" -ForegroundColor White
Write-Host "  • Redis 7:                 localhost:6379" -ForegroundColor White
Write-Host "  • Apache Kafka:            localhost:9092" -ForegroundColor White
Write-Host "  • MinIO S3 Console:        http://localhost:9001 (User: minio_admin)" -ForegroundColor White
Write-Host "`nTo start the Go Finance Microservice:"
Write-Host "  cd services/finance && go run cmd/server/main.go" -ForegroundColor Cyan
Write-Host "`nTo start the Python AI Agent Swarm:"
Write-Host "  cd services/ai_swarm && python main.py" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
