# How to Get Your Twilio Phone Number

## For Trial Account:

1. Go to: https://console.twilio.com/phone-numbers/manage/buy-a-number
   
2. Or from the dashboard:
   - Click **Phone Numbers** in the left sidebar
   - Click **Buy a Number** or **Get a Free Number** (for trial)

3. Select a number:
   - Country: Choose based on your needs (US numbers are most versatile)
   - Capabilities: Make sure **SMS** is checked
   - Click **Search** to find available numbers

4. Choose and buy/claim your number

5. After getting your number, update your .env file:
   - Replace `+1234567890` with your actual Twilio number
   - Keep the + and country code (e.g., +1 for US)

## For Trial Accounts - IMPORTANT:

With a trial account, you can only send SMS to **verified phone numbers**.

To verify phone numbers for testing:
1. Go to: https://console.twilio.com/phone-numbers/verified
2. Click **Add a Number**
3. Enter the phone number you want to test with (e.g., your personal phone)
4. Complete the verification process

## Quick Links:
- Buy a Number: https://console.twilio.com/phone-numbers/manage/buy-a-number
- Verified Numbers: https://console.twilio.com/phone-numbers/verified
- Active Numbers: https://console.twilio.com/phone-numbers/manage/active-numbers
