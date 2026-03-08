import cron from 'node-cron';
import { db, schema } from '../db/db.js';
import { eq, and, lt, or } from 'drizzle-orm';
import { sendEmailNotification } from './email.service.js';

export const startReminderScheduler = () => {
  // Run every minute to check for due reminders
  cron.schedule('* * * * *', async () => {
    console.log('Checking for due reminders...');
    
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Find reminders that are due and not yet notified
      const dueReminders = await db
        .select()
        .from(schema.reminders)
        .where(
          and(
            eq(schema.reminders.notified, false),
            or(
              and(
                eq(schema.reminders.reminderDate, currentDate),
                lt(schema.reminders.reminderTime, currentTime)
              ),
              lt(schema.reminders.reminderDate, currentDate)
            )
          )
        );

      console.log(`Found ${dueReminders.length} due reminders`);

      for (const reminder of dueReminders) {
        // Create notification for the reminder
        const [notification] = await db.insert(schema.notifications).values({
          userId: reminder.userId,
          message: `Reminder: ${reminder.title}${reminder.amount ? ` - Amount: $${reminder.amount}` : ''}`,
          type: 'reminder'
        }).returning();

        // Send email notification
        try {
          await sendEmailNotification(reminder.userId, notification);
        } catch (emailError) {
          console.error('Failed to send email for reminder:', emailError);
          // Don't fail the reminder processing if email fails
        }

        // Mark reminder as notified
        await db
          .update(schema.reminders)
          .set({ notified: true })
          .where(eq(schema.reminders.id, reminder.id));

        console.log(`Processed reminder ${reminder.id} for user ${reminder.userId}`);
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });

  console.log('Reminder scheduler started - checking every minute');
};
