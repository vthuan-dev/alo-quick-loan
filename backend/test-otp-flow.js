// Test OTP Authentication Flow
// This script demonstrates how the OTP system works

const API_BASE = 'http://localhost:3000';

async function testOtpFlow() {
    console.log('=== Testing OTP Authentication Flow ===\n');
    
    // Test phone number
    const phoneNumber = '0912345678';
    console.log(`1. Testing with phone number: ${phoneNumber}`);
    
    try {
        // Step 1: Send OTP
        console.log('\n2. Sending OTP request...');
        const sendOtpResponse = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber })
        });
        
        const sendOtpData = await sendOtpResponse.json();
        
        if (!sendOtpResponse.ok) {
            console.error('❌ Failed to send OTP:', sendOtpData);
            return;
        }
        
        console.log('✅ OTP sent successfully!');
        console.log('Response:', sendOtpData);
        console.log('\n⚠️  IMPORTANT: Check your backend console for the OTP code!');
        console.log('Look for a line like: [SmsService] OTP for ' + phoneNumber + ': XXXX\n');
        
        // Wait for user to input OTP
        console.log('Enter the OTP code from backend console to test verification:');
        console.log('(For testing, you would enter the actual OTP here)\n');
        
        // Example verification (you need to use the actual OTP from console)
        const exampleOtp = '1234'; // Replace with actual OTP from console
        console.log(`3. Example: Verifying with OTP: ${exampleOtp}`);
        
        const verifyResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber, otp: exampleOtp })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (!verifyResponse.ok) {
            console.error('❌ Failed to verify OTP:', verifyData);
            console.log('\nThis is expected if you didn\'t use the actual OTP from console.');
            console.log('The OTP is randomly generated each time.');
        } else {
            console.log('✅ Login successful!');
            console.log('JWT Token:', verifyData.accessToken);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    console.log('\n=== OTP Flow Explanation ===');
    console.log('1. When you send OTP, backend generates a random 4-digit code');
    console.log('2. In development, this code is logged to console');
    console.log('3. In production, it would be sent via SMS');
    console.log('4. The OTP expires after 5 minutes');
    console.log('5. You have maximum 3 attempts to enter correct OTP');
}

// Check if backend is running
fetch(`${API_BASE}/api-docs`)
    .then(() => {
        console.log('✅ Backend is running\n');
        testOtpFlow();
    })
    .catch(() => {
        console.error('❌ Backend is not running. Start it with: npm run start:dev');
    });
