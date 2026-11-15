@echo off
title DevMind AI Platform Runner
echo ========================================================
echo        Starting DevMind AI Platform (Backend + Frontend)
echo ========================================================
echo.
start "DevMind Backend API (Port 8000)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000"
timeout /t 2 /nobreak > nul
start "DevMind Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo ========================================================
echo Both servers launched!
echo Open your browser at: http://localhost:3000
echo ========================================================

