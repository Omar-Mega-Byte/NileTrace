@echo off
setlocal EnableDelayedExpansion

:: ============================================
:: NileTrace - Smart Startup Script
:: ============================================
:: This script starts all microservices and the frontend
:: with proper dependency ordering and health checks
:: ============================================

title NileTrace - Service Launcher

:: Colors for output (using ANSI escape codes)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "RESET=[0m"

:: Configuration
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

:: Service ports
set "GATEWAY_PORT=8080"
set "AUTH_PORT=8081"
set "INCIDENT_PORT=8082"
set "ANALYSIS_PORT=8083"
set "FRONTEND_PORT=3000"

:: Timeouts
set "HEALTH_CHECK_TIMEOUT=60"
set "HEALTH_CHECK_INTERVAL=3"

echo.
echo %CYAN%============================================%RESET%
echo %CYAN%     NileTrace Service Launcher v1.0       %RESET%
echo %CYAN%============================================%RESET%
echo.

:: Check prerequisites
call :check_prerequisites
if %ERRORLEVEL% neq 0 (
    echo %RED%Prerequisites check failed. Exiting.%RESET%
    pause
    exit /b 1
)

:: Menu
echo %YELLOW%Select startup mode:%RESET%
echo   1. Start all services (recommended)
echo   2. Start backend services only
echo   3. Start frontend only
echo   4. Stop all services
echo   5. Check service status
echo   6. Exit
echo.
set /p "choice=Enter choice (1-6): "

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto stop_all
if "%choice%"=="5" goto check_status
if "%choice%"=="6" exit /b 0

echo %RED%Invalid choice. Please try again.%RESET%
pause
goto :eof

:: ============================================
:: START ALL SERVICES
:: ============================================
:start_all
echo.
echo %CYAN%Starting all NileTrace services...%RESET%
echo.

:: Start backend services
call :start_gateway_service
call :start_auth_service
call :start_incident_service
call :start_analysis_service

:: Wait for backend to be ready
call :wait_for_backend

:: Start frontend
call :start_frontend_service

echo.
echo %GREEN%============================================%RESET%
echo %GREEN%  All services started successfully!       %RESET%
echo %GREEN%============================================%RESET%
echo.
echo %CYAN%Service URLs:%RESET%
echo   API Gateway:      http://localhost:%GATEWAY_PORT%
echo   Auth Service:     http://localhost:%AUTH_PORT%
echo   Incident Service: http://localhost:%INCIDENT_PORT%
echo   Analysis Service: http://localhost:%ANALYSIS_PORT%
echo   Frontend:         http://localhost:%FRONTEND_PORT%
echo.
echo %YELLOW%Press any key to open the frontend in your browser...%RESET%
pause >nul
start http://localhost:%FRONTEND_PORT%
goto :eof

:: ============================================
:: START BACKEND ONLY
:: ============================================
:start_backend
echo.
echo %CYAN%Starting backend services...%RESET%
echo.

call :start_gateway_service
call :start_auth_service
call :start_incident_service
call :start_analysis_service
call :wait_for_backend

echo.
echo %GREEN%Backend services started successfully!%RESET%
echo.
pause
goto :eof

:: ============================================
:: START FRONTEND ONLY
:: ============================================
:start_frontend
echo.
echo %CYAN%Starting frontend...%RESET%
echo.

call :start_frontend_service

echo.
echo %GREEN%Frontend started at http://localhost:%FRONTEND_PORT%%RESET%
echo.
pause
goto :eof

:: ============================================
:: STOP ALL SERVICES
:: ============================================
:stop_all
echo.
echo %YELLOW%Stopping all NileTrace services...%RESET%
echo.

:: Kill processes on service ports
call :kill_port %GATEWAY_PORT% "API Gateway"
call :kill_port %AUTH_PORT% "Auth Service"
call :kill_port %INCIDENT_PORT% "Incident Service"
call :kill_port %ANALYSIS_PORT% "Analysis Service"
call :kill_port %FRONTEND_PORT% "Frontend"

:: Also try to kill any node processes running our frontend
taskkill /f /im node.exe /fi "WINDOWTITLE eq NileTrace*" >nul 2>&1

echo.
echo %GREEN%All services stopped.%RESET%
echo.
pause
goto :eof

:: ============================================
:: CHECK STATUS
:: ============================================
:check_status
echo.
echo %CYAN%Checking service status...%RESET%
echo.

call :check_port %GATEWAY_PORT% "API Gateway"
call :check_port %AUTH_PORT% "Auth Service"
call :check_port %INCIDENT_PORT% "Incident Service"
call :check_port %ANALYSIS_PORT% "Analysis Service"
call :check_port %FRONTEND_PORT% "Frontend"

echo.
pause
goto :eof

:: ============================================
:: HELPER FUNCTIONS
:: ============================================

:check_prerequisites
echo %CYAN%Checking prerequisites...%RESET%

:: Check Java
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%  [X] Java not found. Please install JDK 21+%RESET%
    exit /b 1
)
for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    echo %GREEN%  [OK] Java found: %%i%RESET%
)

:: Check Maven
where mvn >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%  [X] Maven not found. Please install Maven%RESET%
    exit /b 1
)
echo %GREEN%  [OK] Maven found%RESET%

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%  [X] Node.js not found. Please install Node.js 18+%RESET%
    exit /b 1
)
for /f "tokens=1" %%i in ('node -v') do (
    echo %GREEN%  [OK] Node.js found: %%i%RESET%
)

:: Check npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%  [X] npm not found%RESET%
    exit /b 1
)
echo %GREEN%  [OK] npm found%RESET%

:: Check if frontend dependencies are installed
if not exist "%FRONTEND_DIR%\node_modules" (
    echo %YELLOW%  [!] Frontend dependencies not installed. Installing...%RESET%
    cd /d "%FRONTEND_DIR%"
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo %RED%  [X] Failed to install frontend dependencies%RESET%
        exit /b 1
    )
    echo %GREEN%  [OK] Frontend dependencies installed%RESET%
)

echo.
exit /b 0

:start_gateway_service
echo %YELLOW%[1/5] Starting API Gateway on port %GATEWAY_PORT%...%RESET%
cd /d "%BACKEND_DIR%\api-gateway"
start "NileTrace - API Gateway" cmd /c "title NileTrace - API Gateway && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=%GATEWAY_PORT% 2>&1"
timeout /t 3 /nobreak >nul
exit /b 0

:start_auth_service
echo %YELLOW%[2/5] Starting Auth Service on port %AUTH_PORT%...%RESET%
cd /d "%BACKEND_DIR%\auth-service"
start "NileTrace - Auth Service" cmd /c "title NileTrace - Auth Service && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=%AUTH_PORT% 2>&1"
timeout /t 2 /nobreak >nul
exit /b 0

:start_incident_service
echo %YELLOW%[3/5] Starting Incident Service on port %INCIDENT_PORT%...%RESET%
cd /d "%BACKEND_DIR%\incident-service"
start "NileTrace - Incident Service" cmd /c "title NileTrace - Incident Service && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=%INCIDENT_PORT% 2>&1"
timeout /t 2 /nobreak >nul
exit /b 0

:start_analysis_service
echo %YELLOW%[4/5] Starting Analysis Service on port %ANALYSIS_PORT%...%RESET%
cd /d "%BACKEND_DIR%\analysis-service"
start "NileTrace - Analysis Service" cmd /c "title NileTrace - Analysis Service && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=%ANALYSIS_PORT% 2>&1"
timeout /t 2 /nobreak >nul
exit /b 0

:start_frontend_service
echo %YELLOW%[5/5] Starting Frontend on port %FRONTEND_PORT%...%RESET%
cd /d "%FRONTEND_DIR%"

:: Check if node_modules exists
if not exist "node_modules" (
    echo %YELLOW%      Installing dependencies...%RESET%
    call npm install
)

start "NileTrace - Frontend" cmd /c "title NileTrace - Frontend && npm run dev 2>&1"
timeout /t 3 /nobreak >nul
exit /b 0

:wait_for_backend
echo.
echo %CYAN%Waiting for backend services to be ready...%RESET%
set /a "elapsed=0"

:wait_loop
:: Check if all backend services are responding
call :is_port_open %GATEWAY_PORT%
set "gateway_ready=%ERRORLEVEL%"

call :is_port_open %AUTH_PORT%
set "auth_ready=%ERRORLEVEL%"

call :is_port_open %INCIDENT_PORT%
set "incident_ready=%ERRORLEVEL%"

call :is_port_open %ANALYSIS_PORT%
set "analysis_ready=%ERRORLEVEL%"

if %gateway_ready%==0 if %auth_ready%==0 if %incident_ready%==0 if %analysis_ready%==0 (
    echo %GREEN%  All backend services are ready!%RESET%
    exit /b 0
)

set /a "elapsed+=HEALTH_CHECK_INTERVAL"
if %elapsed% geq %HEALTH_CHECK_TIMEOUT% (
    echo %YELLOW%  Warning: Timeout waiting for services. Some may still be starting...%RESET%
    exit /b 0
)

:: Show progress
set "status="
if %gateway_ready%==0 (set "status=!status! Gateway:OK") else (set "status=!status! Gateway:...")
if %auth_ready%==0 (set "status=!status! Auth:OK") else (set "status=!status! Auth:...")
if %incident_ready%==0 (set "status=!status! Incident:OK") else (set "status=!status! Incident:...")
if %analysis_ready%==0 (set "status=!status! Analysis:OK") else (set "status=!status! Analysis:...")
echo   [%elapsed%s]%status%

timeout /t %HEALTH_CHECK_INTERVAL% /nobreak >nul
goto wait_loop

:is_port_open
netstat -an | findstr ":%~1 " | findstr "LISTENING" >nul 2>&1
exit /b %ERRORLEVEL%

:check_port
call :is_port_open %~1
if %ERRORLEVEL%==0 (
    echo %GREEN%  [RUNNING] %~2 (port %~1)%RESET%
) else (
    echo %RED%  [STOPPED] %~2 (port %~1)%RESET%
)
exit /b 0

:kill_port
echo   Stopping %~2 on port %~1...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%~1 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
exit /b 0

endlocal
