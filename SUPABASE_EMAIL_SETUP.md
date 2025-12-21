# Supabase Email Configuration Guide

If you're not receiving magic link emails, follow these steps to configure email in Supabase:

## Quick Fix: Enable Email Provider

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider
4. Make sure it's **Enabled**
5. Click **Save**

## Configure Email Settings

### Option 1: Use Supabase's Built-in Email (Limited)

Supabase provides a basic email service, but it has limitations:
- Only works for development/testing
- May have rate limits
- Emails might go to spam

### Option 2: Configure Custom SMTP (Recommended for Production)

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Click on **SMTP Settings**
3. Configure your SMTP provider:

**For Gmail:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: (use App Password, not regular password)
Sender email: your-email@gmail.com
Sender name: GetTranscript
```

**For SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: your-sendgrid-api-key
Sender email: your-verified-sender@yourdomain.com
```

**For Mailgun:**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: your-mailgun-username
SMTP Password: your-mailgun-password
Sender email: your-verified-sender@yourdomain.com
```

4. Click **Save**

## Customize Email Template

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Customize the email content
4. Make sure the redirect URL is correct: `{{ .ConfirmationURL }}`
5. Click **Save**

## Test Email Configuration

1. Go to **Authentication** → **Users**
2. Try sending a test email
3. Check your email inbox (and spam folder)

## Troubleshooting

### Emails not sending
- Check SMTP credentials are correct
- Verify sender email is verified with your SMTP provider
- Check Supabase logs for errors

### Emails going to spam
- Use a verified domain for sender email
- Configure SPF/DKIM records for your domain
- Use a reputable SMTP provider (SendGrid, Mailgun, etc.)

### Rate limiting
- Supabase free tier has email rate limits
- Consider upgrading or using custom SMTP

## Development Workaround

For local development, you can check the Supabase logs:
1. Go to **Logs** → **Auth Logs** in Supabase Dashboard
2. Look for the magic link URL
3. Copy and paste it directly in your browser

## Alternative: Use Google OAuth

Instead of magic links, you can use Google OAuth which doesn't require email:
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials
4. Users can sign in with Google instead
