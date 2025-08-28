# Email OTP Setup Guide

## Quick Setup for Gmail

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Click on "2-Step Verification"
   - Follow the steps to enable it

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" from the dropdown
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

3. **Update your .env file**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=your16charapppass
   EMAIL_FROM=youremail@gmail.com
   ```

## Testing Without Email Setup

For now, you can test in development mode where the OTP is logged to console:

1. Run: `node test-email-otp.js 0706871283 test@example.com`
2. The OTP will be displayed in the backend console
3. Enter that OTP when prompted

## Alternative Email Providers

### Mailtrap (For Testing)
Free email testing service - emails don't actually send but you can view them:
- Sign up at https://mailtrap.io
- Get SMTP credentials from your inbox settings
- Update .env with Mailtrap credentials

### SendGrid (Production Ready)
- Sign up at https://sendgrid.com
- Get API key
- Update email service to use SendGrid API

### Local Testing (No Email Required)
The backend logs OTP in development mode, so you can see it in console!
