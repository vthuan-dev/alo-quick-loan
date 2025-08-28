// Development-only script to test OTP flow without actual SMS
// This simulates the OTP process by showing the code in console

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';
const TEST_PHONE_NUMBER = process.argv[2] || '0706871283';

console.log('=== Development OTP Test (No SMS) ===\n');
console.log('⚠️  This test works in development mode where OTP is logged to console');
console.log('⚠️  For production SMS testing, you need to verify your phone number with Twilio\n');

async function testOtpFlow() {
  try {
    // Step 1: Send OTP
    console.log('1. Attempting to send OTP to:', TEST_PHONE_NUMBER);
    console.log('   POST', API_BASE_URL + '/api/auth/send-otp');
    
    try {
      const sendOtpResponse = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        phoneNumber: TEST_PHONE_NUMBER
      });
      
      console.log('   ✓ OTP request accepted');
      console.log('   ✓ OTP expires in', sendOtpResponse.data.expiresIn, 'seconds\n');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ⚠️  SMS sending failed (expected with unverified number)');
        console.log('   ⚠️  Check your backend console for the OTP code (development mode)\n');
      } else {
        throw error;
      }
    }
    
    // In development mode, the OTP should be logged in the backend console
    console.log('2. Check your BACKEND CONSOLE for the OTP code');
    console.log('   Look for a log message like: "Generated OTP: 123456"');
    console.log('   This only works if your backend is in development mode\n');
    
    // Wait for user input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const otpCode = await new Promise((resolve) => {
      readline.question('   Enter the OTP code from backend console: ', (answer) => {
        readline.close();
        resolve(answer);
      });
    });
    
    // Step 2: Verify OTP
    console.log('\n3. Verifying OTP:', otpCode);
    console.log('   POST', API_BASE_URL + '/api/auth/login');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      phoneNumber: TEST_PHONE_NUMBER,
      otp: otpCode
    });
    
    console.log('   ✓ Login successful!');
    console.log('   ✓ Access token:', loginResponse.data.accessToken.substring(0, 50) + '...');
    console.log('   ✓ Token expires in:', loginResponse.data.expiresIn, 'seconds');
    console.log('   ✓ Phone number:', loginResponse.data.phoneNumber);
    
    console.log('\n✅ OTP flow test completed successfully!');
    console.log('\n📝 Next steps for production:');
    console.log('   1. Verify your phone number with Twilio (try voice call option)');
    console.log('   2. Or upgrade to a paid Twilio account');
    console.log('   3. Or contact Twilio support for Vietnam-specific guidance');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response ? error.response.data : error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running on port 3000');
    }
  }
}

// Run the test
testOtpFlow().catch(console.error);
