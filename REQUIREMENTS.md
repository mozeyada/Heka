# Requirements Specification - Heka

## 1. Functional Requirements

### 1.1 Core Features

#### FR-1: User Management
- **FR-1.1:** Users can create individual accounts (age verification: 16+)
  - **Account Model:** Individual accounts per partner (each on their own device)
  - **Linkage:** Accounts linked through shared couple profile
- **FR-1.2:** Users can create or join a couple profile
- **FR-1.3:** Couple profiles link two individual accounts
- **FR-1.4:** Secure authentication and authorization (separate credentials per user)
- **FR-1.5:** Privacy controls for shared data
- **FR-1.6:** Age verification during registration (minimum 16 years)
- **FR-1.7:** Subscription tier management (free vs. paid)
  - **Billing:** Either partner can manage subscription (shared billing for couple)
- **FR-1.8:** Usage tracking for free tier limitations
- **FR-1.9:** Individual push notifications per user device
- **FR-1.10:** Personalization per user account (tailored content/insights)

#### FR-2: Argument Input
- **FR-2.1:** Users can describe an argument/disagreement from their perspective
- **FR-2.2:** Partner can provide their perspective on the same issue
- **FR-2.3:** Support for text, voice, or structured input
- **FR-2.4:** Ability to tag arguments with categories (finances, communication, values, etc.)
- **FR-2.5:** Priority/urgency level assignment

#### FR-3: AI Mediation
- **FR-3.1:** AI analyzes both perspectives
- **FR-3.2:** Identifies common ground and points of disagreement
- **FR-3.3:** Suggests root cause analysis
- **FR-3.4:** Provides neutral, constructive feedback
- **FR-3.5:** Offers actionable solutions and compromises
- **FR-3.6:** Adapts communication style to couple's dynamics

#### FR-4: Resolution Tracking
- **FR-4.1:** Track arguments and their resolution status
- **FR-4.2:** Historical view of past arguments
- **FR-4.3:** Progress metrics and trends
- **FR-4.4:** Success/failure indicators

#### FR-5: Communication Tools
- **FR-5.1:** Facilitated discussion prompts
- **FR-5.2:** Guided conversation flows
- **FR-5.3:** Action plan creation and tracking
- **FR-5.4:** Reminders and follow-ups

#### FR-6: Proactive Relationship Maintenance (Retention Features)
- **FR-6.1:** Weekly/bi-weekly relationship check-ins
  - Quick satisfaction surveys
  - Tension detection prompts
  - Relationship health tracking
- **FR-6.2:** Preventive communication prompts
  - AI-suggested proactive conversations
  - Pattern-based recommendations
- **FR-6.3:** Relationship goal setting and tracking
  - Couples set shared goals
  - Progress visualization
  - Milestone celebrations
- **FR-6.4:** Communication exercises library
  - Active listening practice
  - Gratitude sharing prompts
  - Love language exercises
  - On-demand and scheduled exercises
- **FR-6.5:** Monthly/weekly relationship insights
  - AI-generated analysis of relationship patterns
  - Trend identification (argument frequency, resolution success, etc.)
  - Personalized recommendations
- **FR-6.6:** Achievement badges and gamification
  - Conflict resolver badges
  - Communication streaks
  - Goal achievement rewards
- **FR-6.7:** Relationship library (articles, expert content)
- **FR-6.8:** Date night & activity suggestions (future)

### 1.2 Non-Functional Requirements

#### NFR-1: Performance
- Response time: AI analysis within 5 seconds for standard arguments
- 99.9% uptime
- Support for concurrent users

#### NFR-2: Security & Privacy
- End-to-end encryption for sensitive data
- GDPR/CCPA compliance
- Data anonymization options
- Secure data storage

#### NFR-3: Usability
- Intuitive, non-intimidating interface
- Mobile-first design
- Accessible (WCAG 2.1 AA compliance)
- Multi-language support (future)

#### NFR-4: Scalability
- Cloud-native architecture
- Horizontal scaling capability
- Cost-effective scaling model

#### NFR-5: Reliability
- Data backup and recovery
- Transaction consistency
- Error handling and logging

---

## 2. User Stories

### Epics & User Stories

#### Epic 1: Onboarding
- **US-1:** As a new user, I want to create an account so I can start using Heka
- **US-2:** As a user, I want to invite my partner to join so we can resolve arguments together
- **US-3:** As a user, I want to understand how Heka works so I can use it effectively

#### Epic 2: Argument Resolution
- **US-4:** As a user, I want to describe an argument from my perspective so the AI can understand my side
- **US-5:** As a user, I want to see my partner's perspective so we can both be heard
- **US-6:** As a user, I want AI-generated insights so I can understand the root causes
- **US-7:** As a user, I want suggested solutions so we can move forward constructively

#### Epic 3: Progress Tracking
- **US-8:** As a user, I want to see our resolution history so I can track improvements
- **US-9:** As a user, I want to see progress metrics so I can understand our relationship growth

---

## 3. Assumptions & Constraints

### Assumptions
- Both partners are willing to participate
- Users have internet connectivity
- Users can express arguments in text or voice
- AI models can handle nuanced relationship dynamics

### Constraints
- Legal and ethical considerations around relationship counseling
- Privacy regulations (GDPR, Australian Privacy Act, CCPA)
- Not a replacement for professional therapy (mandatory disclaimers required)
- Resource limitations for initial MVP
- Age restriction: Minimum 16 years (Australia regulations)
- Geographic focus: Initial launch in Australia (regulatory compliance required)

---

## 4. Subscription Tiers & Pricing Model

### Free Tier
- **FR-6.1:** One complete argument resolution case
- **FR-6.2:** Access to basic features for trial
- **FR-6.3:** No credit card required for free tier

### Paid Subscription Tiers (to be defined)
- **FR-6.4:** Multiple subscription levels (Basic, Premium, etc.)
- **FR-6.5:** Unlimited argument resolutions
- **FR-6.6:** Advanced features (historical tracking, analytics, etc.)
- **FR-6.7:** Payment processing integration
- **FR-6.8:** Subscription management portal

---

## 5. Out of Scope (for MVP)
- Professional therapist integration
- Group/couples therapy features
- Advanced analytics dashboard
- Third-party integrations
- White-label solutions
- Native mobile apps (iOS/Android) - *Web-first, native apps for launch*

