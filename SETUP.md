# Heka Development Setup Guide

## Quick Start

This guide will help you set up the Heka development environment.

---

## Prerequisites

### Required
- **Python 3.11+** - Backend development
- **Node.js 18+** - Frontend development
- **MongoDB 6.0+** - Database (local or MongoDB Atlas)
- **Git** - Version control

### Optional (but recommended)
- **Redis** - Caching and sessions
- **Docker** - Containerized development (future)

---

## Initial Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your settings:
# - MONGODB_URL (mongodb://localhost:27017 or Atlas connection string)
# - MONGODB_DB_NAME (heka_db)
# - SECRET_KEY (generate a secure key)
# - OPENAI_API_KEY

# Set up MongoDB
# Option 1: Local MongoDB
# Install MongoDB: https://www.mongodb.com/docs/manual/installation/
# Start MongoDB service

# Option 2: MongoDB Atlas (cloud)
# Sign up: https://www.mongodb.com/cloud/atlas
# Get connection string and update MONGODB_URL in .env

# Start development server
uvicorn app.main:app --reload --port 8000
```

Backend will run at: http://localhost:8000  
API docs at: http://localhost:8000/docs

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will run at: http://localhost:3000

---

## Environment Variables

### Backend (.env)

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (generate securely)
- `OPENAI_API_KEY` - OpenAI API key

**Optional:**
- `REDIS_URL` - Redis connection (for caching)
- `STRIPE_SECRET_KEY` - Stripe API key (for payments)
- `SENTRY_DSN` - Sentry error tracking

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL` - Backend API URL

---

## Database Setup

### MongoDB Options

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com

# Start MongoDB service
# macOS/Linux: mongod
# Windows: net start MongoDB
```

**Option 2: MongoDB Atlas (Recommended for Development)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 - 512MB free)
3. Get connection string
4. Update `MONGODB_URL` in `.env`

### Database Creation

MongoDB creates databases automatically on first use. Just set `MONGODB_DB_NAME=heka_db` in `.env`.

### Indexes (Optional)

MongoDB collections will be created automatically. Indexes can be created programmatically (future enhancement).

---

## Development Workflow

### Backend

1. Make changes to code
2. Run tests: `pytest`
3. Format code: `black app/`
4. Create migration (if model changes): `alembic revision --autogenerate -m "description"`
5. Apply migration: `alembic upgrade head`

### Frontend

1. Make changes to code
2. Type check: `npm run type-check`
3. Lint: `npm run lint`
4. Build: `npm run build`

---

## Project Structure

```
Heka/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/     # API endpoints
│   │   ├── models/  # Database models
│   │   ├── services/# Business logic
│   │   └── main.py  # FastAPI app
│   └── requirements.txt
├── frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/     # Next.js pages
│   │   ├── components/
│   │   └── lib/
│   └── package.json
└── docs/            # Documentation
```

---

## Troubleshooting

### Database Connection Issues
- Verify MongoDB is running: `mongosh` or `mongo` (should connect)
- Check MONGODB_URL format: `mongodb://localhost:27017` (local) or Atlas connection string
- For Atlas: Ensure IP is whitelisted and credentials are correct
- Check firewall settings if using remote MongoDB

### Python Dependencies
- Ensure virtual environment is activated
- Reinstall: `pip install -r requirements.txt --force-reinstall`

### Frontend Build Issues
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`

---

## Next Steps

1. Complete authentication implementation (Sprint 1)
2. Set up API endpoints (Sprint 2)
3. Implement AI integration (Sprint 3)

See `TECHNICAL_IMPLEMENTATION_PLAN.md` for detailed sprint breakdown.

---

**Status:** Initial setup complete. Ready for development.

