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

      // Find reminders that are due and not yet completed
      const dueReminders = await db
        .select()
        .from(schema.reminders)
        .where(
          and(
            eq(schema.reminders.isCompleted, false),
            lt(schema.reminders.remindAt, now)
          )
        );

      console.log(`Found ${dueReminders.length} due reminders`);

      for (const reminder of dueReminders) {
        // Create notification for the reminder
        const [notification] = await db.insert(schema.notifications).values({
          userId: reminder.userId,
          message: `Reminder: ${reminder.title}`,
          type: 'reminder'
        }).returning();

        // Send email notification
        try {
          await sendEmailNotification(reminder.userId, notification);
        } catch (emailError) {
          console.error('Failed to send email for reminder:', emailError);
        }

        // Mark reminder as completed (or notified if we add that column later)
        await db
          .update(schema.reminders)
          .set({ isCompleted: true })
          .where(eq(schema.reminders.id, reminder.id));

        console.log(`Processed reminder ${reminder.id} for user ${reminder.userId}`);
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });

  console.log('Reminder scheduler started - checking every minute');
};
