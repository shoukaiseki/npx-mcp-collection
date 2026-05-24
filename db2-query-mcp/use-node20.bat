@echo off
echo Switching to Node.js 20.20.2...
nvm use 20.20.2
echo.
node --version
echo.
echo Done! You can now run:
echo   npm rebuild
echo   npm run build
echo   test-connection.bat
echo.
pause
