Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching LibroSphere Library Management System" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Write-Host ""
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "Frontend Portal:  http://localhost:3000" -ForegroundColor Green

