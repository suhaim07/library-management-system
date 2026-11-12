Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting LibroSphere Backend (Python FastAPI)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

