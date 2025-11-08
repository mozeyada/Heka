# MVP Scope & Feature Prioritization - Heka

## Executive Summary

This document defines what features are included in the **Minimum Viable Product (MVP)** vs. **Post-MVP** releases. The MVP focuses on proving core value proposition while post-MVP features enhance retention and scalability.

**MVP Goal:** Launch a functional product that demonstrates value for argument resolution and begins building retention habits.

---

## MVP Feature List ✅

### Core Features (Must Have)

#### 1. User Management & Authentication
- ✅ Individual account creation (per partner)
- ✅ Age verification (16+)
- ✅ Partner invitation system
- ✅ Couple profile linking (two accounts → one couple)
- ✅ Secure authentication (JWT)
- ✅ Individual push notifications per device
- ✅ Subscription management (free tier + paid tiers)

**Why MVP:** Essential foundation. Account model already decided.

#### 2. Argument Resolution Core
- ✅ Create new argument
- ✅ Dual-perspective input (Partner 1 & Partner 2)
- ✅ AI mediation analysis (OpenAI GPT-4)
- ✅ View AI insights (common ground, root causes, suggestions)
- ✅ Resolution status tracking
- ✅ Basic argument history view

**Why MVP:** This is the core value proposition - must work perfectly.

#### 3. Basic Retention Features (MVP)
- ✅ **Weekly relationship check-ins** (simple 2-question survey)
- ✅ **Relationship goal setting** (create 1-3 goals)
- ✅ **Basic goal progress tracking**

**Why MVP:** Addresses retention concern. Low complexity, high value.

#### 4. Subscription System
- ✅ Free tier: 1 argument resolution
- ✅ Basic tier: $9.99/month
- ✅ Premium tier: $19.99/month
- ✅ Payment processing integration (Stripe)
- ✅ Usage tracking and limits

**Why MVP:** Required for monetization and business model validation.

#### 5. Basic Dashboard
- ✅ Recent arguments list
- ✅ Active goals display
- ✅ Check-in reminder
- ✅ Subscription status

**Why MVP:** Central hub for user engagement.

---

## Post-MVP Features (Priority 1 - Launch Phase)

### Retention Features (Phase 1 - Months 2-3)

#### 1. Enhanced Check-Ins
- Weekly relationship insights (AI-generated summaries)
- Monthly relationship reports
- Pattern detection alerts

**Why Post-MVP:** Requires more AI processing and data accumulation.

#### 2. Communication Exercises
- Library of 10-15 exercises
- Exercise assignment and completion tracking
- On-demand access

**Why Post-MVP:** Content creation needed, but not blocking core value.

#### 3. Achievement Badges & Gamification
- Badge system
- Progress visualization
- Streak tracking

**Why Post-MVP:** Nice-to-have for engagement, not essential for MVP.

#### 4. Preventive Communication Prompts
- AI-suggested proactive conversations
- Pattern-based recommendations

**Why Post-MVP:** Requires historical data and pattern learning.

---

## Post-MVP Features (Priority 2 - Growth Phase)

### Content & Enrichment (Phase 2 - Months 4-6)

#### 1. Relationship Library
- Articles (20+ pieces of content)
- Expert guest posts
- Video content (future)

**Why Post-MVP:** Content creation is time-intensive, can be built incrementally.

#### 2. Date Night & Activity Suggestions
- Personalized recommendations
- Local event integration (future)

**Why Post-MVP:** Requires partnerships and integrations.

#### 3. Advanced Pattern Analysis
- Deep AI insights into relationship trends
- Predictive recommendations
- Advanced analytics dashboard

**Why Post-MVP:** Requires significant data accumulation and ML model refinement.

---

## Post-MVP Features (Priority 3 - Scale Phase)

### Advanced Features (Phase 3 - Months 7+)

#### 1. Native Mobile Apps
- iOS app (React Native)
- Android app (React Native)
- Enhanced mobile UX

**Why Post-MVP:** Web-first strategy allows faster MVP launch.

#### 2. Voice Input/Output
- Voice note recording for perspectives
- Text-to-speech for insights

**Why Post-MVP:** Additional complexity, can validate with text-first.

#### 3. Video Integration
- Video session preparation tools

**Why Post-MVP:** Complex feature, lower priority.

#### 4. Therapist Marketplace
- Integration with professional therapists
- Referral system

**Why Post-MVP:** Requires partnerships and legal considerations.

#### 5. Community Features
- Anonymous community forum
- User stories and testimonials

**Why Post-MVP:** Moderation and safety considerations.

---

## MVP Development Breakdown

### Sprint 1: Foundation (2 weeks)
- Project setup
- Database schema implementation
- User authentication system
- Basic API structure
- Frontend scaffolding

### Sprint 2: Core Features (3 weeks)
- Couple profile creation
- Argument creation and management
- Dual-perspective input system
- Basic UI for argument flow

### Sprint 3: AI Integration (3 weeks)
- OpenAI GPT-4 integration
- Prompt engineering and testing
- Mediation logic implementation
- Insights display
- Error handling

### Sprint 4: Retention + Payments (3 weeks)
- Weekly check-ins (simple version)
- Relationship goal setting and tracking
- Subscription system (Stripe integration)
- Free tier usage tracking
- Payment processing

### Sprint 5: Polish & Testing (2 weeks)
- UI/UX refinement
- Security audit
- Performance optimization
- Testing (unit, integration, E2E)
- Bug fixes

### Sprint 6: Launch Prep (1 week)
- Documentation
- Beta testing (20-50 users)
- Final fixes
- Deployment setup
- Legal documents finalized

**Total MVP Timeline:** ~14 weeks (~3.5 months)

---

## Feature Complexity Matrix

| Feature | Complexity | Value | MVP? |
|---------|-----------|-------|------|
| Individual accounts | Medium | High | ✅ Yes |
| Argument resolution | High | Critical | ✅ Yes |
| AI mediation | High | Critical | ✅ Yes |
| Weekly check-ins | Low | High | ✅ Yes |
| Goal setting | Low | High | ✅ Yes |
| Subscription system | Medium | High | ✅ Yes |
| Communication exercises | Medium | Medium | ❌ Post-MVP |
| Achievement badges | Low | Medium | ❌ Post-MVP |
| Relationship library | Medium | Medium | ❌ Post-MVP |
| Pattern analysis | High | Medium | ❌ Post-MVP |
| Native mobile apps | High | Medium | ❌ Post-MVP |
| Voice input | Medium | Low | ❌ Post-MVP |

---

## MVP Success Criteria

### Functional
- ✅ Users can create individual accounts and link as couple
- ✅ Couples can resolve arguments end-to-end
- ✅ AI provides helpful, actionable insights
- ✅ Free tier works (1 case limit)
- ✅ Paid subscriptions process correctly
- ✅ Check-ins and goals work for retention

### Business
- ✅ 50+ beta users sign up
- ✅ 10-20% free-to-paid conversion
- ✅ Users report value from check-ins and goals

### Technical
- ✅ Handles 50 concurrent couples
- ✅ < 5 second AI response time
- ✅ 99% uptime
- ✅ Zero critical security issues

---

## Post-MVP Roadmap Priority

### Phase 1 (Months 2-3): Retention Enhancement
1. Communication exercises library (10-15 exercises)
2. Achievement badges system
3. Enhanced relationship insights (weekly/monthly reports)
4. Preventive communication prompts

**Goal:** Reduce churn, increase engagement

### Phase 2 (Months 4-6): Content & Enrichment
1. Relationship library (20+ articles)
2. Date night suggestions (basic)
3. Advanced pattern analysis
4. Native mobile apps (iOS/Android)

**Goal:** Increase value, expand to mobile

### Phase 3 (Months 7+): Advanced Features
1. Voice input/output
2. Therapist marketplace
3. Community features
4. Video integration

**Goal:** Market expansion, new revenue streams

---

## Key Decisions Needed

### Before MVP Development Starts:

1. **Check-In Complexity:** 
   - **Option A (MVP):** Simple 2-question survey (satisfaction + tension level)
   - **Option B (Post-MVP):** More detailed questions, AI analysis
   - **Recommendation:** Option A for MVP

2. **Goal Features:**
   - **MVP:** Basic goal setting (title, description, progress bar)
   - **Post-MVP:** Goal categories, AI suggestions, detailed tracking
   - **Recommendation:** Basic version for MVP

3. **Communication Exercises:**
   - **MVP:** ❌ Not included (content creation needed)
   - **Post-MVP:** ✅ Full library
   - **Recommendation:** Delay to post-MVP

---

## Risk Mitigation

### MVP Risks:
1. **Too Minimal:** Users don't see retention value
   - **Mitigation:** Include check-ins and goals (basic but functional)

2. **Too Complex:** Delays launch
   - **Mitigation:** Strict MVP scope, move non-essentials to post-MVP

3. **Retention Features Not Ready:** Churn risk
   - **Mitigation:** Include basic check-ins and goals in MVP

---

## Recommendation

**MVP Should Include:**
- ✅ Core argument resolution (perfect this first)
- ✅ Basic retention (check-ins + goals) - addresses stakeholder concern
- ✅ Subscription system - enables monetization
- ✅ Individual accounts - already decided

**MVP Should NOT Include:**
- ❌ Communication exercises (content creation needed)
- ❌ Achievement badges (can add post-launch)
- ❌ Relationship library (content creation needed)
- ❌ Native mobile apps (web-first strategy)
- ❌ Advanced analytics (needs data accumulation)

**Next Step:** Once MVP scope approved, proceed to UI/UX wireframes focusing on MVP features.

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **MVP Development** | 14 weeks | Functional web app with core + basic retention |
| **Beta Launch** | 2-4 weeks | User feedback, iteration |
| **Public Launch** | Ongoing | Marketing, scaling |
| **Post-MVP Phase 1** | Months 2-3 | Enhanced retention features |
| **Post-MVP Phase 2** | Months 4-6 | Content, mobile apps |
| **Post-MVP Phase 3** | Months 7+ | Advanced features |

---

**Status:** Ready for stakeholder review and approval before wireframes and development begin.

