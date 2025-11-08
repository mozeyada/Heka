# Technical Implementation Plan - Heka MVP

## Overview

**Timeline:** 14 weeks (6 sprints)  
**Team:** PM/Developer (AI Assistant)  
**Tech Stack:** Python/FastAPI (backend), React/Next.js (frontend), PostgreSQL, OpenAI GPT-4

---

## Sprint 1: Foundation (Weeks 1-2)

### Goals
- Project setup and infrastructure
- Database schema implementation
- Basic authentication system
- Development environment

### Tasks

#### 1.1 Project Setup
- [ ] Initialize Git repository
- [ ] Create project structure (backend, frontend, docs)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure development environment (Docker, local setup)
- [ ] Set up code quality tools (linting, formatting)

#### 1.2 Database Setup
- [ ] Set up PostgreSQL database (local + cloud)
- [ ] Implement database schema (all tables):
  - Users
  - Couples
  - Arguments
  - Perspectives
  - AI_Insights
  - Resolutions
  - Relationship_Checkins
  - Relationship_Goals
  - Communication_Exercises
  - Achievement_Badges
  - Relationship_Insights
- [ ] Create database migrations system (Alembic/Flyway)
- [ ] Set up Redis for caching/sessions

#### 1.3 Authentication System
- [ ] Implement JWT token authentication
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] Password hashing (bcrypt)
- [ ] Age verification (16+)
- [ ] Token refresh mechanism

#### 1.4 Backend Foundation
- [ ] FastAPI project structure
- [ ] API routing setup
- [ ] Middleware (CORS, error handling)
- [ ] Environment configuration (.env)
- [ ] Logging system
- [ ] Basic health check endpoint

#### 1.5 Frontend Foundation
- [ ] Next.js project setup
- [ ] TypeScript configuration
- [ ] Tailwind CSS setup
- [ ] State management (Zustand)
- [ ] API client setup
- [ ] Basic routing structure
- [ ] Authentication context

**Deliverables:**
- Working authentication (register, login)
- Database schema deployed
- Basic API structure
- Frontend scaffolding

---

## Sprint 2: Core Features (Weeks 3-5)

### Goals
- Couple profile creation and linking
- Argument creation and management
- Dual-perspective input system

### Tasks

#### 2.1 Couple Profile System
- [ ] Create couple profile endpoint
- [ ] Partner invitation system (email/phone)
- [ ] Join couple profile endpoint
- [ ] Couple profile linking logic
- [ ] Couple profile validation
- [ ] Frontend: Couple creation flow
- [ ] Frontend: Partner invitation UI
- [ ] Frontend: Join couple flow

#### 2.2 Argument Management
- [ ] Create argument endpoint
- [ ] Argument CRUD operations
- [ ] Argument status management
- [ ] Argument categorization
- [ ] Argument priority levels
- [ ] Frontend: Create argument form
- [ ] Frontend: Argument list view
- [ ] Frontend: Argument detail view

#### 2.3 Perspective Input System
- [ ] Create perspective endpoint
- [ ] Validate perspective ownership (user + argument)
- [ ] Perspective content validation
- [ ] Dual-perspective completion check
- [ ] Frontend: Perspective input form
- [ ] Frontend: Perspective status display
- [ ] Frontend: Waiting for partner state

#### 2.4 Basic Dashboard
- [ ] Dashboard API (recent arguments, stats)
- [ ] Frontend: Dashboard layout
- [ ] Frontend: Recent arguments list
- [ ] Frontend: Quick actions

**Deliverables:**
- Users can create couple profiles
- Partners can link accounts
- Users can create arguments
- Both partners can input perspectives
- Basic dashboard functional

---

## Sprint 3: AI Integration (Weeks 6-8)

### Goals
- OpenAI GPT-4 integration
- AI mediation logic
- Prompt engineering
- Insights display

### Tasks

#### 3.1 OpenAI Integration
- [ ] OpenAI API client setup
- [ ] API key management (secure)
- [ ] Error handling and retries
- [ ] Rate limiting
- [ ] Cost tracking/monitoring

#### 3.2 AI Mediation Service
- [ ] Mediation prompt engineering
  - System prompts (neutral mediator role)
  - User prompts (both perspectives)
  - Output format (JSON structured)
- [ ] Mediation logic implementation
  - Input: Both perspectives
  - Process: AI analysis
  - Output: Insights, common ground, suggestions
- [ ] Prompt optimization and testing
- [ ] Response parsing and validation

#### 3.3 AI Insights Storage
- [ ] Store AI insights in database
- [ ] Insight retrieval endpoints
- [ ] Insight update logic
- [ ] Caching strategy (Redis)

#### 3.4 Frontend: AI Results
- [ ] AI analysis loading state
- [ ] Insights display component
- [ ] Common ground visualization
- [ ] Root causes display
- [ ] Suggestions display
- [ ] Error handling for AI failures

#### 3.5 Quality Assurance
- [ ] Test with various argument types
- [ ] Validate AI response quality
- [ ] Handle edge cases (very long inputs, sensitive topics)
- [ ] User feedback mechanism (thumbs up/down on insights)

**Deliverables:**
- AI mediation working end-to-end
- High-quality insights generation
- User-friendly insights display
- Cost monitoring in place

---

## Sprint 4: Retention + Payments (Weeks 9-11)

### Goals
- Weekly check-ins
- Relationship goals
- Subscription system
- Payment processing

### Tasks

#### 4.1 Weekly Check-Ins
- [ ] Check-in endpoint (create, retrieve)
- [ ] Check-in reminder logic (weekly)
- [ ] Check-in data validation
- [ ] Frontend: Check-in form (simple 2-question survey)
- [ ] Frontend: Check-in history
- [ ] Frontend: Check-in reminders (notifications)

#### 4.2 Relationship Goals
- [ ] Goal CRUD endpoints
- [ ] Goal progress tracking
- [ ] Goal status management
- [ ] Frontend: Goal creation form
- [ ] Frontend: Goal list view
- [ ] Frontend: Goal progress visualization
- [ ] Frontend: Goal completion celebration

#### 4.3 Subscription System
- [ ] Subscription tier management (Free, Basic, Premium)
- [ ] Trial period logic (7 days, 5 arguments)
- [ ] Usage tracking (argument count, trial expiration)
- [ ] Subscription status endpoints
- [ ] Frontend: Subscription status display
- [ ] Frontend: Upgrade prompts
- [ ] Frontend: Trial expiration warnings

#### 4.4 Payment Processing (Stripe)
- [ ] Stripe account setup
- [ ] Stripe integration (checkout, subscriptions)
- [ ] Payment webhooks (subscription events)
- [ ] Subscription activation logic
- [ ] Frontend: Payment checkout flow
- [ ] Frontend: Subscription management
- [ ] Error handling for payment failures

#### 4.5 Free Tier Enforcement
- [ ] Trial limit enforcement (5 arguments)
- [ ] Trial expiration handling
- [ ] Upgrade required messaging
- [ ] Frontend: Trial limit display
- [ ] Frontend: Upgrade prompts when limit reached

**Deliverables:**
- Check-ins functional
- Goals system working
- Subscriptions and payments integrated
- Free tier limits enforced

---

## Sprint 5: Polish & Testing (Weeks 12-13)

### Goals
- UI/UX refinement
- Security audit
- Performance optimization
- Comprehensive testing

### Tasks

#### 5.1 UI/UX Refinement
- [ ] Design system consistency
- [ ] Mobile responsiveness
- [ ] Loading states and animations
- [ ] Error message improvements
- [ ] Accessibility improvements (WCAG)
- [ ] User flow optimization

#### 5.2 Security Audit
- [ ] Authentication security review
- [ ] API endpoint security
- [ ] Data encryption (at rest, in transit)
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Rate limiting implementation
- [ ] Security headers

#### 5.3 Performance Optimization
- [ ] Database query optimization
- [ ] API response caching (Redis)
- [ ] Frontend code splitting
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Load testing

#### 5.4 Testing
- [ ] Unit tests (backend: 70%+ coverage)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (critical user flows)
- [ ] AI response quality testing
- [ ] Payment flow testing
- [ ] Error scenario testing

#### 5.5 Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User documentation (basic)
- [ ] Developer setup guide
- [ ] Deployment guide

**Deliverables:**
- Polished, secure application
- Comprehensive test coverage
- Performance optimized
- Documentation complete

---

## Sprint 6: Launch Prep (Week 14)

### Goals
- Beta testing
- Final fixes
- Deployment setup
- Launch readiness

### Tasks

#### 6.1 Beta Testing
- [ ] Recruit 20-50 beta users (see Beta Acquisition Plan)
- [ ] Beta user onboarding
- [ ] Feedback collection system
- [ ] Bug tracking and resolution
- [ ] User support (email, in-app)

#### 6.2 Final Fixes
- [ ] Address critical bugs from beta
- [ ] Address user feedback (high priority)
- [ ] Performance fixes
- [ ] UI/UX improvements based on feedback

#### 6.3 Deployment Setup
- [ ] Production environment setup (AWS/GCP)
- [ ] Database backup and recovery
- [ ] CI/CD pipeline for production
- [ ] Monitoring and logging (Sentry, Datadog)
- [ ] Domain and SSL setup
- [ ] CDN setup (if needed)

#### 6.4 Launch Readiness
- [ ] Legal documents finalized (Privacy Policy, ToS)
- [ ] Marketing materials ready
- [ ] Support system ready
- [ ] Launch announcement prepared
- [ ] Monitoring dashboards set up

**Deliverables:**
- Beta tested and validated
- Production-ready application
- Launch materials ready
- Monitoring in place

---

## Technical Architecture Details

### Backend Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── couples.py
│   │   ├── arguments.py
│   │   ├── ai_mediation.py
│   │   ├── checkins.py
│   │   ├── goals.py
│   │   └── subscriptions.py
│   ├── models/
│   ├── services/
│   │   ├── ai_service.py (OpenAI integration)
│   │   ├── payment_service.py (Stripe)
│   │   └── notification_service.py
│   ├── db/
│   └── config.py
├── tests/
└── requirements.txt
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/ (Next.js app router)
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── store/ (Zustand)
├── public/
└── package.json
```

### Database Schema (Key Tables)
- Users (id, email, password_hash, age, created_at)
- Couples (id, user1_id, user2_id, status)
- Arguments (id, couple_id, title, category, status)
- Perspectives (id, argument_id, user_id, content)
- AI_Insights (id, argument_id, analysis_json)
- Relationship_Checkins (id, couple_id, user_id, scores)
- Relationship_Goals (id, couple_id, title, progress)
- Subscriptions (id, user_id, tier, status, expires_at)

---

## API Endpoints Summary

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Users & Couples
- GET /api/users/me
- PUT /api/users/me
- POST /api/couples/create
- POST /api/couples/invite
- POST /api/couples/join
- GET /api/couples/me

### Arguments
- POST /api/arguments
- GET /api/arguments
- GET /api/arguments/:id
- POST /api/arguments/:id/perspectives
- POST /api/arguments/:id/analyze
- GET /api/arguments/:id/insights

### Retention Features
- POST /api/checkins
- GET /api/checkins
- POST /api/goals
- GET /api/goals
- PUT /api/goals/:id/progress

### Subscriptions
- GET /api/subscriptions/status
- POST /api/subscriptions/upgrade
- POST /api/subscriptions/cancel
- POST /api/subscriptions/webhook (Stripe)

---

## Key Technologies

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **Cache:** Redis
- **AI:** OpenAI GPT-4 API
- **Payments:** Stripe
- **Auth:** JWT (python-jose)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **API Client:** Axios or fetch

### Infrastructure
- **Hosting:** AWS/GCP (TBD)
- **Database:** Managed PostgreSQL
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, CloudWatch
- **Email:** SendGrid/Mailchimp

---

## Risk Mitigation

### Technical Risks
1. **AI Quality Issues**
   - Mitigation: Extensive prompt engineering, user feedback, quality monitoring

2. **API Rate Limits**
   - Mitigation: Caching, request queuing, fallback strategies

3. **Payment Processing Failures**
   - Mitigation: Webhook retries, manual processing option, clear error messages

4. **Database Performance**
   - Mitigation: Query optimization, indexing, caching, connection pooling

5. **Security Vulnerabilities**
   - Mitigation: Security audit, input validation, regular updates

---

## Success Metrics

### Technical
- ✅ API response time < 500ms (non-AI endpoints)
- ✅ AI response time < 5 seconds
- ✅ 99% uptime
- ✅ Zero critical security issues
- ✅ 70%+ test coverage

### Product
- ✅ All MVP features functional
- ✅ Smooth user flows
- ✅ No critical bugs
- ✅ Beta user satisfaction 4/5+

---

**Status:** Ready to begin Sprint 1  
**Next Action:** Start project setup and foundation work

