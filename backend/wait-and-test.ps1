# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test the OTP flow
Write-Host "`nTesting OTP flow..." -ForegroundColor Cyan
node test-otp-development.js 0706871283
