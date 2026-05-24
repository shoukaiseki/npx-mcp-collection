@echo off
echo ============================================================
echo DB2 Query MCP - Build Script
echo ============================================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js and add to PATH
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found, please install Node.js and add to PATH
    pause
    exit /b 1
)

echo [INFO] Current directory: %cd%
echo.

echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [INFO] Compiling TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to compile
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Build SUCCESS!
echo ============================================================
echo.
echo Generated files:
echo   - dist\ directory with compiled JavaScript
echo.
echo Next steps:
echo   1. Run test-connection.bat to test database connection
echo   2. Or configure with your MCP client
echo.
pause
