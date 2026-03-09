import nodemailer from 'nodemailer';
import { db, schema } from '../db/db.js';
import { eq } from 'drizzle-orm';
import 'dotenv/config'; 

// Create transporter using Manual SMTP for better compatibility
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Helps with local network/proxy issues
    }
  });
};

// Send email notification
export const sendEmailNotification = async (userId, notification) => {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user || !user.email) {
      console.log(`User ${userId} not found or no email address`);
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"FinSight" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `FinSight: ${notification.type === 'reminder' ? 'Reminder' : 'Notification'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FinSight</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">Your Financial Assistant</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">
              ${notification.type === 'reminder' ? '🔔 Reminder' : '📢 Notification'}
            </h2>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin: 0;">
                ${notification.message}
              </p>
            </div>
            <div style="margin-top: 30px; text-align: center;">
              <a href="http://localhost:3000/dashboard" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View in FinSight
              </a>
            </div>
          </div>
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">This is an automated message. Please do not reply.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    console.log('Attempting to connect with user:', process.env.EMAIL_USER);
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Detailed Config Error:', error);
    return false;
  }
};