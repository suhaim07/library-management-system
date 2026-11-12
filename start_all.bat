@echo off
echo ========================================================
echo   Launching LibroSphere Library Management System
echo ========================================================
echo Starting Backend on http://127.0.0.1:8000 ...
start "LibroSphere Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend on http://localhost:3000 ...
start "LibroSphere Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Portal:  http://localhost:3000
echo ========================================================

