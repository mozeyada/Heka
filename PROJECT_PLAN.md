# Project Plan - Heka

## Phase Overview

### Phase 1: Discovery & Planning ✅ (Current)
- Requirements gathering
- Architecture design
- Technology selection
- Wireframes/mockups
- Project setup

**Timeline:** 1-2 weeks

---

### Phase 2: MVP Development (Proposed)

#### Sprint 1: Foundation (2 weeks)
- Project setup (repo, CI/CD, infrastructure)
- Database schema implementation
- User authentication system
- Basic API structure
- Frontend scaffolding

#### Sprint 2: Core Features (3 weeks)
- Couple profile creation
- Argument creation and management
- Perspective input system
- Basic UI for core flows

#### Sprint 3: AI Integration (3 weeks)
- AI service integration
- Prompt engineering
- Mediation logic
- Insights display
- Error handling and edge cases

#### Sprint 4: Resolution Tracking (2 weeks)
- Resolution creation and tracking
- Action plan system
- Basic progress metrics
- Historical view

#### Sprint 5: Polish & Testing (2 weeks)
- UI/UX refinement
- Security audit
- Performance optimization
- Testing (unit, integration, E2E)
- Bug fixes

#### Sprint 6: Launch Prep (1 week)
- Documentation
- Beta testing
- Final fixes
- Deployment setup
- Marketing materials

**Total MVP Timeline:** ~13 weeks (~3 months)

---

### Phase 3: Beta Launch
- Limited user release
- Feedback collection
- Iteration based on feedback
- Performance monitoring

**Timeline:** 4-6 weeks

---

### Phase 4: Public Launch
- Full feature release
- Marketing push
- User acquisition
- Support systems

---

## Resource Requirements

### MVP Team (Suggested)
- 1-2 Full-stack Developers
- 1 AI/ML Engineer (for prompt engineering and optimization)
- 1 UI/UX Designer (could be part-time for MVP)
- 1 QA Engineer (could be part-time)
- 1 DevOps/Infrastructure (could be part-time)

### Infrastructure Costs (Estimated)
- Cloud hosting: $50-200/month (MVP scale)
- AI API costs: Variable based on usage ($100-1000/month for MVP)
- Database: $20-100/month
- Domain, SSL, monitoring: $50/month
- **Total MVP:** ~$220-1350/month

---

## Risk Assessment

### Technical Risks
- **AI Quality:** AI may not provide helpful mediation
  - *Mitigation:* Extensive prompt engineering, testing, iteration
- **Scalability:** System may not handle growth
  - *Mitigation:* Cloud-native architecture, design for scale from start
- **Security Breach:** Sensitive relationship data compromised
  - *Mitigation:* Security-first design, encryption, audits

### Business Risks
- **Market Fit:** Users may not find value
  - *Mitigation:* User research, beta testing, iterate quickly
- **Legal/Regulatory:** Need for professional counseling disclaimers
  - *Mitigation:* Legal review, clear disclaimers, terms of service
- **Competition:** Existing solutions in market
  - *Mitigation:* Unique value proposition, superior UX, AI advantage

---

## Success Criteria for MVP

### Technical
- ✅ System handles 100 concurrent couples
- ✅ < 5 second response time for AI analysis
- ✅ 99% uptime
- ✅ Zero data breaches

### User Experience
- ✅ Users can complete full argument resolution flow
- ✅ < 10% drop-off rate during onboarding
- ✅ Users report AI insights as "helpful" (4/5 rating)
- ✅ Couples successfully resolve arguments using platform

### Business
- ✅ 100 beta users sign up
- ✅ 30% weekly active user rate
- ✅ Users recommend to others (NPS > 50)

---

## Next Steps (Immediate)

1. **Review & Refine:** Review all planning documents
2. **Wireframes:** Create UI/UX wireframes for key screens
3. **Technology Finalization:** Finalize tech stack decisions
4. **MVP Scope Refinement:** Prioritize features for MVP
5. **Team Formation:** Identify and onboard team members (if needed)
6. **Development Environment:** Set up development tools and repos
7. **Timeline Confirmation:** Confirm and adjust timelines based on resources

---

---

## Resolved Decisions ✅

1. **Target Users:** ✅ Ages 16+, established couples, Australia launch
2. **Monetization:** ✅ Subscription tiers with free tier (1 argument case)
3. **Differentiation:** ✅ Dual-perspective AI mediation focus (see COMPETITIVE_ANALYSIS.md)
4. **AI Model:** ✅ OpenAI GPT-4 (strategic decision)
5. **Platform Priority:** ✅ Web-first development, native iOS/Android for launch
6. **Legal Structure:** ✅ See LEGAL_COMPLIANCE.md for details

