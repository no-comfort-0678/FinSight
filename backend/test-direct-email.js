import { sendEmailNotification } from './services/email.service.js';

// Test email sending directly without database
const testDirectEmail = async () => {
  try {
    console.log('📧 Testing direct email sending...');
    
    // Create a mock notification object
    const mockNotification = {
      id: 999,
      userId: 1,
      message: 'Test email from FinSight - Email System Working!',
      type: 'reminder',
      createdAt: new Date()
    };
    
    // Create a mock user object to simulate database lookup
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'aryanbokolia34@gmail.com' // Using your email for testing
    };
    
    // Temporarily override the database lookup for this test
    const originalDb = await import('./db/db.js');
    const originalSelect = originalDb.db.select;
    
    // Mock the database to return our test user
    originalDb.db.select = () => ({
      from: () => ({
        where: () => Promise.resolve([mockUser])
      })
    });
    
    // Test the email sending
    const result = await sendEmailNotification(1, mockNotification);
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('🎉 Email notification system is WORKING!');
    } else {
      console.log('❌ Email failed to send');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testDirectEmail();
