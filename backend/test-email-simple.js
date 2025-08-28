require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...\n');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***hidden***' : 'NOT SET');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true, // Enable debug output
    logger: true // Enable logger
  });

  try {
    // Verify connection
    console.log('\nVerifying connection...');
    await transporter.verify();
    console.log('✓ Email configuration is correct!');
    
    // Try to send test email
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Email - ALO Quick Loan',
      text: 'This is a test email.',
      html: '<b>This is a test email.</b>'
    });
    
    console.log('✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.error('\nPossible issues:');
    console.error('1. Check if 2FA is enabled on your Gmail');
    console.error('2. Make sure you\'re using an App Password, not your regular password');
    console.error('3. Check if there\'s a security alert in your Gmail');
  }
}

testEmail();
