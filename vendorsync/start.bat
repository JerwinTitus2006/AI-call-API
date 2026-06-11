@echo off
echo Starting VendorSync...
echo.
echo [1/2] Starting Backend (FastAPI + Socket.io) on port 8000...
start "VendorSync Backend" cmd /k "cd /d %~dp0backend && uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload"
timeout /t 2 /nobreak > nul
echo [2/2] Starting Frontend (Vite) on port 5173...
start "VendorSync Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo VendorSync is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
start http://localhost:5173
