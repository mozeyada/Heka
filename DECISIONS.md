# Strategic Decisions - Heka

This document captures all major strategic decisions made during the planning phase.

---

## 1. Target Market ✅

**Decision:** 
- **Age Range:** 16 years and older
- **Relationship Stage:** Established couples in committed relationships
- **Geographic Launch:** Australia (initial market)

**Rationale:**
- Age 16+ aligns with Australia's age of consent for online services
- Established couples more likely to have recurring conflicts worth resolving
- Australia chosen as initial launch market (less saturated, clear regulatory framework)

**Date:** Planning Phase

---

## 2. Business Model ✅

**Decision:**
- **Model:** Freemium subscription
- **Free Tier:** **7-day trial with 5 argument resolution limit** (no credit card required)
  - Users can experience check-ins, goals, and full mediation features
  - Cost control with usage limit
  - Clear upgrade path
- **Paid Tiers:** Subscription-based (Basic, Premium, future Couples Plus)

**Rationale:**
- Low barrier to entry (no credit card)
- Time to experience retention features (check-ins are weekly)
- Cost control (5 arguments per user max)
- Industry-standard trial model (better conversion)
- Clear value demonstration before payment

**Date:** Planning Phase (Updated with final approval)  
**Reference:** See BUSINESS_MODEL.md and FINAL_APPROVALS.md for details

---

## 3. AI Provider ✅

**Decision:** **Hybrid Approach - Start GPT-4, Test Gemini 2.5 Flash**

**Rationale:**
- Most mature and reliable API in the market
- Excellent for nuanced conversation and mediation scenarios
- Strong documentation and community support
- Best balance of cost and capability
- Proven track record in complex reasoning tasks
- Easy integration with Python/FastAPI backend

**Alternatives Considered:**
- Anthropic Claude: Strong but newer API, less mature ecosystem
- Self-hosted models: Too complex for MVP, higher infrastructure costs

**Date:** Planning Phase  
**Strategic Impact:** Core to product functionality

---

## 4. Platform Strategy ✅

**Decision:**
- **Development Approach:** Web-first (React/Next.js)
- **User Launch:** Native iOS and Android apps (React Native)
- **Rationale:** Develop and iterate quickly on web, then package for native mobile launch

**Rationale:**
- Faster development and iteration on web platform
- Easier testing and debugging during MVP phase
- Web can be used for beta testing
- Native apps provide better UX for launch (required for App Store presence)
- React Native allows code reuse between web and mobile

**Timeline:**
- Phase 1-2: Web development and MVP
- Phase 3: Native app development (parallel to web refinement)
- Phase 4: Launch on both platforms simultaneously

**Date:** Planning Phase

---

## 5. Competitive Positioning ✅

**Decision:** Focus on **dual-perspective AI mediation** as unique differentiator

**Key Finding:**
- No existing apps specialize in argument resolution with dual-perspective input
- Existing apps focus on general relationship coaching/advice
- Market gap confirmed for structured argument resolution

**Strategic Positioning:**
- "AI Mediator for Couples" (not "Relationship Coach")
- Specific use case: Arguments/disagreements
- Structured workflow: Conflict → Mediation → Resolution → Tracking

**Date:** Planning Phase  
**Reference:** See COMPETITIVE_ANALYSIS.md

---

## 6. Legal & Compliance Approach ✅

**Decision:** Proactive compliance with Australian regulations, clear disclaimers, crisis detection

**Key Decisions:**
1. **Therapy Disclaimer:** Required on all user touchpoints - "Not a replacement for professional therapy"
2. **Crisis Detection:** Implement systems to detect and respond to mental health crises
3. **Age Verification:** 16+ with clear verification during registration
4. **Privacy First:** Australian Privacy Act compliance, data encryption, user rights

**Rationale:**
- Proactive approach reduces legal risk
- User safety is paramount
- Compliance enables trust and scalability
- Clear boundaries protect platform (not therapy, but argument resolution tool)

**Date:** Planning Phase  
**Reference:** See LEGAL_COMPLIANCE.md for comprehensive details

---

## 7. Technology Stack ✅

## 7a. Hosting & Infrastructure ✅

**Database:**
- **Development:** MongoDB Atlas M0 (Free tier - 512MB)
- **Production:** Upgrade to M10+ when needed ($57+/month)
- **Strategy:** Start free, scale up based on usage

**Backend API Hosting:**
- **MVP/Beta:** Railway/Render/DigitalOcean ($5-12/month)
- **Production:** Upgrade as needed ($20-100/month)
- **Strategy:** Simple PaaS for MVP, cloud infrastructure for scale

**Rationale:**
- Start with minimal costs (free/low cost)
- Scale incrementally based on user growth
- App stores require HTTPS and 24/7 availability (cloud hosting mandatory)
- Can't run production locally (reliability and security concerns)

**Date:** Planning Phase  
**Reference:** See HOSTING_STRATEGY.md

---

## 7. Technology Stack ✅

**Backend:**
- **Language:** Python (FastAPI)
- **Database:** **MongoDB** (primary), Redis (caching)
- **AI:** OpenAI GPT-4

**Frontend:**
- **Web:** React/Next.js
- **Mobile:** React Native (iOS & Android)
- **UI:** Tailwind CSS with custom components

**Infrastructure:**
- Cloud hosting (AWS/GCP/Azure)
- Docker for containerization
- CI/CD pipeline

**Rationale:**
- Python/FastAPI: Excellent AI integration, rapid development
- React/Next.js: Modern, performant, large ecosystem
- **MongoDB: Stakeholder experience, flexible schema, JSON-native, good for rapid iteration**
- OpenAI GPT-4: Best-in-class for mediation tasks
- Mobile platforms don't affect database choice (connect via API, not directly)

**Date:** Planning Phase (Updated with MongoDB decision)  
**Reference:** See DESIGN.md and DATABASE_COMPARISON.md for details

---

## 8. MVP Scope ✅

**Included:**
- User authentication and couple profile creation
- Argument creation and dual-perspective input
- AI mediation and insights
- Basic resolution tracking
- Free tier (1 case) + subscription management

**Excluded (Post-MVP):**
- Native mobile apps (developed separately for launch)
- Voice input
- Advanced analytics
- Therapist marketplace
- Multi-language support

**Rationale:**
- Focus on core value proposition
- Get to market quickly
- Validate business model
- Iterate based on user feedback

**Date:** Planning Phase

---

## 9. Pricing Strategy ✅

**Decision:**
- **Free Tier:** 1 argument resolution
- **Basic:** AUD $9.99/month or $99/year
- **Premium:** AUD $19.99/month or $199/year

**Rationale:**
- Free tier removes friction for sign-ups
- Pricing positioned as affordable alternative to therapy ($100-200/hour)
- Annual plans provide cost savings and improve retention
- Multiple tiers allow upselling

**Note:** Pricing to be validated through market testing

**Date:** Planning Phase  
**Reference:** See BUSINESS_MODEL.md

---

## Decision Log

| Date | Decision | Status | Impact |
|------|----------|--------|--------|
| Planning Phase | Target Market (16+, Australia, established couples) | ✅ Final | High - defines entire product strategy |
| Planning Phase | Business Model (Freemium subscription) | ✅ Final | High - revenue model |
| Planning Phase | AI Provider (OpenAI GPT-4) | ✅ Final | Critical - core functionality |
| Planning Phase | Platform Strategy (Web-first, native for launch) | ✅ Final | Medium - development approach |
| Planning Phase | Competitive Positioning (Dual-perspective mediation) | ✅ Final | High - differentiation |
| Planning Phase | Legal Approach (Proactive compliance) | ✅ Final | High - risk mitigation |
| Planning Phase | Technology Stack | ✅ Final | Medium - implementation foundation |
| Planning Phase | MVP Scope | ✅ Final | High - defines Phase 2 |
| Planning Phase | Pricing Strategy | ✅ Final (pending validation) | High - monetization |

---

## 9. Account Model ✅

**Decision:** **Individual Accounts Per Partner** (Flo App Model)

**Details:**
- Each partner has their own account on their own device
- Accounts linked through shared couple profile
- Individual authentication and privacy
- Shared data (arguments, resolutions) accessible to both
- Subscription can be managed by either partner

**Rationale:**
- Privacy: Each partner accesses independently
- Better UX: Native mobile experience per person
- Notifications: Individual push notifications
- Personalization: Tailored content per user
- Security: Separate credentials

**Date:** Planning Phase  
**Reference:** See RETENTION_STRATEGY.md

---

## 10. Retention Strategy ✅

**Decision:** Transform from "reactive argument resolver" to "proactive relationship health platform"

**Key Features:**
- Weekly relationship check-ins
- Preventive communication prompts
- Relationship goal setting & tracking
- Communication exercises library
- Monthly relationship insights
- Achievement badges & gamification

**Rationale:**
- Addresses churn risk when couples aren't arguing
- Provides continuous value beyond conflict resolution
- Positions Heka as relationship health tool, not just crisis management
- Builds engagement during "good times"

**Date:** Planning Phase  
**Reference:** See RETENTION_STRATEGY.md

---

## Next Decisions Needed

1. **Specific Pricing:** Validate proposed pricing through market research
2. **Team Structure:** Determine team composition and roles
3. **Funding/Resources:** Secure resources for MVP development
4. **Partnerships:** Identify potential launch partners
5. **Branding:** Finalize logo, colors, brand identity
6. **Launch Date:** Set target launch timeline
7. **Retention Feature Priority:** Which proactive features for MVP vs. post-MVP?

---

## Decision Review Process

**Frequency:** Review decisions quarterly or when significant changes occur  
**Stakeholders:** Primary stakeholder (Zeyada) + Project Manager  
**Documentation:** All strategic decisions documented here  
**Change Management:** Major changes require stakeholder approval

