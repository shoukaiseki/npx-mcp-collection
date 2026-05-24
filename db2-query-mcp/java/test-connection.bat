@echo off
echo ============================================================
echo DB2 Connection Test - Java Version
echo ============================================================
echo.

REM Set environment variables
set DB2_JDBC_URL=jdbc:db2://localhost:50000/MAXIMO:currentSchema=MAXIMO;
set DB2_USERNAME=db2inst1
set DB2_PASSWORD=Maximo123
set DB2_SCHEMA=MAXIMO

echo.
echo Configuration:
echo   JDBC URL: %DB2_JDBC_URL%
echo   Username: %DB2_USERNAME%
echo.

REM Check if class exists, compile if not
if not exist "Db2Query.class" (
    echo Compiling Db2Query.java...
    call build.bat
    if %errorlevel% neq 0 (
        echo Compilation failed!
        pause
        exit /b 1
    )
)

echo.
echo Testing connection...
echo ============================================================
echo.

REM Run Java
"D:\usr\java\jdk1.8.0_491x64\bin\java" -cp ".;jcc-11.5.9.0.jar" Db2Query info

echo.
echo ============================================================
echo Done!
pause
