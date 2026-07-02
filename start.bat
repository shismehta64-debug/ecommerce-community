@echo off
title Community Connect Launcher
echo ===================================================
echo   Starting Community Connect Platform Servers...
echo ===================================================
echo.

echo [1/2] Launching Backend API (Port 3000)...
start "Community Connect Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Launching Frontend Client (Port 5173)...
start "Community Connect Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Servers launched in separate terminal windows!
echo   - Backend: http://localhost:3000
echo   - Frontend: http://localhost:5173
echo.
echo   Press any key to close this launcher...
echo ===================================================
pause > nul
