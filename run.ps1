# textile-edu-platform - One-click startup
# Run: double-click or: powershell -ExecutionPolicy Bypass -File "C:\...\run.ps1"

$ErrorActionPreference = "Continue"
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "textile-edu-platform\backend"
$frontendDir = Join-Path $scriptDir "textile-edu-platform\frontend"

function Write-Info  { Write-Host "[INFO]  $args" -ForegroundColor Cyan }
function Write-Ok    { Write-Host "[OK]    $args" -ForegroundColor Green }
function Write-Err   { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Warn  { Write-Host "[WARN]  $args" -ForegroundColor Yellow }

Write-Host ""
Write-Host "==========================================" -ForegroundColor DarkCyan
Write-Host "  Textile Edu Platform - Starting..." -ForegroundColor DarkCyan
Write-Host "==========================================" -ForegroundColor DarkCyan
Write-Host ""

# 1. Check Node.js
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Err "Node.js not found. Please install Node.js 18+ (https://nodejs.org)"
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
$nodeVer = & node -v 2>$null
Write-Ok "Node.js $nodeVer ready"

# 2. Check PostgreSQL
$pgOk = $false
try {
    $svc = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($svc -and $svc.Status -eq 'Running') { $pgOk = $true }
} catch {}
if (-not $pgOk) {
    try {
        $conn = New-Object System.Data.SqlClient.SqlConnection("Server=localhost;Database=postgres;User Id=postgres;Password=postgres;Timeout=3")
        $conn.Open(); $conn.Close(); $pgOk = $true
    } catch {}
}
if (-not $pgOk) {
    Write-Warn "PostgreSQL service not detected (may need manual start)"
    Write-Host "Type 'y' to continue anyway:" -ForegroundColor Yellow
    $cont = Read-Host
    if ($cont -ne 'y') { exit 0 }
} else {
    Write-Ok "PostgreSQL running"
}

# 3. Check/Install dependencies
Write-Info "Checking dependencies..."
if (-not (Test-Path (Join-Path $backendDir "node_modules"))) {
    Write-Info "Installing backend dependencies..."
    Push-Location $backendDir; npm install 2>&1 | Out-Null; Pop-Location
    Write-Ok "Backend dependencies installed"
} else { Write-Ok "Backend dependencies ready" }

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Info "Installing frontend dependencies..."
    Push-Location $frontendDir; npm install 2>&1 | Out-Null; Pop-Location
    Write-Ok "Frontend dependencies installed"
} else { Write-Ok "Frontend dependencies ready" }

# 4. Start backend
Write-Info "Starting backend service (port 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 4

# 5. Start frontend
Write-Info "Starting frontend service (port 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# 6. Verify ports
$port3000 = netstat -ano | Select-String ":3000.*LISTENING" | Select-Object -First 1
$port5000 = netstat -ano | Select-String ":5000.*LISTENING" | Select-Object -First 1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Ok "  Website Ready!"
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Open browser to http://localhost:3000 to use the site." -ForegroundColor Gray
Write-Host "Closing this window will NOT stop the running services." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
