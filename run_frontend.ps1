Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting LibroSphere Frontend (Next.js)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
npm run dev

