@echo off
chcp 65001 >nul
title 纺织工业产教适配平台 - 启动器
set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%textile-edu-platform\backend
set FRONTEND_DIR=%SCRIPT_DIR%textile-edu-platform\frontend

echo ==========================================
echo   纺织工业产教适配平台 启动中...
echo ==========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo [OK] Node.js 已就绪

:: 检查后端依赖
if not exist "%BACKEND_DIR%\node_modules" (
    echo [INFO] 安装后端依赖...
    cd /d "%BACKEND_DIR%"
    call npm install >nul 2>&1
    echo [OK] 后端依赖安装完成
) else (
    echo [OK] 后端依赖已就绪
)

:: 检查前端依赖
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [INFO] 安装前端依赖...
    cd /d "%FRONTEND_DIR%"
    call npm install >nul 2>&1
    echo [OK] 前端依赖安装完成
) else (
    echo [OK] 前端依赖已就绪
)

echo.
echo [INFO] 启动后端服务 (端口 5000)...
start "后端服务" cmd /k "cd /d %BACKEND_DIR% && npm run dev"
timeout /t 4 /nobreak >nul

echo [INFO] 启动前端服务 (端口 3000)...
start "前端服务" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo   网站已就绪！
echo   前端访问: http://localhost:3000
echo   后端 API: http://localhost:5000
echo ==========================================
echo.
echo 关闭此窗口不会影响已启动的服务。
echo 按任意键继续...
pause >nul
