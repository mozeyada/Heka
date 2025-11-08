# Heka Backend

FastAPI backend for Heka - AI-powered couple argument resolution platform.

## Setup

### Prerequisites
- Python 3.11+
- MongoDB 6.0+ (local or MongoDB Atlas)
- Redis (optional, for caching)

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up MongoDB:
```bash
# Install MongoDB locally or use MongoDB Atlas (cloud)
# Local: https://www.mongodb.com/docs/manual/installation/
# Atlas: https://www.mongodb.com/cloud/atlas

# MongoDB will create database automatically on first connection
# Database name: heka_db (or set in .env)
```

5. Run development server:
```bash
uvicorn app.main:app --reload --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── api/          # API endpoints (to be created)
│   ├── models/       # MongoDB models (Pydantic)
│   ├── services/     # Business logic services (to be created)
│   ├── db/           # MongoDB database configuration
│   ├── config.py     # Application settings
│   └── main.py       # FastAPI app
├── tests/            # Unit tests (to be created)
└── requirements.txt  # Python dependencies
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
flake8 app/
```

### Database Schema

MongoDB uses flexible schema. Models are defined in `app/models/`.
- Collections are created automatically on first document insert
- Indexes should be created programmatically (see `app/db/indexes.py` - to be created)

## API Documentation

Once running, visit:
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

