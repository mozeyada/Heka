# Deployment Guide - Heka

**Last Updated:** November 6, 2025

---

## Overview

This guide covers deploying Heka to production using:
- **Frontend:** Vercel (Next.js)
- **Backend:** Railway (FastAPI)
- **Database:** MongoDB Atlas

---

## Prerequisites

- GitHub repository connected
- MongoDB Atlas account and cluster
- Vercel account (free tier available)
- Railway account (free tier available)
- Domain name (optional, can use Vercel/Railway subdomains)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (M0 free tier is fine for MVP)
3. Choose region closest to your users (Australia recommended)

### 1.2 Configure Security
1. **Database Access:**
   - Create database user
   - Username: `heka_db`
   - Password: Generate strong password
   - Save credentials securely

2. **Network Access:**
   - Add IP: `0.0.0.0/0` (allows Railway/Vercel)
   - Or add specific Railway/Vercel IPs

3. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/heka_db`

### 1.3 Enable Backups
- M0: Automatic daily snapshots (2 days retention)
- M10+: Continuous backups (35 days retention)

---

## Step 2: Backend Deployment (Railway)

### 2.1 Connect Repository
1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Heka repository
5. Select `backend` directory

### 2.2 Configure Environment Variables
In Railway dashboard, add these variables:

```bash
# Application
ENVIRONMENT=production
DEBUG=false

# MongoDB
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/heka_db
MONGODB_DB_NAME=heka_db

# Security
SECRET_KEY=<generate-with-python-secrets-token_urlsafe-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (will be set after frontend deployment)
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Email
EMAIL_FROM=noreply@heka.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app

# Optional: Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

### 2.3 Deploy
1. Railway will auto-detect Python project
2. Install dependencies from `requirements.txt`
3. Run `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Get backend URL: `https://your-backend.railway.app`

### 2.4 Verify Deployment
```bash
curl https://your-backend.railway.app/health
# Should return: {"status": "healthy", ...}
```

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Connect Repository
1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import GitHub repository
4. Select `frontend` directory

### 3.2 Configure Build Settings
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 3.3 Set Environment Variables
In Vercel dashboard:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Get frontend URL: `https://your-project.vercel.app`

### 3.5 Update Backend CORS
Go back to Railway and update:
```bash
ALLOWED_ORIGINS=https://your-project.vercel.app
```

---

## Step 4: Custom Domain (Optional)

### 4.1 Frontend Domain
1. In Vercel: Settings → Domains
2. Add custom domain: `heka.app`
3. Configure DNS records as instructed
4. SSL certificate auto-provisioned

### 4.2 Backend Domain
1. In Railway: Settings → Networking
2. Add custom domain: `api.heka.app`
3. Configure DNS records
4. Update `ALLOWED_ORIGINS` and `FRONTEND_URL`

---

## Step 5: Monitoring Setup

### 5.1 Sentry (Error Tracking)
1. Create account at [Sentry.io](https://sentry.io)
2. Create new project → Python → FastAPI
3. Get DSN
4. Add to Railway environment variables:
   ```bash
   SENTRY_DSN=https://...@sentry.io/...
   ```

### 5.2 Uptime Monitoring
1. Sign up for [Better Uptime](https://betteruptime.com) or [Uptime Robot](https://uptimerobot.com)
2. Add monitor:
   - URL: `https://your-backend.railway.app/health`
   - Interval: 5 minutes
   - Alert on downtime

---

## Step 6: CI/CD Setup

### 6.1 GitHub Secrets
Add these secrets to GitHub repository:

**Backend:**
- `RAILWAY_TOKEN` (get from Railway → Settings → Tokens)
- `OPENAI_API_KEY`

**Frontend:**
- `VERCEL_TOKEN` (get from Vercel → Settings → Tokens)
- `VERCEL_ORG_ID` (get from Vercel → Settings → General)
- `VERCEL_PROJECT_ID` (get from Vercel project settings)

### 6.2 Workflow
The `.github/workflows/ci-cd.yml` file will:
- Run tests on PR
- Deploy to production on push to `main`
- Deploy automatically

---

## Step 7: Post-Deployment Checklist

- [ ] Backend health check returns `healthy`
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] Email invitations send successfully
- [ ] AI analysis works
- [ ] Stripe payments work (if configured)
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Monitoring alerts configured
- [ ] Backups enabled on MongoDB Atlas

---

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Check MongoDB connection string
- Check logs in Railway dashboard

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Check backend is running (health endpoint)

### Database connection errors
- Verify MongoDB IP whitelist includes Railway IPs
- Check connection string format
- Verify database user credentials

---

## Cost Estimates

**MVP (100-500 users):**
- MongoDB Atlas M0: Free
- Railway: $5-20/month
- Vercel: Free (hobby plan)
- **Total: ~$5-20/month**

**Production (1000+ users):**
- MongoDB Atlas M10: $57/month
- Railway: $20-50/month
- Vercel: $20/month (pro plan)
- **Total: ~$100-130/month**

---

## Next Steps

1. Set up monitoring alerts
2. Configure custom domains
3. Set up staging environment
4. Implement database backups
5. Configure CDN (Cloudflare) for better performance

---

**Status:** Ready for deployment  
**Last Updated:** November 6, 2025


