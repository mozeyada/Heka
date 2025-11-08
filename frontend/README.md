# Heka Frontend

Next.js frontend for Heka - AI-powered couple argument resolution platform.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run development server:
```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js app router (pages)
│   ├── components/   # React components (to be created)
│   ├── lib/          # Utilities, API client (to be created)
│   ├── hooks/        # Custom React hooks (to be created)
│   └── store/        # Zustand state management (to be created)
├── public/           # Static assets
└── package.json
```

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
npm start
```


