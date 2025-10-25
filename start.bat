@echo off
REM Ruizhu E-Commerce Platform - Multi-Service Startup Script for Windows

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "NESTAPI_DIR=%SCRIPT_DIR%nestapi"
set "MINIPROGRAM_DIR=%SCRIPT_DIR%miniprogram"
set "ADMIN_DIR=%SCRIPT_DIR%admin"

REM Colors (using simple text output for Windows)
echo.
echo =====================================================================
echo.
echo          Ruizhu E-Commerce Platform - Dev Server Startup
echo.
echo =====================================================================
echo.

REM Check directories
echo [INFO] Checking project directories...

if not exist "%NESTAPI_DIR%" (
  echo [ERROR] NestAPI directory not found: %NESTAPI_DIR%
  exit /b 1
)

if not exist "%MINIPROGRAM_DIR%" (
  echo [ERROR] MiniProgram directory not found: %MINIPROGRAM_DIR%
  exit /b 1
)

if not exist "%ADMIN_DIR%" (
  echo [ERROR] Admin directory not found: %ADMIN_DIR%
  exit /b 1
)

echo [SUCCESS] All project directories found
echo.

REM Check dependencies
echo [INFO] Checking dependencies...
echo.

if not exist "%NESTAPI_DIR%\node_modules" (
  echo [WARNING] NestAPI dependencies not installed
  echo Installing dependencies for NestAPI...
  cd /d "%NESTAPI_DIR%"
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install NestAPI dependencies
    exit /b 1
  )
)

if not exist "%MINIPROGRAM_DIR%\node_modules" (
  echo [WARNING] MiniProgram dependencies not installed
  echo Installing dependencies for MiniProgram...
  cd /d "%MINIPROGRAM_DIR%"
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install MiniProgram dependencies
    exit /b 1
  )
)

if not exist "%ADMIN_DIR%\node_modules" (
  echo [WARNING] Admin dependencies not installed
  echo Installing dependencies for Admin...
  cd /d "%ADMIN_DIR%"
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install Admin dependencies
    exit /b 1
  )
)

echo [SUCCESS] All dependencies ready
echo.

REM Clear screen
cls

REM Print startup banner
echo.
echo =====================================================================
echo.
echo          ^!  Ruizhu E-Commerce Platform - Dev Server  ^!
echo.
echo =====================================================================
echo.

echo [INFO] Starting all services...
echo.

REM Start NestAPI Backend in new window
echo [INFO] Starting NestAPI Backend on port 3000...
cd /d "%NESTAPI_DIR%"
start "Ruizhu NestAPI Backend" cmd /k npm run start:dev
timeout /t 2 /nobreak
echo [SUCCESS] NestAPI Backend started
echo   URL: http://localhost:3000
echo.

REM Start Mini Program in new window
echo [INFO] Starting Mini Program on port 5173...
cd /d "%MINIPROGRAM_DIR%"
start "Ruizhu Mini Program (UniApp)" cmd /k npm run dev:h5
timeout /t 2 /nobreak
echo [SUCCESS] Mini Program started
echo   URL: http://localhost:5173
echo.

REM Start Admin Dashboard in new window
echo [INFO] Starting Admin Dashboard...
cd /d "%ADMIN_DIR%"
start "Ruizhu Admin Dashboard" cmd /k npm run dev
timeout /t 2 /nobreak
echo [SUCCESS] Admin Dashboard started
echo   URL: http://localhost:5174
echo.

REM Print summary
echo =====================================================================
echo.
echo             ^! All Services Started Successfully ^!
echo.
echo =====================================================================
echo.
echo Available Services:
echo.
echo   [1] Backend API
echo       URL: http://localhost:3000
echo       Docs: http://localhost:3000/api
echo.
echo   [2] Mini Program (UniApp - H5)
echo       URL: http://localhost:5173
echo       Platform: Web/H5 for development
echo.
echo   [3] Admin Dashboard
echo       URL: http://localhost:5174
echo       Management Panel
echo.
echo Tips:
echo   - All services are running in separate terminal windows
echo   - Make sure MySQL is running on port 3306
echo   - Each service logs are shown in their respective terminal
echo   - Close individual terminals to stop specific services
echo.
echo =====================================================================
echo.

pause
