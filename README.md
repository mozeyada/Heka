# Heka

AI-powered couple argument resolution platform.

**Status:** MVP Complete – Mobile parity polish wrapping up

## What is Heka?

Heka helps couples resolve arguments using AI-powered mediation. Each partner shares their perspective, and our AI analyzes both sides using proven relationship frameworks (Gottman, NVC, EFT) to provide neutral insights and actionable guidance.

## Current Status (Dec 2025)

**MVP Complete (Production-ready web + mobile core)**
- Full-stack application deployed and operational
- 17 responsive web pages with cohesive design system
- Native mobile app (Expo) with polished dashboard, glassmorphic navigation, and offline-first ready architecture
- **Action Plans:** Convert resolved arguments into shared goals and check-ins (Cement the Win)
- AI mediation with safety detection
- Subscription management (Free, Basic, Premium tiers)
- Stripe payments configured
- Security hardening complete
- Production-ready on Railway (backend) + Vercel (frontend)

**In Progress (Launch Prep)**
- Device QA (iOS + Android) following smoke runbook
- Beta collateral refresh (screenshots, marketing copy)

**Next Phase: Beta Launch** (4-6 weeks)
- User feedback collection
- Performance monitoring
- Product iteration

## Tech Stack

- **Backend:** FastAPI, MongoDB (Motor), Python 3.11, Pytest
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Vitest
- **Mobile:** React Native, Expo, Jest, React Native Testing Library
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

### Mobile
```bash
cd mobile
npm install
npm run android # or npm run ios
```

## Documentation

- **[SETUP.md](SETUP.md)** - Development environment setup
- **[DEPLOYMENT_ENV_VARS.md](DEPLOYMENT_ENV_VARS.md)** - Required environment variables
- Internal planning/design docs are retained locally to keep the public repo focused on product deliverables.

## Live Deployments

- **Frontend:** https://heka-nine.vercel.app
- **Backend:** https://heka-production.up.railway.app
- **API Docs:** https://heka-production.up.railway.app/docs

## Features

- Secure authentication with JWT
- Couple profile creation and partner invites
- Argument tracking with dual perspectives
- AI-powered mediation and insights
- Goal setting and progress tracking
- Weekly relationship check-ins
- Subscription management (Stripe)
- Native mobile app (Expo) with polished dashboard, subscription, settings, and goal detail flows
- Security hardening (rate limiting, input sanitization, crisis detection)
- Legal compliance (Terms, Privacy Policy, data export/deletion)

## License

Proprietary - All rights reserved
