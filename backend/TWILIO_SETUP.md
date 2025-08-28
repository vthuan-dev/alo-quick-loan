# Twilio SMS Integration Setup

This guide explains how to set up Twilio for sending OTP SMS messages in the ALO Quick Loan application.

## Overview

The application now uses Twilio to send OTP (One-Time Password) messages for user authentication, replacing the previous Firebase phone authentication method.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com/)
2. A Twilio phone number capable of sending SMS

## Setup Instructions

### 1. Create a Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a new account or log in to your existing account
3. Complete the verification process

### 2. Get Your Twilio Credentials

1. From the Twilio Console dashboard, locate:
   - **Account SID**: Your unique account identifier
   - **Auth Token**: Your secret authentication token
   
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Purchase a phone number if you don't have one, or use your existing Twilio phone number

### 3. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number with country code
```

**Important**: 
- Keep your Auth Token secret and never commit it to version control
- The phone number must include the country code (e.g., +1 for US, +84 for Vietnam)

### 4. Phone Number Formatting

The system automatically formats phone numbers for Vietnam (+84):
- If a number starts with 0, it removes the 0 and adds +84
- If a number doesn't have a country code, it adds +84
- Example: `0912345678` becomes `+84912345678`

To support other countries, modify the `formatPhoneNumber` method in `twilio.service.ts`.

## Testing

### Development Mode

In development mode (`NODE_ENV=development`), if Twilio is not configured:
- The system will log OTP codes to the console
- SMS messages won't actually be sent
- This allows testing without Twilio credentials

### Production Mode

In production:
- Ensure all Twilio environment variables are properly set
- The system will send actual SMS messages
- Monitor your Twilio dashboard for usage and errors

### Test Script

Use the following curl command to test OTP sending:

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0912345678"}'

# Verify OTP (use the code from logs in dev mode or SMS in production)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0912345678", "otp": "1234"}'
```

## API Endpoints

### Send OTP
- **Endpoint**: `POST /api/auth/send-otp`
- **Body**: `{ "phoneNumber": "0912345678" }`
- **Response**: `{ "message": "OTP sent successfully", "expiresIn": 300 }`

### Verify OTP and Login
- **Endpoint**: `POST /api/auth/login`
- **Body**: `{ "phoneNumber": "0912345678", "otp": "1234" }`
- **Response**: `{ "accessToken": "jwt_token", "phoneNumber": "0912345678", "expiresIn": 86400 }`

## Troubleshooting

### Common Issues

1. **"Twilio is not enabled" warning**
   - Check that all three Twilio environment variables are set
   - Restart the application after setting environment variables

2. **SMS not received**
   - Verify the phone number format (must include country code)
   - Check Twilio console for error messages
   - Ensure your Twilio account has sufficient balance
   - Verify the destination country is enabled in your Twilio account

3. **Invalid phone number error**
   - Ensure the phone number is valid for the country
   - Check if the country is supported by your Twilio account

### Monitoring

- View SMS logs in Twilio Console: Monitor → Logs → Messages
- Check application logs for Twilio-related errors
- Monitor your Twilio account balance and usage

## Cost Considerations

- Twilio charges per SMS sent
- Rates vary by destination country
- Set up usage triggers in Twilio Console to avoid unexpected charges
- Consider implementing rate limiting to prevent abuse

## Security Best Practices

1. Never expose your Twilio Auth Token
2. Use environment variables for all sensitive configuration
3. Implement rate limiting on OTP endpoints
4. Log failed OTP attempts for security monitoring
5. Consider implementing CAPTCHA for additional protection
6. Set up webhook authentication if using Twilio webhooks

## Migration from Firebase

The application previously used Firebase for phone authentication. Key differences:

1. **Backend-controlled**: OTP generation and validation now happen on the backend
2. **Customizable**: Full control over OTP format, length, and expiry
3. **Database storage**: OTPs are stored in MongoDB with expiry times
4. **SMS content**: Customizable SMS message content
5. **Cost structure**: Pay-per-SMS model vs Firebase's free tier limits
