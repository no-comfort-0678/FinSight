# Email Configuration

## Required Environment Variables

Add these to your `.env` file:

```env
# Gmail Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-app-password-here

# Database (already exists)
DATABASE_URL=your-database-url-here
```

## Setup Instructions

### 1. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for the app
   - Select "Other (Custom name)" and name it "FinSight"
   - Copy the 16-character password (this is your EMAIL_PASS)

### 2. Update .env File

```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=the-16-character-app-password
```

## Testing Email Functionality

### Test the email configuration:

```bash
cd backend
node -e "
import('./services/email.service.js').then(({ testEmailConfig }) => {
  testEmailConfig().then(result => {
    console.log('Email test result:', result);
  });
});
"
```

### Create a test notification:

```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Test email notification",
    "type": "reminder"
  }'
```

## Production Considerations

### For production, consider using:

1. **SendGrid** - More reliable for bulk emails
2. **Amazon SES** - Cost-effective for high volume
3. **Mailgun** - Good transactional email service

### SendGrid Setup (Alternative):

```bash
npm install @sendgrid/mail
```

```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

## Features Implemented

✅ **Automatic email sending** for all notifications
✅ **Beautiful HTML email templates** with FinSight branding
✅ **Reminder scheduler integration** - emails sent when reminders are due
✅ **Error handling** - email failures don't break the app
✅ **User email lookup** - automatically gets user email from database

## Email Template Features

- Professional FinSight branding
- Responsive design
- Clear notification content
- Call-to-action button to view in app
- Proper headers and footers
