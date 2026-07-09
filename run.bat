@echo off
REM Start Backend Laravel Server
cd backend
start cmd /k "php artisan serve"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start Frontend Vite Server
cd ..
start cmd /k "npm run dev"

echo.
echo ✓ Kedua server sudah dijalankan
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5174
echo.
pause
