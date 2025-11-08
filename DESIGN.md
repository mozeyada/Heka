# Design Document - Heka

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────┐
│   Clients   │ (Web, iOS, Android)
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│      API Gateway / Load Balancer    │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│      Application Services           │
│  ┌──────────┐  ┌──────────┐         │
│  │   User   │  │ Argument │         │
│  │ Service  │  │ Service  │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │   AI     │  │  Media   │         │
│  │ Service  │  │ Service  │         │
│  └──────────┘  └──────────┘         │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│      Data Layer                     │
│  ┌──────────┐  ┌──────────┐         │
│  │PostgreSQL│  │  Redis   │         │
│  │ Database │  │  Cache   │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐                       │
│  │  Object  │                       │
│  │ Storage  │                       │
│  └──────────┘                       │
└──────────────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│      External Services              │
│  ┌──────────┐  ┌──────────┐         │
│  │   LLM    │  │ Auth     │         │
│  │  API     │  │ Service  │         │
│  └──────────┘  └──────────┘         │
└──────────────────────────────────────┘
```

### 1.2 Technology Stack (Proposed)

#### Backend
- **Language:** Python (FastAPI) - *Recommended for AI integration and rapid development*
- **Database:** PostgreSQL (primary), Redis (caching/sessions)
- **AI/ML:** 
  - **OpenAI GPT-4** - *Strategic Decision: Selected for maturity, reliability, and excellent API support*
  - Optional: Fine-tuned models for relationship dynamics (future enhancement)
- **Authentication:** JWT tokens, OAuth2
- **Storage:** AWS S3 / Cloudflare R2 (for media)

#### Frontend
- **Web:** React/Next.js - *Primary development platform for MVP*
- **Mobile:** React Native - *For iOS and Android launch (post-web MVP)*
- **State Management:** Zustand or Redux Toolkit
- **UI Framework:** Tailwind CSS with custom components
- **Platform Strategy:** Web-first development → Native mobile apps for user launch

#### Infrastructure
- **Hosting:** Railway / Render / DigitalOcean (MVP), AWS/GCP for scale
- **Database Hosting:** MongoDB Atlas (M0 free tier → M10+ when needed)
- **Containerization:** Docker (optional for MVP, useful for production)
- **CI/CD:** GitHub Actions
- **Cost Strategy:** Start free/low-cost, scale incrementally

#### Monitoring & Analytics
- **Error Tracking:** Sentry
- **Analytics:** Mixpanel / Amplitude
- **Monitoring:** Datadog / New Relic

---

## 2. Database Schema (Initial Design)

### Core Tables

#### Users
```sql
- id (UUID, PK)
- email (string, unique)
- password_hash (string)
- name (string)
- created_at (timestamp)
- updated_at (timestamp)
- privacy_settings (JSON)
```

#### Couples
```sql
- id (UUID, PK)
- user1_id (UUID, FK -> Users)
- user2_id (UUID, FK -> Users)
- relationship_start_date (date, optional)
- status (active, paused, ended)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Arguments
```sql
- id (UUID, PK)
- couple_id (UUID, FK -> Couples)
- title (string)
- category (enum: finances, communication, values, etc.)
- priority (enum: low, medium, high, urgent)
- status (draft, active, resolved, archived)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Perspectives
```sql
- id (UUID, PK)
- argument_id (UUID, FK -> Arguments)
- user_id (UUID, FK -> Users)
- content (text)
- sentiment_score (float, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

#### AI_Insights
```sql
- id (UUID, PK)
- argument_id (UUID, FK -> Arguments)
- analysis (JSON/text)
- common_ground (text)
- root_causes (text)
- suggestions (JSON)
- solutions (JSON)
- generated_at (timestamp)
```

#### Resolutions
```sql
- id (UUID, PK)
- argument_id (UUID, FK -> Arguments)
- solution_agreed (text)
- action_items (JSON)
- follow_up_date (date, optional)
- resolution_status (pending, in_progress, completed, failed)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Relationship_Checkins
```sql
- id (UUID, PK)
- couple_id (UUID, FK -> Couples)
- user_id (UUID, FK -> Users) -- who completed check-in
- satisfaction_score (integer, 1-10)
- tension_level (integer, 1-10)
- notes (text, optional)
- completed_at (timestamp)
- created_at (timestamp)
```

#### Relationship_Goals
```sql
- id (UUID, PK)
- couple_id (UUID, FK -> Couples)
- title (string)
- description (text)
- category (enum: communication, intimacy, finances, etc.)
- status (active, completed, paused)
- progress_percentage (integer, 0-100)
- created_by (UUID, FK -> Users)
- created_at (timestamp)
- updated_at (timestamp)
- completed_at (timestamp, optional)
```

#### Communication_Exercises
```sql
- id (UUID, PK)
- couple_id (UUID, FK -> Couples)
- exercise_type (enum: active_listening, gratitude, love_language, etc.)
- status (assigned, in_progress, completed)
- assigned_at (timestamp)
- completed_at (timestamp, optional)
- notes (text, optional)
- created_at (timestamp)
```

#### Achievement_Badges
```sql
- id (UUID, PK)
- couple_id (UUID, FK -> Couples)
- badge_type (enum: conflict_resolver, communication_champion, goal_achiever, etc.)
- earned_at (timestamp)
- metadata (JSON) -- e.g., count, streak_length
```

#### Relationship_Insights
```sql
- id (UUID, PK)
- couple_id (UUID, FK -> Couples)
- insight_type (enum: weekly, monthly, pattern_analysis)
- content (text/JSON)
- generated_at (timestamp)
- ai_analysis (JSON, optional)
```

---

## 3. User Interface Design Principles

### 3.1 Design Philosophy
- **Calm & Reassuring:** Soft colors, minimal UI, non-threatening
- **Neutral & Balanced:** No favoritism, equal representation
- **Clear & Simple:** Reduce cognitive load during emotional moments
- **Trustworthy:** Professional, secure, empathetic tone

### 3.2 Key Screens/Flows

#### Onboarding Flow
1. Welcome screen
2. Individual account creation
3. Partner invitation
4. Couple profile setup
5. Tutorial/walkthrough

#### Argument Resolution Flow
1. Create new argument or select existing
2. Input your perspective
3. Partner inputs their perspective
4. AI analysis screen (loading → results)
5. Review insights, common ground, suggestions
6. Discussion facilitation
7. Solution agreement
8. Action plan creation
9. Follow-up scheduling

#### Dashboard
- Recent arguments
- Resolution progress
- Relationship health metrics (optional)
- Quick actions

---

## 4. AI/ML Design

### 4.1 AI Mediation Approach

#### Input Processing
- Sentiment analysis on both perspectives
- Key point extraction
- Emotion detection
- Topic classification

#### Mediation Logic
1. **Understanding Phase:** Parse both perspectives, identify facts vs. emotions
2. **Analysis Phase:** 
   - Find common ground
   - Identify disagreements
   - Detect root causes (communication patterns, values misalignment, etc.)
3. **Suggestion Phase:**
   - Generate neutral framing
   - Propose solutions
   - Suggest communication strategies

#### Output Format
- Structured JSON with:
  - Summary
  - Common ground points
  - Key disagreements
  - Root cause analysis
  - Suggested solutions (ranked)
  - Communication tips

### 4.2 Prompt Engineering Strategy
- Role-based prompts (neutral mediator)
- Context-aware (relationship history)
- Culturally sensitive
- Non-judgmental language
- Solution-focused framing

---

## 5. Security & Privacy Considerations

### 5.1 Data Protection
- End-to-end encryption for sensitive conversations
- Secure key management
- Data minimization (only collect necessary data)
- Right to deletion (GDPR compliance)

### 5.2 Access Control
- Strict couple isolation (data cannot leak between couples)
- Role-based access control
- Audit logging

### 5.3 Ethical Guidelines
- Clear disclaimer: Not a replacement for therapy
- Crisis detection and referral
- Abuse detection mechanisms
- Transparent AI decision-making (explainable AI)

---

## 6. API Design (High-Level)

### Authentication Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

### User Endpoints
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/couples/invite`
- `POST /api/couples/join`

### Argument Endpoints
- `POST /api/arguments`
- `GET /api/arguments`
- `GET /api/arguments/:id`
- `PUT /api/arguments/:id`
- `POST /api/arguments/:id/perspectives`
- `POST /api/arguments/:id/analyze`
- `GET /api/arguments/:id/insights`

### Resolution Endpoints
- `POST /api/resolutions`
- `PUT /api/resolutions/:id`
- `GET /api/resolutions`

---

## 7. Future Enhancements (Post-MVP)
- Voice input/output
- Video integration
- Therapist marketplace
- Relationship coaching content
- Community features
- Advanced analytics
- Mobile apps (iOS/Android)
- Multi-language support

