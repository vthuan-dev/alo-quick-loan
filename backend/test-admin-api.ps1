# Test Admin API
Write-Host 'Testing ALO Quick Loan Admin API...' -ForegroundColor Green
Write-Host ''

$adminApiKey = 'alo-admin-secret-key-2024'
$headers = @{
    'x-admin-api-key' = $adminApiKey
    'Content-Type' = 'application/json'
}

# Test 1: Get Dashboard Stats
Write-Host '1. Testing Dashboard Statistics' -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans/dashboard/stats' -Headers @{'x-admin-api-key' = $adminApiKey}
    Write-Host '   Dashboard Stats:' -ForegroundColor Cyan
    Write-Host "   - Total Applications: $($stats.totalApplications)"
    Write-Host "   - Pending: $($stats.pendingApplications)"
    Write-Host "   - Approved: $($stats.approvedApplications)"
    Write-Host "   - Today's Applications: $($stats.todayApplications)"
    Write-Host "   - Total Loan Amount: $($stats.totalLoanAmount) VND"
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ''

# Test 2: Get All Applications with Filter
Write-Host '2. Testing Advanced Search' -ForegroundColor Yellow
try {
    $apps = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans?limit=5&status=PENDING' -Headers @{'x-admin-api-key' = $adminApiKey}
    Write-Host "   Found $($apps.meta.total) applications (showing first $($apps.data.Length)):" -ForegroundColor Cyan
    foreach ($app in $apps.data) {
        Write-Host "   - $($app.loanApplicationId): $($app.fullName) - $($app.status) - $($app.loanAmount) VND"
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ''

# Test 3: Update Status (if we have applications)
Write-Host '3. Testing Status Update' -ForegroundColor Yellow
try {
    $apps = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans?limit=1' -Headers @{'x-admin-api-key' = $adminApiKey}
    if ($apps.data.Length -gt 0) {
        $appId = $apps.data[0]._id
        $updateBody = @{
            status = 'CONTACTED'
            notes = 'Test update from admin API'
            assignedTo = 'admin@test.com'
        } | ConvertTo-Json

        $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/loans/$appId" -Method PUT -Headers $headers -Body $updateBody
        Write-Host '   Status updated successfully!' -ForegroundColor Green
        Write-Host "   - Application: $($updated.loanApplicationId)"
        Write-Host "   - New Status: $($updated.status)"
        Write-Host "   - Assigned To: $($updated.assignedTo)"
    } else {
        Write-Host '   No applications found to update' -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ''

# Test 4: Quick Search
Write-Host '4. Testing Quick Search' -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans/search?q=Nguyen' -Headers @{'x-admin-api-key' = $adminApiKey}
    Write-Host "   Found $($searchResults.Length) results for 'Nguyen':" -ForegroundColor Cyan
    foreach ($result in $searchResults) {
        Write-Host "   - $($result.loanApplicationId): $($result.fullName)"
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ''

# Test 5: Export Data
Write-Host '5. Testing Export Feature' -ForegroundColor Yellow
try {
    $export = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans/export?format=csv' -Headers @{'x-admin-api-key' = $adminApiKey}
    Write-Host "   Export ready: $($export.count) records in $($export.format) format" -ForegroundColor Green
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ''
Write-Host 'Admin API test completed!' -ForegroundColor Green
Write-Host ''
Write-Host 'Note: To test without authentication, try removing the x-admin-api-key header' -ForegroundColor Yellow
