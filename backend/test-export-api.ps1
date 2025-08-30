# Test API Export Report
$baseUrl = "http://localhost:3000"
$adminToken = "your-admin-token-here" # Thay bằng token thực tế

Write-Host "Testing Export API..." -ForegroundColor Green

# Test 1: Export today's loans
Write-Host "`n1. Testing export today's loans..." -ForegroundColor Yellow
$today = Get-Date -Format "yyyy-MM-dd"
$response1 = Invoke-RestMethod -Uri "$baseUrl/api/admin/loans/export?startDate=$today&endDate=$today" -Headers @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
    "x-admin-api-key" = "your-admin-api-key"
} -Method GET

Write-Host "Today's loans count: $($response1.Count)" -ForegroundColor Cyan

# Test 2: Export this week's loans
Write-Host "`n2. Testing export this week's loans..." -ForegroundColor Yellow
$weekAgo = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
$today = Get-Date -Format "yyyy-MM-dd"
$response2 = Invoke-RestMethod -Uri "$baseUrl/api/admin/loans/export?startDate=$weekAgo&endDate=$today" -Headers @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
    "x-admin-api-key" = "your-admin-api-key"
} -Method GET

Write-Host "This week's loans count: $($response2.Count)" -ForegroundColor Cyan

# Test 3: Export by status
Write-Host "`n3. Testing export by status (PENDING)..." -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "$baseUrl/api/admin/loans/export?status=PENDING" -Headers @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
    "x-admin-api-key" = "your-admin-api-key"
} -Method GET

Write-Host "Pending loans count: $($response3.Count)" -ForegroundColor Cyan

Write-Host "`nExport API test completed!" -ForegroundColor Green
