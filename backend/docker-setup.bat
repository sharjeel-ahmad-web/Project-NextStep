@echo off
REM NextStep AI - Docker Setup Script (Windows)
REM This script automates the Docker setup for the full stack application

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   NextStep AI - Docker Setup Script
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Desktop first.
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

echo [STEP 1] Building Docker images...
docker-compose build
if errorlevel 1 goto error

echo.
echo [STEP 2] Starting services...
docker-compose up -d
if errorlevel 1 goto error

echo.
echo [STEP 3] Waiting for services to be healthy...
timeout /t 10 /nobreak

echo.
echo [STEP 4] Running database migrations...
docker-compose exec -T backend php artisan migrate --force
if errorlevel 1 goto error

echo.
echo [STEP 5] Generating Laravel APP_KEY...
docker-compose exec -T backend php artisan key:generate --force
if errorlevel 1 goto error

echo.
echo ========================================
echo   Setup completed successfully!
echo ========================================
echo.
echo Access your application:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API:       http://localhost:8000/api
echo.
echo Useful commands:
echo   View logs:        docker-compose logs -f
echo   Stop services:    docker-compose stop
echo   Start services:   docker-compose up -d
echo   Restart services: docker-compose restart
echo.
echo To stop the services later, run:
echo   docker-compose down
echo.
goto :end

:error
echo.
echo [ERROR] Setup failed. Check the error messages above.
exit /b 1

:end
pause
