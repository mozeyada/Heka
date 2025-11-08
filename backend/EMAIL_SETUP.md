# Email Setup Guide - Development vs Production

## Current Status: Development Mode

**Right now:** Emails are logged to console (not actually sent)

You'll see in backend logs:
```
INVITATION EMAIL (DEV MODE):
  To: partner@example.com
  From: Your Name
  Invitation Link: http://localhost:3000/invite/TOKEN
```

## Email Options (No Domain Required)

### Option 1: Gmail SMTP (Free, No Domain Needed)

**Best for:** Development and MVP testing

1. **Create Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate app password for "Mail"
   - Copy the 16-character password

2. **Update `.env`:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

3. **Restart backend** - emails will now send!

**Limits:** 500 emails/day (free Gmail account)

---

### Option 2: SendGrid (Free Tier - 100 emails/day)

**Best for:** Production-ready without domain

1. **Sign up:** https://sendgrid.com
2. **Verify sender email** (no domain needed)
3. **Get API key**

4. **Update `.env`:**
   ```bash
   # Use SendGrid API instead of SMTP
   SENDGRID_API_KEY=your-api-key
   ```

**Note:** Requires updating `email_service.py` to use SendGrid API instead of SMTP.

---

### Option 3: Mailgun (Free Tier - 5,000 emails/month)

**Best for:** More emails, still no domain needed initially

1. **Sign up:** https://www.mailgun.com
2. **Use sandbox domain** (free, no verification needed)
3. **Get API credentials**

---

## Recommendation

**For MVP/Development:**
- Use **Gmail SMTP** - easiest setup, works immediately
- Update `.env` with Gmail credentials
- No domain needed

**For Production:**
- Use **SendGrid** or **Mailgun**
- Can start with verified email (no domain)
- Later add custom domain when ready

---

## Quick Gmail Setup (Recommended Now)

1. Enable 2FA on your Gmail account
2. Create app password: https://myaccount.google.com/apppasswords
3. Update backend `.env`:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char app password
   EMAIL_FROM=your-email@gmail.com
   ```
4. Restart backend
5. Test invitation - email will actually send!

---

**Current:** Logging emails (development mode)  
**Next:** Configure Gmail SMTP to actually send emails

