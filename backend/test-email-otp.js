const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_PHONE_NUMBER = process.argv[2] || '0706871283';
const TEST_EMAIL = process.argv[3] || 'test@example.com';

console.log('=== Email OTP Flow Test ===\n');

async function testEmailOtpFlow() {
  try {
    // Step 1: Send OTP
    console.log('1. Sending OTP');
    console.log(`   Phone: ${TEST_PHONE_NUMBER}`);
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   POST ${API_BASE_URL}/api/auth/send-otp`);
    
    const sendOtpResponse = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
      phoneNumber: TEST_PHONE_NUMBER,
      email: TEST_EMAIL
    });
    
    console.log('   ✓ Response:', sendOtpResponse.data);
    console.log(`   ✓ OTP expires in ${sendOtpResponse.data.expiresIn} seconds\n`);
    
    console.log('2. Check your EMAIL for the OTP code');
    console.log(`   Email sent to: ${TEST_EMAIL}`);
    console.log('   In development mode, also check backend console for OTP\n');
    
    // Wait for user input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const otpCode = await new Promise((resolve) => {
      readline.question('   Enter the OTP code from your email: ', (answer) => {
        readline.close();
        resolve(answer);
      });
    });
    
    // Step 2: Verify OTP
    console.log('\n3. Verifying OTP:', otpCode);
    console.log(`   POST ${API_BASE_URL}/api/auth/login`);
    
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      phoneNumber: TEST_PHONE_NUMBER,
      email: TEST_EMAIL,
      otp: otpCode
    });
    
    console.log('   ✓ Login successful!');
    console.log('   ✓ Access token:', loginResponse.data.accessToken.substring(0, 50) + '...');
    console.log('   ✓ Token expires in:', loginResponse.data.expiresIn, 'seconds');
    console.log('   ✓ Phone number:', loginResponse.data.phoneNumber);
    
    console.log('\n✅ Email OTP flow test completed successfully!');
    
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
      console.error('\n💡 Hint: Check if email configuration is correct in .env file');
      console.error('   - Set EMAIL_USER and EMAIL_PASS in .env');
      console.error('   - For Gmail, use an App Password (not your regular password)');
      console.error('   - Enable 2FA and create App Password at: https://myaccount.google.com/apppasswords');
    }
  }
}

// Show usage if needed
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log('Usage: node test-email-otp.js [phoneNumber] [email]');
  console.log('Example: node test-email-otp.js 0706871283 myemail@gmail.com');
  process.exit(0);
}

// Run the test
console.log('Starting Email OTP flow test...\n');
testEmailOtpFlow().catch(console.error);
