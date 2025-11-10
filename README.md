# Heka

AI-powered couple argument resolution platform.

**Status:** 🚀 MVP Complete - Ready for Beta Launch

## What is Heka?

Heka helps couples resolve arguments using AI-powered mediation. Each partner shares their perspective, and our AI analyzes both sides using proven relationship frameworks (Gottman, NVC, EFT) to provide neutral insights and actionable guidance.

## Current Status (Nov 2024)

✅ **MVP Complete (95%)**
- Full-stack application deployed and operational
- 17 responsive pages with professional design system
- AI mediation with safety detection
- Subscription management (Free, Premium, Pro tiers)
- Stripe payments configured
- Security hardening complete
- Production-ready on Railway (backend) + Vercel (frontend)

🚧 **In Progress (Sprint 6: Launch Prep)**
- Stripe live payment testing
- Beta user recruitment (target: 10-20 couples)
- Marketing materials

📍 **Next Phase: Beta Launch** (4-6 weeks)
- User feedback collection
- Performance monitoring
- Product iteration

## Tech Stack

- **Backend:** FastAPI, MongoDB (Motor), Python 3.11
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **AI:** OpenAI GPT-4o-mini (cost-optimized)
- **Payments:** Stripe (subscriptions + webhooks)
- **Deployment:** Railway (backend), Vercel (frontend)
- **Monitoring:** Sentry (error tracking)

## Quick Start (Local Development)

### Backend
```bash
cd backend
source ~/.venv/bin/activate  # or create: python -m venv ~/.venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Documentation

- **[SETUP.md](SETUP.md)** - Development environment setup
- **[DEPLOYMENT_ENV_VARS.md](DEPLOYMENT_ENV_VARS.md)** - Required environment variables
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Project roadmap and status
- **[docs/DESIGN_PROGRESS.md](docs/DESIGN_PROGRESS.md)** - UI/UX design system
- **[STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)** - Payment setup guide

## Live Deployments

- **Frontend:** https://heka-nine.vercel.app
- **Backend:** https://heka-production.up.railway.app
- **API Docs:** https://heka-production.up.railway.app/docs

## Features

- 🔐 Secure authentication with JWT
- 👥 Couple profile creation and partner invites
- 💬 Argument tracking with dual perspectives
- 🤖 AI-powered mediation and insights
- 🎯 Goal setting and progress tracking
- 📊 Weekly relationship check-ins
- 💳 Subscription management (Stripe)
- 📱 Fully mobile-responsive design
- 🔒 Security hardening (rate limiting, input sanitization, crisis detection)
- 📄 Legal compliance (Terms, Privacy Policy, data export/deletion)

## License

Proprietary - All rights reserved
