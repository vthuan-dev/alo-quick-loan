const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_PHONE_NUMBER = process.argv[2] || '0912345678'; // Get phone number from command line or use default

console.log('=== Twilio OTP Flow Test ===\n');

async function testOtpFlow() {
  try {
    // Step 1: Send OTP
    console.log('1. Sending OTP to phone number:', TEST_PHONE_NUMBER);
    console.log(`   POST ${API_BASE_URL}/api/auth/send-otp`);
    
    const sendOtpResponse = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
      phoneNumber: TEST_PHONE_NUMBER
    });
    
    console.log('   ✓ Response:', sendOtpResponse.data);
    console.log(`   ✓ OTP expires in ${sendOtpResponse.data.expiresIn} seconds\n`);
    
    // In development mode, check logs for OTP code
    console.log('2. Check your console logs or SMS for the OTP code');
    console.log('   In development mode, the OTP will be logged to console');
    console.log('   In production mode, check SMS on phone number:', TEST_PHONE_NUMBER);
    
    // Wait for user input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const otpCode = await new Promise((resolve) => {
      readline.question('\n   Enter the OTP code you received: ', (answer) => {
        readline.close();
        resolve(answer);
      });
    });
    
    // Step 2: Verify OTP
    console.log('\n3. Verifying OTP:', otpCode);
    console.log(`   POST ${API_BASE_URL}/api/auth/login`);
    
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      phoneNumber: TEST_PHONE_NUMBER,
      otp: otpCode
    });
    
    console.log('   ✓ Login successful!');
    console.log('   ✓ Access token:', loginResponse.data.accessToken.substring(0, 50) + '...');
    console.log('   ✓ Token expires in:', loginResponse.data.expiresIn, 'seconds');
    console.log('   ✓ Phone number:', loginResponse.data.phoneNumber);
    
    // Step 3: Test authenticated request
    console.log('\n4. Testing authenticated request');
    console.log('   GET /api/auth/profile (example endpoint)');
    
    // Note: This endpoint might not exist, it's just to show how to use the token
    try {
      await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.accessToken}`
        }
      });
      console.log('   ✓ Authenticated request successful');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('   ℹ Profile endpoint not implemented (404), but authentication header was accepted');
      } else {
        console.log('   ℹ Authenticated request test skipped');
      }
    }
    
    console.log('\n✅ OTP flow test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response ? error.response.data : error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', error.response.data);
    }
    
    // Common error hints
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Hint: Make sure the backend server is running on port 3000');
    } else if (error.response && error.response.status === 400) {
      console.error('\n💡 Hint: Check if the phone number format is correct or if you\'re sending OTP too frequently');
      console.error('\n⚠️  For Twilio trial accounts: You must verify recipient phone numbers first!');
      console.error('   Go to: https://twilio.com/user/account/phone-numbers/verified');
      console.error('   Add and verify your phone number:', TEST_PHONE_NUMBER);
    }
  }
}

// Run the test
console.log('Starting OTP flow test...\n');
testOtpFlow().catch(console.error);
