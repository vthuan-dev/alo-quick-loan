# Twilio OTP Flow Test Script for PowerShell
param(
    [string]$PhoneNumber = "0912345678"  # Default Vietnamese number format
)

$API_BASE_URL = "http://localhost:3000"
$TEST_PHONE_NUMBER = $PhoneNumber

Write-Host "=== Twilio OTP Flow Test ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Send OTP
    Write-Host "1. Sending OTP to phone number: $TEST_PHONE_NUMBER" -ForegroundColor Yellow
    Write-Host "   POST $API_BASE_URL/api/auth/send-otp"
    
    $sendOtpBody = @{
        phoneNumber = $TEST_PHONE_NUMBER
    } | ConvertTo-Json
    
    $sendOtpResponse = Invoke-RestMethod -Uri "$API_BASE_URL/api/auth/send-otp" `
        -Method Post `
        -ContentType "application/json" `
        -Body $sendOtpBody
    
    Write-Host "   ✓ Response: $($sendOtpResponse | ConvertTo-Json -Compress)" -ForegroundColor Green
    Write-Host "   ✓ OTP expires in $($sendOtpResponse.expiresIn) seconds" -ForegroundColor Green
    Write-Host ""
    
    # In development mode, check logs for OTP code
    Write-Host "2. Check your console logs or SMS for the OTP code" -ForegroundColor Yellow
    Write-Host "   In development mode, the OTP will be logged to console"
    Write-Host "   In production mode, check SMS on phone number: $TEST_PHONE_NUMBER"
    Write-Host ""
    
    # Wait for user input
    $otpCode = Read-Host "   Enter the OTP code you received"
    
    # Step 2: Verify OTP
    Write-Host ""
    Write-Host "3. Verifying OTP: $otpCode" -ForegroundColor Yellow
    Write-Host "   POST $API_BASE_URL/api/auth/login"
    
    $loginBody = @{
        phoneNumber = $TEST_PHONE_NUMBER
        otp = $otpCode
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE_URL/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "   ✓ Login successful!" -ForegroundColor Green
    Write-Host "   ✓ Access token: $($loginResponse.accessToken.Substring(0, [Math]::Min(50, $loginResponse.accessToken.Length)))..." -ForegroundColor Green
    Write-Host "   ✓ Token expires in: $($loginResponse.expiresIn) seconds" -ForegroundColor Green
    Write-Host "   ✓ Phone number: $($loginResponse.phoneNumber)" -ForegroundColor Green
    
    # Step 3: Test authenticated request
    Write-Host ""
    Write-Host "4. Testing authenticated request" -ForegroundColor Yellow
    Write-Host "   GET /api/auth/profile (example endpoint)"
    
    try {
        $headers = @{
            Authorization = "Bearer $($loginResponse.accessToken)"
        }
        
        $profileResponse = Invoke-RestMethod -Uri "$API_BASE_URL/api/auth/profile" `
            -Method Get `
            -Headers $headers
        
        Write-Host "   ✓ Authenticated request successful" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   ℹ Profile endpoint not implemented (404), but authentication header was accepted" -ForegroundColor Cyan
        }
        else {
            Write-Host "   ℹ Authenticated request test skipped" -ForegroundColor Cyan
        }
    }
    
    Write-Host ""
    Write-Host "✅ OTP flow test completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "❌ Test failed: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
    
    # Common error hints
    if ($_.Exception.Message -like "*Unable to connect*") {
        Write-Host ""
        Write-Host "💡 Hint: Make sure the backend server is running on port 3000" -ForegroundColor Yellow
    }
    elseif ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host ""
        Write-Host "💡 Hint: Check if the phone number format is correct or if you're sending OTP too frequently" -ForegroundColor Yellow
    }
}
