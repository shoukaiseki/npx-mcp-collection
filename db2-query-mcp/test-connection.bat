@echo off
echo ============================================================
echo DB2 Connection Test
echo ============================================================
echo.

REM Set environment variables
set DB2_JDBC_URL=DATABASE=MAXIMO;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP
set DB2_USERNAME=db2inst1
set DB2_PASSWORD=Maximo123
set DB2_SCHEMA=MAXIMO

REM Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js and add to PATH
    pause
    exit /b 1
)

echo [INFO] Testing database connection...
echo.

REM Run test script
node "%~dp0test-connection.js"

echo.
pause
