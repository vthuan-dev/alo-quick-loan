# Firebase Phone Authentication Setup Guide

This guide will help you set up Firebase Phone Authentication for the ALO Quick Loan application.

## Table of Contents
1. [Overview](#overview)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Security Considerations](#security-considerations)

## Overview

The application now supports two authentication methods:
1. **Custom OTP System** - The original implementation using backend-generated OTPs
2. **Firebase Phone Authentication** - A more robust solution using Google's Firebase

Firebase Phone Authentication provides:
- Better security with built-in fraud prevention
- SMS delivery across multiple regions
- Automatic SMS rate limiting
- reCAPTCHA verification for web clients
- Support for both SMS and voice call verification

## Firebase Project Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

### Step 2: Enable Phone Authentication

1. In Firebase Console, navigate to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. Toggle **Enable** and click **Save**

### Step 3: Configure Test Phone Numbers (Development)

1. In the Phone authentication settings, scroll to "Phone numbers for testing"
2. Add test phone numbers (e.g., `+84123456789`) with verification codes (e.g., `123456`)
3. These numbers won't receive actual SMS but can be used for development

### Step 4: Get Service Account Credentials

1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Save the JSON file securely (DO NOT commit to version control)

## Backend Configuration

### Option 1: Using Service Account File (Recommended for Development)

1. Place your service account JSON file in a secure location
2. Update `.env` file:
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Option 2: Using Environment Variables (Recommended for Production)

1. Extract values from your service account JSON file
2. Update `.env` file:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

**Note:** Make sure to properly escape the private key newlines with `\n`.

## Frontend Integration

### Web Application Setup

1. Install Firebase SDK:
```bash
npm install firebase
```

2. Initialize Firebase in your frontend:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

3. Implement phone authentication:
```javascript
// Set up invisible reCAPTCHA
window.recaptchaVerifier = new RecaptchaVerifier('sign-in-button', {
  'size': 'invisible',
  'callback': (response) => {
    // reCAPTCHA solved, allow signInWithPhoneNumber.
    onSignInSubmit();
  }
}, auth);

// Send verification code
async function sendVerificationCode(phoneNumber) {
  const appVerifier = window.recaptchaVerifier;
  
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    // Show OTP input UI
  } catch (error) {
    console.error('Error during signInWithPhoneNumber', error);
  }
}

// Verify OTP
async function verifyOTP(code) {
  try {
    const result = await window.confirmationResult.confirm(code);
    const user = result.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    // Exchange Firebase token for API JWT token
    const response = await fetch('http://localhost:3000/api/auth/firebase/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    const data = await response.json();
    // Store the JWT token for API calls
    localStorage.setItem('accessToken', data.accessToken);
    
  } catch (error) {
    console.error('Invalid verification code', error);
  }
}
```

### Mobile Application Setup

For React Native or Flutter applications, refer to the respective Firebase SDK documentation:
- [React Native Firebase](https://rnfirebase.io/auth/phone-auth)
- [FlutterFire](https://firebase.flutter.dev/docs/auth/phone)

## Testing

### Testing with Test Phone Numbers

1. Use the test phone numbers configured in Firebase Console
2. These numbers work without sending actual SMS
3. Example:
   - Phone: `+84123456789`
   - OTP: `123456`

### Testing the API

1. First, complete phone verification on the frontend
2. Get the Firebase ID token
3. Exchange it for an API JWT token:

```bash
curl -X POST http://localhost:3000/api/auth/firebase/verify \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your-firebase-id-token"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "phoneNumber": "+84123456789",
  "uid": "firebase-user-uid",
  "expiresIn": 86400
}
```

4. Use the JWT token for authenticated API calls:
```bash
curl -X GET http://localhost:3000/api/client/loans \
  -H "Authorization: Bearer your-jwt-token"
```

## Security Considerations

1. **Never expose service account credentials**
   - Keep the service account JSON file secure
   - Use environment variables in production
   - Never commit credentials to version control

2. **Enable App Check** (Optional but recommended)
   - Provides additional security against abuse
   - Verifies requests come from your app

3. **Configure authorized domains**
   - In Firebase Console → Authentication → Settings
   - Add only your production domains

4. **Monitor usage**
   - Firebase Console provides usage statistics
   - Set up alerts for unusual activity

5. **Rate limiting**
   - Firebase automatically rate-limits SMS sending
   - Implement additional rate limiting in your backend if needed

## Troubleshooting

### Common Issues

1. **"Firebase configuration is missing"**
   - Ensure environment variables are properly set
   - Check if service account file path is correct

2. **"auth/invalid-phone-number"**
   - Ensure phone numbers include country code (e.g., +84)
   - Verify the number format is correct

3. **"auth/too-many-requests"**
   - Firebase rate limiting triggered
   - Wait before retrying or use test numbers

4. **CORS errors**
   - Add your frontend URL to Firebase authorized domains
   - Configure CORS in your backend

### Support

For additional help:
- [Firebase Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Support](https://firebase.google.com/support)
