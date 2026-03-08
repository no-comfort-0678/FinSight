import { sendEmailNotification } from './services/email.service.js';
import { db, schema } from './db/db.js';
import { eq } from 'drizzle-orm';

// Test creating a notification and sending email
const testNotificationEmail = async () => {
  try {
    console.log('Testing notification email sending...');
    
    // Get a test user (first user in database)
    const [testUser] = await db.select().from(schema.users).limit(1);
    
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }
    
    if (!testUser.email) {
      console.log(`❌ User ${testUser.username} has no email address`);
      return;
    }
    
    console.log(`✅ Found user: ${testUser.username} with email: ${testUser.email}`);
    
    // Create a test notification
    const [testNotification] = await db.insert(schema.notifications).values({
      userId: testUser.id,
      message: 'Test email notification from FinSight',
      type: 'reminder'
    }).returning();
    
    console.log(`✅ Created test notification: ${testNotification.id}`);
    
    // Send email
    const emailSent = await sendEmailNotification(testUser.id, testNotification);
    
    if (emailSent) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed to send');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testNotificationEmail();
