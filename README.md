# Heka

AI-powered couple argument resolution platform.

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `DEPLOYMENT_ENV_VARS.md` for required environment variables.

## Tech Stack

- Backend: FastAPI, MongoDB
- Frontend: Next.js, React, TypeScript
- AI: OpenAI GPT-4o-mini
- Payments: Stripe
