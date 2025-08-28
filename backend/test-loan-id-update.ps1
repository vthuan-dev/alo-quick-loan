# Test updating by loan application ID
Write-Host 'Testing update by loan application ID...' -ForegroundColor Green
Write-Host ''

$adminApiKey = 'alo-admin-secret-key-2024'
$headers = @{
    'x-admin-api-key' = $adminApiKey
    'Content-Type' = 'application/json'
}

# First, get the list of applications
Write-Host '1. Getting list of applications...' -ForegroundColor Yellow
$apps = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans?limit=1' -Headers @{'x-admin-api-key' = $adminApiKey}

if ($apps.data.Length -gt 0) {
    $app = $apps.data[0]
    $loanId = $app.loanApplicationId
    $mongoId = $app._id
    
    Write-Host "   Found application:" -ForegroundColor Cyan
    Write-Host "   - Loan ID: $loanId"
    Write-Host "   - MongoDB ID: $mongoId"
    Write-Host "   - Name: $($app.fullName)"
    Write-Host "   - Current Status: $($app.status)"
    Write-Host ''
    
    # Update using loan application ID
    Write-Host '2. Updating status using LOAN APPLICATION ID...' -ForegroundColor Yellow
    $updateBody = @{
        status = 'IN_PROGRESS'
        notes = 'Updated using loan application ID'
        assignedTo = 'admin@test.com'
    } | ConvertTo-Json
    
    try {
        $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/loans/$loanId" -Method PUT -Headers $headers -Body $updateBody
        Write-Host '   ✓ Update successful!' -ForegroundColor Green
        Write-Host "   - New Status: $($updated.status)"
        Write-Host "   - Assigned To: $($updated.assignedTo)"
    } catch {
        Write-Host "   ✗ Update failed: $_" -ForegroundColor Red
    }
    
    Write-Host ''
    
    # Get history using loan application ID
    Write-Host '3. Getting history using LOAN APPLICATION ID...' -ForegroundColor Yellow
    try {
        $history = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/loans/$loanId/history" -Headers @{'x-admin-api-key' = $adminApiKey}
        Write-Host "   Current Status: $($history.currentStatus)" -ForegroundColor Cyan
        Write-Host "   History entries: $($history.history.Length)"
        if ($history.history.Length -gt 0) {
            Write-Host "   Latest change:" -ForegroundColor Cyan
            $latest = $history.history[$history.history.Length - 1]
            Write-Host "     - Status: $($latest.status)"
            Write-Host "     - Changed At: $($latest.changedAt)"
            Write-Host "     - Notes: $($latest.notes)"
        }
    } catch {
        Write-Host "   ✗ Failed to get history: $_" -ForegroundColor Red
    }
    
} else {
    Write-Host '   No applications found' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Test completed!' -ForegroundColor Green
