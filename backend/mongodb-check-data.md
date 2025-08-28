# How to Check Data in MongoDB Atlas

## Method 1: MongoDB Atlas Web Interface (Easiest)
1. Go to https://cloud.mongodb.com
2. Sign in to your account
3. Click on your cluster "loan"
4. Click "Browse Collections"
5. Navigate to: `alo_quick_loan` → `loanapplications`

## Method 2: Using API Endpoints
```powershell
# Get all applications
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/applications' -Method GET | ConvertTo-Json -Depth 10

# Get a specific application by ID
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/applications/68af3075aa464209b86b5a65' -Method GET | ConvertTo-Json
```

## Method 3: MongoDB Compass (GUI Tool)
1. Download from: https://www.mongodb.com/products/compass
2. Connection string: `mongodb+srv://thuanhero1:100103@loan.5zl1m5s.mongodb.net/alo_quick_loan`
3. Connect and browse visually

## Method 4: MongoDB Shell (mongosh)
```bash
# Install mongosh first (if not installed)
# Download from: https://www.mongodb.com/docs/mongodb-shell/install/

# Connect to your cluster
mongosh "mongodb+srv://thuanhero1:100103@loan.5zl1m5s.mongodb.net/alo_quick_loan"

# Once connected:
show dbs                          # List all databases
use alo_quick_loan               # Switch to your database
show collections                 # List all collections
db.loanapplications.find()       # Show all documents
db.loanapplications.findOne()    # Show one document
db.loanapplications.countDocuments() # Count documents
```

## Current Data in Database
As of now, you have 1 loan application saved:
- ID: `68af3075aa464209b86b5a65`
- Loan Application ID: `loan_meu6mdhhvulwd`
- Name: Nguyen Van A
- Phone: 0333351725
- Status: PENDING
- Completed: Yes (all 3 steps done)

## Quick Stats Query
```powershell
# Get counts by status
Invoke-RestMethod -Uri 'http://localhost:3000/api/loan/applications?limit=100' -Method GET | 
    Select-Object -ExpandProperty data | 
    Group-Object status | 
    Select-Object Name, Count
```
