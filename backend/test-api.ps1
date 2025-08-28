# Test ALO Quick Loan API

Write-Host 'Testing ALO Quick Loan API...' -ForegroundColor Green
Write-Host ''

# Test 1: Get Rates
Write-Host '1. Testing GET /api/loan/rates' -ForegroundColor Yellow
$rates = Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/rates' -Method GET
Write-Host "Available loan amounts: $($rates.availableAmounts -join ', ')" -ForegroundColor Cyan
Write-Host "Available terms: $($rates.availableTerms -join ', ') days" -ForegroundColor Cyan
Write-Host ''

# Test 2: Create Loan Application
Write-Host '2. Testing POST /api/loan/step1' -ForegroundColor Yellow
$step1Body = @{
    fullName = "Test User $(Get-Random -Maximum 1000)"
    phoneNumber = "09$(Get-Random -Minimum 10000000 -Maximum 99999999)"
    loanAmount = 2500000
    loanTerm = 30
} | ConvertTo-Json

try {
    $step1Response = Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/step1' -Method POST -Headers @{'Content-Type'='application/json'} -Body $step1Body
    Write-Host 'Loan application created successfully!' -ForegroundColor Green
    Write-Host "  - Application ID: $($step1Response.loanApplicationId)" -ForegroundColor White
    Write-Host "  - Loan Amount: $($step1Response.loanAmount) VND" -ForegroundColor White
    Write-Host "  - Loan Term: $($step1Response.loanTerm) days" -ForegroundColor White
    Write-Host "  - Daily Payment: $($step1Response.dailyPayment) VND" -ForegroundColor White
    Write-Host "  - Total Repayment: $($step1Response.dailyPayment * $step1Response.loanTerm) VND" -ForegroundColor White
} catch {
    Write-Host "Error creating loan application: $_" -ForegroundColor Red
}

Write-Host ''
Write-Host 'API test completed!' -ForegroundColor Green
