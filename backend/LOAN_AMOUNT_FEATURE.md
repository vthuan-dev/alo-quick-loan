# Loan Amount and Term Feature Implementation

## Overview
Added loan amount selection and repayment term features to the loan application process. Users can now select:
- Loan amount: 500,000 - 10,000,000 VND (in increments of 500,000)
- Repayment term: 30 or 40 days
- View daily payment amount based on their selection

## Changes Made

### 1. Updated Step 1 DTO (`src/modules/loan/dto/step1.dto.ts`)
- Added `loanAmount` field (number, 500,000 - 10,000,000 VND)
- Added `loanTerm` field (number, 30 or 40 days)
- Updated response DTO to include loan details and daily payment

### 2. Updated LoanApplication Schema (`src/modules/loan/schemas/loan-application.schema.ts`)
- Added `loanAmount` field (required)
- Added `loanTerm` field (required, enum: [30, 40])
- Added `dailyPayment` field (required)
- Added `totalRepayment` field (required)

### 3. Created Loan Calculator Utility (`src/modules/loan/utils/loan-calculator.ts`)
- Implements payment rate tables for 30 and 40 day terms
- `calculateLoan()` method computes daily payment, total repayment, and interest
- Provides methods to get available amounts and terms

### 4. Updated Loan Service (`src/modules/loan/loan.service.ts`)
- Modified `step1()` to calculate loan details using LoanCalculator
- Saves loan amount, term, daily payment, and total repayment
- Returns calculated daily payment in response

### 5. Added Rates Endpoint (`src/modules/loan/loan.controller.ts`)
- New GET `/api/loan/rates` endpoint
- Returns available loan amounts, terms, and complete rate table

## API Usage

### Get Loan Rates
```bash
GET /api/loan/rates
```

Response:
```json
{
  "availableAmounts": [500000, 1000000, ..., 10000000],
  "availableTerms": [30, 40],
  "rates": {
    "30": [
      { "amount": 500000, "dailyPayment": 20500 },
      { "amount": 1000000, "dailyPayment": 41000 },
      ...
    ],
    "40": [
      { "amount": 500000, "dailyPayment": 15375 },
      { "amount": 1000000, "dailyPayment": 30750 },
      ...
    ]
  }
}
```

### Create Loan Application (Step 1)
```bash
POST /api/loan/step1
{
  "fullName": "Nguyen Van A",
  "phoneNumber": "0333351725",
  "loanAmount": 2500000,
  "loanTerm": 30
}
```

Response:
```json
{
  "loanApplicationId": "loan_xxxxxxxxxxxxx",
  "message": "Step 1 completed successfully",
  "loanAmount": 2500000,
  "loanTerm": 30,
  "dailyPayment": 102000
}
```

## Frontend Implementation Notes

The frontend should:
1. Fetch rates from `/api/loan/rates` to display options
2. Implement a slider or select input for loan amount (500k - 10M VND)
3. Implement radio buttons or toggle for term selection (30/40 days)
4. Display calculated daily payment dynamically as user changes selections
5. Show total repayment amount (dailyPayment × loanTerm)
6. Include these values when submitting step 1 form

## Payment Rate Tables

### 30-Day Term
- 1,000,000 VND = 41,000 VND/day (23% total interest)
- 2,500,000 VND = 102,000 VND/day (22.4% total interest)
- 5,000,000 VND = 205,000 VND/day (23% total interest)
- 10,000,000 VND = 410,000 VND/day (23% total interest)

### 40-Day Term
- 1,000,000 VND = 30,750 VND/day (23% total interest)
- 2,500,000 VND = 76,875 VND/day (23% total interest)
- 5,000,000 VND = 153,750 VND/day (23% total interest)
- 10,000,000 VND = 307,500 VND/day (23% total interest)

Note: Interest rates are approximately 23% for all amounts and terms.
