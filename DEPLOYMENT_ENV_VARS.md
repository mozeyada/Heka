# Production Environment Variables Guide

This document lists all environment variables needed for production deployment.

## Backend Environment Variables

### Required Variables

```bash
# Application
ENVIRONMENT=production
DEBUG=false

# MongoDB (MongoDB Atlas)
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/heka_db
MONGODB_DB_NAME=heka_db

# Security
SECRET_KEY=<generate-with-python-secrets-token_urlsafe-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (Frontend URL)
ALLOWED_ORIGINS=https://heka.app,https://www.heka.app

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Email (SMTP)
EMAIL_FROM=noreply@heka.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=https://heka.app
```

### Optional Variables

```bash
# Monitoring
SENTRY_DSN=https://...@sentry.io/...

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Gemini (beta testing)
GEMINI_API_KEY=...

# Redis (if using Redis)
REDIS_URL=redis://...
```

## Frontend Environment Variables

```bash
# API URL
NEXT_PUBLIC_API_URL=https://api.heka.app

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-...
```

## Generating SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## MongoDB Atlas Setup

1. Create cluster on MongoDB Atlas
2. Create database user with read/write permissions
3. Whitelist deployment IPs (or 0.0.0.0/0 for Railway/Vercel)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/heka_db`
5. Enable SSL/TLS (automatic with mongodb+srv://)

## Railway Deployment

1. Connect GitHub repository
2. Select `backend` directory
3. Set environment variables in Railway dashboard
4. Deploy automatically on push to main

## Vercel Deployment

1. Import GitHub repository
2. Select `frontend` directory
3. Framework: Next.js (auto-detected)
4. Set environment variables in Vercel dashboard
5. Deploy automatically on push to main


