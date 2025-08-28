# API Test Examples

## Base URL
```
http://localhost:3000
```

## Swagger Documentation
```
http://localhost:3000/api-docs
```

## Get Loan Rates
```powershell
# PowerShell
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/rates' -Method GET | ConvertTo-Json -Depth 10
```

## Step 1: Create Loan Application (Updated with loan amount and term)
```powershell
# PowerShell
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/step1' -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{
    "fullName": "Nguyen Van A",
    "phoneNumber": "0333351725",
    "loanAmount": 2500000,
    "loanTerm": 30
  }' | ConvertTo-Json

# Using curl (Git Bash or WSL)
curl -X POST "http://localhost:3000/api/loan/step1" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyen Van A",
    "phoneNumber": "0333351725",
    "loanAmount": 2500000,
    "loanTerm": 30
  }'
```

Expected Response:
```json
{
  "loanApplicationId": "loan_xxxxxxxxxxxxx",
  "message": "Step 1 completed successfully",
  "loanAmount": 2500000,
  "loanTerm": 30,
  "dailyPayment": 102000
}
```

## Step 2: Update Personal Information
```powershell
# PowerShell
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/step2' -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{
    "loanApplicationId": "loan_xxxxxxxxxxxxx",
    "gender": "MALE",
    "dob": "1990-01-01",
    "identityNumber": "123456789012",
    "phoneBrand": "iPhone 14",
    "location": "Ho Chi Minh City"
  }' | ConvertTo-Json
```

## Step 3: Complete Application
```powershell
# PowerShell
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/step3' -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{
    "loanApplicationId": "loan_xxxxxxxxxxxxx",
    "relativePhone": "0987654321",
    "companyPhone": "0281234567",
    "bankAccount": "1234567890",
    "bankName": "Vietcombank"
  }' | ConvertTo-Json
```

## Get All Applications
```powershell
# PowerShell
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/applications' -Method GET | ConvertTo-Json -Depth 10

# With query parameters
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/applications?page=1&limit=10&status=PENDING' -Method GET | ConvertTo-Json -Depth 10
```

## Get Single Application
```powershell
# PowerShell (using MongoDB _id)
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/applications/{mongodb_id}' -Method GET | ConvertTo-Json
```

## Update Application Status
```powershell
# PowerShell
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/applications/{mongodb_id}' -Method PATCH `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{
    "status": "APPROVED",
    "notes": "Application approved after verification"
  }' | ConvertTo-Json
```

## Notes
- Replace `loan_xxxxxxxxxxxxx` with the actual loan application ID from step 1
- Replace `{mongodb_id}` with the actual MongoDB document ID (_id field)
- The phone number in step 1 must be unique for PENDING applications
- Steps must be completed in order (1 → 2 → 3)
