# Admin API Guide

## Overview
The admin API provides comprehensive loan application management features including status updates, bulk operations, dashboard statistics, and export functionality.

## Authentication
All admin endpoints require the `x-admin-api-key` header:
```
x-admin-api-key: alo-admin-secret-key-2024
```

## Base URL
```
http://localhost:3000/api/admin/loans
```

## Admin Features

### 1. Dashboard Statistics
Get comprehensive statistics about loan applications.

```bash
GET /api/admin/loans/dashboard/stats
```

Response includes:
- Total applications count
- Status distribution
- Today/week/month application counts
- Total and average loan amounts
- Daily application trends

### 2. Advanced Search & Filter
```bash
GET /api/admin/loans?page=1&limit=20&status=PENDING&startDate=2024-01-01
```

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (PENDING, CONTACTED, APPROVED, etc.)
- `phoneNumber`: Filter by phone number (partial match)
- `fullName`: Filter by name (partial match)
- `identityNumber`: Filter by ID number
- `isCompleted`: Filter by completion status (true/false)
- `startDate`: Filter by creation date (from)
- `endDate`: Filter by creation date (to)
- `minAmount`: Minimum loan amount
- `maxAmount`: Maximum loan amount
- `assignedTo`: Filter by assigned staff
- `loanTerm`: Filter by term (30 or 40)

### 3. Update Application Status
```bash
# Using loan application ID
PUT /api/admin/loans/loan_meu6mdhhvulwd

# Or using MongoDB ID
PUT /api/admin/loans/68af3075aa464209b86b5a65

Body:
{
  "status": "CONTACTED",
  "notes": "Called customer on 2024-01-15",
  "assignedTo": "John Doe"
}
```

Status options:
- `PENDING` - Initial status
- `CONTACTED` - Customer has been contacted
- `APPROVED` - Application approved
- `REJECTED` - Application rejected
- `IN_PROGRESS` - Loan in progress
- `COMPLETED` - Loan completed
- `CANCELLED` - Application cancelled

### 4. Bulk Status Update
```bash
POST /api/admin/loans/bulk/status
{
  "applicationIds": [
    "loan_meu6mdhhvulwd",
    "loan_abc123xyz456",
    "68af3075aa464209b86b5a65"
  ],
  "status": "CONTACTED",
  "notes": "Bulk contacted via SMS campaign"
}
```

Note: You can mix loan application IDs and MongoDB IDs in the same request.

### 5. Assign to Staff
```bash
# Using loan application ID
PATCH /api/admin/loans/loan_meu6mdhhvulwd/assign

# Or using MongoDB ID
PATCH /api/admin/loans/68af3075aa464209b86b5a65/assign

Body:
{
  "assignedTo": "sales@aloquickloan.com",
  "notes": "Assigned to senior sales rep"
}
```

### 6. Quick Search
```bash
GET /api/admin/loans/search?q=0912345678
```

Searches across:
- Loan application ID
- Full name
- Phone number
- Identity number

### 7. Export Applications
```bash
GET /api/admin/loans/export?format=csv&status=APPROVED&startDate=2024-01-01
```

Parameters:
- `format`: Export format (csv or excel)
- `status`: Filter by status
- `startDate`: Filter from date
- `endDate`: Filter to date

### 8. View Status History
```bash
# Using loan application ID
GET /api/admin/loans/loan_meu6mdhhvulwd/history

# Or using MongoDB ID
GET /api/admin/loans/68af3075aa464209b86b5a65/history
```

Returns complete status change history with timestamps and admin notes.

## Example API Calls

### PowerShell Examples

#### Get Dashboard Stats
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans/dashboard/stats' `
  -Headers @{'x-admin-api-key'='alo-admin-secret-key-2024'} | ConvertTo-Json -Depth 10
```

#### Update Status
```powershell
$body = @{
  status = "CONTACTED"
  notes = "Customer contacted via phone"
  assignedTo = "agent1@company.com"
} | ConvertTo-Json

# Using loan application ID (recommended)
Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans/loan_meu6mdhhvulwd' `
  -Method PUT `
  -Headers @{
    'x-admin-api-key'='alo-admin-secret-key-2024'
    'Content-Type'='application/json'
  } `
  -Body $body

# Or using MongoDB ID
Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans/68af3075aa464209b86b5a65' `
  -Method PUT `
  -Headers @{
    'x-admin-api-key'='alo-admin-secret-key-2024'
    'Content-Type'='application/json'
  } `
  -Body $body
```

#### Bulk Update
```powershell
$bulkUpdate = @{
  applicationIds = @("id1", "id2", "id3")
  status = "APPROVED"
  notes = "Approved after verification"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/loans/bulk/status' `
  -Method POST `
  -Headers @{
    'x-admin-api-key'='alo-admin-secret-key-2024'
    'Content-Type'='application/json'
  } `
  -Body $bulkUpdate
```

#### Advanced Search
```powershell
$params = @{
  page = 1
  limit = 50
  status = "PENDING"
  minAmount = 1000000
  maxAmount = 5000000
  startDate = "2024-01-01"
}

$query = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join '&'

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/loans?$query" `
  -Headers @{'x-admin-api-key'='alo-admin-secret-key-2024'} | ConvertTo-Json -Depth 10
```

## Status Workflow

Typical loan application workflow:
1. **PENDING** → Customer submits application
2. **CONTACTED** → Admin contacts customer
3. **APPROVED/REJECTED** → Decision made
4. **IN_PROGRESS** → Loan being processed (if approved)
5. **COMPLETED** → Loan fully repaid
6. **CANCELLED** → Application cancelled at any stage

## Security Notes

1. **API Key**: Store the admin API key securely. Never expose it in client-side code.
2. **HTTPS**: Always use HTTPS in production.
3. **IP Whitelisting**: Consider implementing IP whitelisting for admin endpoints.
4. **Audit Trail**: All status changes are logged with admin identifier and timestamp.

## Error Handling

Common error responses:
- `401 Unauthorized` - Missing or invalid API key
- `404 Not Found` - Application not found
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

## Rate Limiting

Admin endpoints have higher rate limits than public endpoints but are still subject to:
- 1000 requests per minute per API key
- Bulk operations count as single requests
