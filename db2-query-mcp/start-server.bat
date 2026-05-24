@echo off
chcp 65001 >nul
echo ============================================================
echo DB2 Query MCP - 服务器启动脚本
echo ============================================================
echo.

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 设置环境变量
set DB2_JDBC_URL=DATABASE=MAXIMO;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP
set DB2_USERNAME=db2inst1
set DB2_PASSWORD=Maximo123
set DB2_SCHEMA=MAXIMO
set MCP_PORT=21002

REM 检查 Node.js 是否可用
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请确保已安装 Node.js 并添加到 PATH
    pause
    exit /b 1
)

REM 检查是否已构建
if not exist "dist\index.js" (
    echo [警告] 未找到编译后的文件，正在构建...
    call build.bat
    if %errorlevel% neq 0 (
        echo [错误] 构建失败
        pause
        exit /b 1
    )
)

echo [信息] 正在启动 MCP 服务器...
echo [信息] 端口: %MCP_PORT%
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ============================================================
echo.

REM 启动服务器
node dist\index.js

pause
