# OTP as Password Feature

## Overview
This feature implements a passwordless authentication system where users receive an OTP via email and use it as their password to login.

## New Endpoints

### 1. Request OTP
**POST** `/api/auth/request-otp`

Request Body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "OTP sent to your email",
  "email": "user@example.com",
  "expiresIn": 300
}
```

### 2. Login with OTP
**POST** `/api/auth/login-with-otp`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "1234"  // The OTP received via email
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@example.com",
  "expiresIn": 86400
}
```

## How It Works

1. **User requests OTP**: User provides only their email address
2. **OTP is generated**: A 4-digit OTP is generated and stored in database
3. **Email is sent**: OTP is sent to the user's email address
4. **User logs in**: User enters their email and the OTP as password
5. **Token is issued**: Upon successful verification, a JWT token is returned

## Security Features

- **Rate limiting**: 60 seconds between OTP requests
- **OTP expiry**: 5 minutes validity
- **Max attempts**: 3 attempts before OTP is invalidated
- **One-time use**: OTP is invalidated after successful use
- **Email verification**: Only verified email addresses can receive OTP

## Testing

Run the test script:
```bash
node test-otp-password.js vthuan.dev@gmail.com
```

## Benefits

1. **No passwords to remember**: Users don't need to create or remember passwords
2. **Enhanced security**: OTPs are time-limited and single-use
3. **Simple UX**: Only email required for authentication
4. **Email verification**: Ensures user owns the email address

## Configuration

Email settings in `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Frontend Integration

Example login form:
```html
<!-- Step 1: Request OTP -->
<input type="email" id="email" placeholder="Enter your email">
<button onclick="requestOtp()">Send OTP</button>

<!-- Step 2: Login with OTP -->
<input type="text" id="otp" placeholder="Enter OTP from email">
<button onclick="loginWithOtp()">Login</button>
```

JavaScript:
```javascript
async function requestOtp() {
  const email = document.getElementById('email').value;
  const response = await fetch('/api/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  alert(data.message);
}

async function loginWithOtp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('otp').value;
  const response = await fetch('/api/auth/login-with-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.accessToken) {
    localStorage.setItem('token', data.accessToken);
    // Redirect to dashboard
  }
}
```
