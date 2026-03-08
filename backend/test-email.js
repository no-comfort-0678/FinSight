import 'dotenv/config'; 
import { testEmailConfig } from './services/email.service.js';

// Test email configuration
console.log('Testing email configuration...');
testEmailConfig().then(result => {
  if (result) {
    console.log('✅ Email configuration is valid!');
    console.log('📧 You can now send email notifications!');
  } else {
    console.log('❌ Email configuration failed.');
    console.log('1. Ensure your .env has EMAIL_PASS in double quotes.');
    console.log('2. Try using a mobile hotspot if on campus Wi-Fi.');
  }
}).catch(error => {
  console.error('❌ Email test failed:', error);
});