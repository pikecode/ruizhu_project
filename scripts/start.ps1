# Ruizhu E-Commerce Platform - PowerShell Startup Script
# Usage: powershell -ExecutionPolicy Bypass -File start.ps1

param(
    [switch]$NoInstall = $false
)

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$nestapiDir = Join-Path $scriptDir "nestapi"
$miniprogramDir = Join-Path $scriptDir "miniprogram"
$adminDir = Join-Path $scriptDir "admin"

# Color functions
function Write-Info {
    Write-Host "[INFO] $(Get-Date -Format 'HH:mm:ss') - $args" -ForegroundColor Cyan
}

function Write-Success {
    Write-Host "[SUCCESS] $(Get-Date -Format 'HH:mm:ss') - $args" -ForegroundColor Green
}

function Write-Error {
    Write-Host "[ERROR] $(Get-Date -Format 'HH:mm:ss') - $args" -ForegroundColor Red
}

function Write-Warning {
    Write-Host "[WARNING] $(Get-Date -Format 'HH:mm:ss') - $args" -ForegroundColor Yellow
}

# Check directories
Write-Info "Checking project directories..."

$directories = @(
    @{Path = $nestapiDir; Name = "NestAPI" },
    @{Path = $miniprogramDir; Name = "MiniProgram" },
    @{Path = $adminDir; Name = "Admin" }
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir.Path)) {
        Write-Error "Directory not found: $($dir.Path)"
        exit 1
    }
}

Write-Success "All project directories found"
Write-Host ""

# Check dependencies
if (-not $NoInstall) {
    Write-Info "Checking dependencies..."

    foreach ($dir in $directories) {
        $nodeModulesPath = Join-Path $dir.Path "node_modules"
        if (-not (Test-Path $nodeModulesPath)) {
            Write-Warning "$($dir.Name) dependencies not installed"
            Write-Info "Installing dependencies for $($dir.Name)..."
            Push-Location $dir.Path
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to install $($dir.Name) dependencies"
                Pop-Location
                exit 1
            }
            Pop-Location
        }
    }

    Write-Success "All dependencies ready"
    Write-Host ""
}

# Clear screen
Clear-Host

# Print startup banner
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║     🚀 Ruizhu E-Commerce Platform - Dev Server Startup 🚀    ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

Write-Info "Starting all services..."
Write-Host ""

# Start NestAPI Backend
Write-Info "Starting NestAPI Backend on port 3000..."
Push-Location $nestapiDir
$nestapiProcess = Start-Process -FilePath "npm" -ArgumentList "run", "start:dev" -PassThru -WindowStyle Normal
Write-Success "NestAPI Backend started (PID: $($nestapiProcess.Id))"
Write-Host "  📍 URL: http://localhost:3000" -ForegroundColor Yellow
Pop-Location
Write-Host ""

# Wait a bit
Start-Sleep -Seconds 2

# Start Mini Program
Write-Info "Starting Mini Program on port 5173..."
Push-Location $miniprogramDir
$miniprogramProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev:h5" -PassThru -WindowStyle Normal
Write-Success "Mini Program started (PID: $($miniprogramProcess.Id))"
Write-Host "  📍 URL: http://localhost:5173" -ForegroundColor Yellow
Pop-Location
Write-Host ""

# Wait a bit
Start-Sleep -Seconds 2

# Start Admin Dashboard
Write-Info "Starting Admin Dashboard..."
Push-Location $adminDir
$adminProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Normal
Write-Success "Admin Dashboard started (PID: $($adminProcess.Id))"
Write-Host "  📍 URL: http://localhost:5174" -ForegroundColor Yellow
Pop-Location
Write-Host ""

# Print summary
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ All Services Started Successfully ✅           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Available Services:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🔷 Backend API" -ForegroundColor Yellow
Write-Host "     URL: http://localhost:3000"
Write-Host "     Docs: http://localhost:3000/api"
Write-Host ""
Write-Host "  📱 Mini Program (UniApp)" -ForegroundColor Yellow
Write-Host "     URL: http://localhost:5173"
Write-Host "     Platform: H5/Web - For development"
Write-Host ""
Write-Host "  ⚙️  Admin Dashboard" -ForegroundColor Yellow
Write-Host "     URL: http://localhost:5174"
Write-Host "     Management Panel"
Write-Host ""

Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "  • All services are running in separate windows"
Write-Host "  • Make sure MySQL is running on port 3306"
Write-Host "  • Each service logs are shown in their respective windows"
Write-Host "  • Close individual windows to stop specific services"
Write-Host ""

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║            Ready for development! Happy coding! 🎉            ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Keep script running and wait for processes
Write-Info "Press Ctrl+C to stop all services"

# Wait for any process to exit
$processes = @($nestapiProcess, $miniprogramProcess, $adminProcess)
$exitCode = [System.Environment]::ExitCode
Wait-Process -InputObject ($processes | Where-Object { $_ })
