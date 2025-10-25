@echo off
REM Ruizhu MySQL Installation Script for Windows
REM Requires Administrator privileges

setlocal enabledelayedexpansion

REM Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] This script requires Administrator privileges
  echo Please right-click on this script and select "Run as administrator"
  echo.
  pause
  exit /b 1
)

REM Colors (approximated with text for Windows)
echo.
echo =====================================================================
echo.
echo        MySQL Installation for Ruizhu Project (Windows)
echo.
echo =====================================================================
echo.

REM Check if MySQL is already installed
echo [INFO] Checking if MySQL is already installed...
where mysql >nul 2>&1
if %errorlevel% equ 0 (
  echo [WARNING] MySQL appears to be already installed
  mysql --version
  set /p choice="Do you want to continue? (y/n): "
  if /i not "!choice!"=="y" exit /b 0
) else (
  echo [INFO] MySQL not found, will be installed
)

echo.

REM Check for Chocolatey
echo [INFO] Checking for Chocolatey package manager...
where choco >nul 2>&1
if %errorlevel% equ 0 (
  echo [SUCCESS] Chocolatey is installed
  echo.
  echo [INFO] Installing MySQL using Chocolatey...
  choco install mysql --yes

  if !errorlevel! equ 0 (
    echo [SUCCESS] MySQL installed successfully
  ) else (
    echo [ERROR] Failed to install MySQL with Chocolatey
    echo Trying alternative method...
  )
) else (
  echo [WARNING] Chocolatey not found
  echo.
  echo [INFO] Alternative installation methods:
  echo   1. Download from: https://dev.mysql.com/downloads/mysql/
  echo   2. Or install Chocolatey: https://chocolatey.org/install
  echo   3. Or use XAMPP: https://www.apachefriends.org/
  echo.
  pause
  exit /b 1
)

echo.

REM Check MySQL version
echo [INFO] Checking MySQL installation...
mysql --version
if %errorlevel% equ 0 (
  echo [SUCCESS] MySQL verified
) else (
  echo [ERROR] MySQL installation verification failed
  echo Please restart your computer and try again
  pause
  exit /b 1
)

echo.

REM Start MySQL service
echo [INFO] Starting MySQL service...

REM Try different service names
for %%S in (MySQL80 MySQL57 MySQL MySQL8) do (
  net start %%S >nul 2>&1
  if !errorlevel! equ 0 (
    echo [SUCCESS] MySQL service started (%%S)
    set "SERVICE_NAME=%%S"
    goto service_started
  )
)

:service_started
if not defined SERVICE_NAME (
  echo [WARNING] Could not start MySQL service automatically
  echo Please start MySQL service manually:
  echo   Services ^(Services.msc^) ^> MySQL80 ^> Right click ^> Start
  echo.
  pause
)

echo.

REM Create Ruizhu database
echo [INFO] Creating Ruizhu database...
echo.
set /p password="Enter MySQL root password (press Enter if empty): "

if "!password!"=="" (
  mysql -u root -e "CREATE DATABASE IF NOT EXISTS ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  if !errorlevel! equ 0 (
    echo [SUCCESS] Ruizhu database created successfully
  ) else (
    echo [ERROR] Failed to create database
    echo Please create it manually or check your password
    pause
    exit /b 1
  )
) else (
  mysql -u root -p!password! -e "CREATE DATABASE IF NOT EXISTS ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  if !errorlevel! equ 0 (
    echo [SUCCESS] Ruizhu database created successfully
  ) else (
    echo [ERROR] Failed to create database
    echo Please check your MySQL root password
    pause
    exit /b 1
  )
)

echo.

REM Display configuration
echo =====================================================================
echo.
echo             MySQL Installation Complete ✅
echo.
echo =====================================================================
echo.
echo MySQL Configuration:
echo   Host:     localhost
echo   Port:     3306
echo   Username: root
echo   Database: ruizhu
echo.
echo Useful Commands:
echo   Start MySQL:   net start MySQL80
echo   Stop MySQL:    net stop MySQL80
echo   Connect:       mysql -u root -p
echo.
echo Next Steps:
echo   1. Update nestapi\.env with database credentials
echo   2. Run: npm install ^& npm run start:dev (in nestapi directory)
echo   3. Run: start.bat (in project root to start all services)
echo.
echo [SUCCESS] MySQL setup complete!
echo.

pause
