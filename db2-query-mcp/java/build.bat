@echo off
echo Building Db2Query.java...
echo Using JDK: D:\usr\java\jdk1.8.0_491x64
echo.

REM Compile Java
"D:\usr\java\jdk1.8.0_491x64\bin\javac" -encoding UTF-8 -cp "jcc-11.5.9.0.jar" Db2Query.java

if %errorlevel% equ 0 (
    echo Build successful!
) else (
    echo Build failed!
    exit /b 1
)

echo.
pause
