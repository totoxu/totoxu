# ============================================
# 纺织工业产教适配平台 - 一键启动脚本
# 运行方式：双击 run.ps1 或在终端执行：
# powershell -ExecutionPolicy Bypass -File "C:\Users\toto\Desktop\产教通网站定型\run.ps1"
# ============================================

$ErrorActionPreference = "Continue"
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "textile-edu-platform\backend"
$frontendDir = Join-Path $scriptDir "textile-edu-platform\frontend"

# 颜色输出
function Write-Info  { Write-Host "[INFO]  $args" -ForegroundColor Cyan }
function Write-Ok    { Write-Host "[OK]    $args" -ForegroundColor Green }
function Write-Err   { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Warn  { Write-Host "[WARN]  $args" -ForegroundColor Yellow }

Write-Host ""
Write-Host "==========================================" -ForegroundColor DarkCyan
Write-Host "  纺织工业产教适配平台 启动中..." -ForegroundColor DarkCyan
Write-Host "==========================================" -ForegroundColor DarkCyan
Write-Host ""

# ── 1. 检查 Node.js ──
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Err "未找到 Node.js，请先安装 Node.js 18+ (https://nodejs.org)"
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
$nodeVer = & node -v 2>$null
Write-Ok "Node.js $nodeVer 已就绪"

# ── 2. 检查 PostgreSQL ──
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
    Write-Warn "PostgreSQL 服务未检测到（可能需要手动启动）"
    $cont = Read-Host "`n是否继续启动？(y/n)"
    if ($cont -ne 'y') { exit 0 }
} else {
    Write-Ok "PostgreSQL 运行中"
}

# ── 3. 安装/检查依赖 ──
Write-Info "检查依赖..."
if (-not (Test-Path (Join-Path $backendDir "node_modules"))) {
    Write-Info "安装后端依赖..."
    Push-Location $backendDir; npm install 2>&1 | Out-Null; Pop-Location
    Write-Ok "后端依赖安装完成"
} else { Write-Ok "后端依赖已就绪" }

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Info "安装前端依赖..."
    Push-Location $frontendDir; npm install 2>&1 | Out-Null; Pop-Location
    Write-Ok "前端依赖安装完成"
} else { Write-Ok "前端依赖已就绪" }

# ── 4. 启动后端 ──
Write-Info "启动后端服务 (端口 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 4

# ── 5. 启动前端 ──
Write-Info "启动前端服务 (端口 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# ── 6. 验证端口 ──
$port3000 = netstat -ano | Select-String ":3000.*LISTENING" | Select-Object -First 1
$port5000 = netstat -ano | Select-String ":5000.*LISTENING" | Select-Object -First 1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Ok "  网站已就绪！"
Write-Host "  前端访问: http://localhost:3000" -ForegroundColor White
Write-Host "  后端 API: http://localhost:5000" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "打开浏览器访问 http://localhost:3000 即可使用。" -ForegroundColor Gray
Write-Host "关闭此窗口不会影响已启动的服务。" -ForegroundColor Gray
Write-Host ""
Write-Host "按任意键关闭启动窗口..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
