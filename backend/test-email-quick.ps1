Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "`nTesting Email OTP flow..." -ForegroundColor Cyan
Write-Host "Check the BACKEND CONSOLE window for the OTP code!" -ForegroundColor Green
Write-Host "Look for: '🔐 Email OTP for test@example.com: XXXX'" -ForegroundColor Green
Write-Host ""

node test-email-otp.js 0706871283 test@example.com
