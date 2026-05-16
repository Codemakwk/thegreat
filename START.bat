@echo off
title TheGreat Store - Starting...
color 0A

echo.
echo  ==========================================
echo    TheGreat Store - Starting Up...
echo  ==========================================
echo.

echo [1/4] Setting up database...
cd /d C:\Users\jarvi\Desktop\thegreat\backend
call npx prisma generate --silent 2>nul
call npx prisma db push --skip-generate 2>nul
echo  Database ready!
echo.

echo [2/4] Installing backend dependencies...
call npm install --silent 2>nul
echo  Backend ready!
echo.

echo [3/4] Starting Backend Server...
start "TheGreat BACKEND" cmd /k "cd /d C:\Users\jarvi\Desktop\thegreat\backend && npm run dev"
timeout /t 4 /nobreak >nul

echo [4/4] Starting Frontend...
start "TheGreat FRONTEND" cmd /k "cd /d C:\Users\jarvi\Desktop\thegreat\frontend && npm install --silent && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo  ==========================================
echo    Website is starting!
echo    Open: http://localhost:5173
echo  ==========================================
echo.

start http://localhost:5173

pause
