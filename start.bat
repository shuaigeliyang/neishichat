@echo off
echo.
echo ========================================
echo   Start All Services
echo ========================================
echo.

echo Starting backend...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo Starting frontend...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Services started successfully!
echo   Backend: http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
pause
