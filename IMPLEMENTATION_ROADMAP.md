# Heka - Expert Review Implementation Roadmap

**Created:** November 6, 2025  
**Based On:** Comprehensive Expert Review (10 experts, 2,308 lines)  
**Status:** Ready To Execute

---

## 🎯 Executive Summary

**Current State:** 6/10 - Solid foundation, needs critical improvements  
**Target State:** 9/10 - Launch-ready, safe, scalable  
**Timeline:** 5-7 weeks  
**Investment:** $6,500-16,000 (consultants) + 330 hours development

---

## 📋 PHASE 1: CRITICAL BLOCKERS (Weeks 1-4)

**Status:** ⛔ **BLOCKS LAUNCH** - Must fix before any users

### Week 1: Legal & Security Foundation

#### Day 1-2: Legal Compliance (50 hours + $2,000-4,000)

**Action Items:**
1. ✅ **Hire Australian Legal Counsel**
   - Contact 3-5 tech attorneys
   - Get quotes ($2,000-4,000 for Privacy Policy + ToS)
   - Select attorney (specializes in SaaS, privacy law)

2. ✅ **Draft Legal Documents** (Attorney does this)
   - Privacy Policy (Australian Privacy Act compliant)
   - Terms of Service (subscription terms, disclaimers)
   - Crisis Resources Disclaimer

3. ✅ **Implement Legal Acceptance Flows** (12 hours)
   - Registration: Accept Terms + Privacy Policy
   - First argument: Show crisis disclaimer
   - Footer: Links to all legal docs
   - Admin: Track acceptance status

**Files to Create/Modify:**
- `frontend/src/app/legal/privacy/page.tsx`
- `frontend/src/app/legal/terms/page.tsx`
- `backend/app/api/legal.py` (acceptance tracking)
- `frontend/src/components/LegalAcceptance.tsx`

**Checklist:**
- [ ] Legal counsel hired
- [ ] Privacy Policy drafted
- [ ] Terms of Service drafted
- [ ] Crisis disclaimer created
- [ ] Acceptance flows implemented
- [ ] Legal doc links in footer
- [ ] Legal acceptance tracked in database

---

#### Day 3-4: Security Hardening (25 hours)

**Critical Security Fixes:**

1. ✅ **SECRET_KEY Validation** (1 hour)
   ```python
   # backend/app/config.py
   SECRET_KEY: str = Field(..., min_length=32)
   
   @validator('SECRET_KEY')
   def validate_secret_key(cls, v):
       if len(v) < 32:
           raise ValueError('SECRET_KEY must be at least 32 characters')
       if v in ['secret', 'changeme', '123456']:
           raise ValueError('SECRET_KEY is too weak')
       return v
   ```

2. ✅ **Rate Limiting** (8 hours)
   ```python
   # Install: pip install slowapi
   from slowapi import Limiter
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   
   @router.post("/login")
   @limiter.limit("5/minute")
   async def login(...):
   
   @router.post("/register")
   @limiter.limit("3/hour")
   async def register(...):
   
   @router.post("/api/ai/arguments/{id}/analyze")
   @limiter.limit("10/hour")
   async def analyze(...):
   ```

3. ✅ **MongoDB Security** (6 hours)
   - Verify MongoDB Atlas authentication enabled
   - Verify SSL/TLS enforced
   - Verify IP whitelist configured
   - Review connection string security
   - Add MongoDB security validation in config

4. ✅ **Input Validation & NoSQL Injection Protection** (10 hours)
   ```python
   # Add to all input schemas
   @validator('content')
   def sanitize_content(cls, v):
       v = v.replace('\x00', '')  # Remove null bytes
       if v.count('$') > 5 or v.count('{') > 10:
           raise ValueError('Suspicious patterns detected')
       return v.strip()
   
   # Always validate ObjectId
   try:
       user_id = ObjectId(request_data.get("user_id"))
   except:
       raise HTTPException(400, "Invalid ID")
   ```

**Files to Modify:**
- `backend/app/config.py` (SECRET_KEY validation)
- `backend/app/main.py` (rate limiting setup)
- `backend/app/api/auth.py` (rate limiting on endpoints)
- `backend/app/api/arguments.py` (rate limiting)
- `backend/app/api/perspectives.py` (input sanitization)
- `backend/app/api/couples.py` (input validation)

**Checklist:**
- [ ] SECRET_KEY validation implemented
- [ ] Rate limiting on all sensitive endpoints
- [ ] MongoDB security verified
- [ ] Input sanitization added
- [ ] NoSQL injection protection added
- [ ] Security tested manually

---

#### Day 5-7: AI Safety & Optimization (20 hours)

**Critical AI Fixes:**

1. ✅ **Rewrite AI Prompt** (8 hours)
   - Incorporate Gottman Method principles
   - Add Nonviolent Communication framework
   - Include safety protocols
   - Test with real scenarios

2. ✅ **Implement Crisis Detection** (12 hours)
   ```python
   # backend/app/services/safety_service.py
   CRISIS_KEYWORDS = {
       'violence': ['hit', 'punch', 'hurt', 'violent'],
       'abuse': ['abuse', 'control', 'manipulate', 'threaten'],
       'self_harm': ['suicide', 'kill myself', 'want to die'],
   }
   
   async def detect_safety_concerns(text_1: str, text_2: str):
       # Detect keywords
       # Return safety flag
       # Show crisis resources if detected
   ```

3. ✅ **Switch to GPT-4o-mini** (4 hours)
   - Update model selection
   - Test quality (should be 80-90% of GPT-4)
   - Update cost calculations
   - Implement tiered model strategy

**Files to Create/Modify:**
- `backend/app/services/ai_service.py` (rewrite prompt)
- `backend/app/services/safety_service.py` (NEW)
- `backend/app/config.py` (model selection)
- `frontend/src/components/CrisisResources.tsx` (NEW)

**Checklist:**
- [ ] AI prompt rewritten with frameworks
- [ ] Crisis detection implemented
- [ ] GPT-4o-mini integrated
- [ ] Safety resources displayed
- [ ] AI quality tested

---

### Week 2: Data Compliance & DevOps Setup

#### Day 8-10: Data Export/Deletion (16 hours)

**Required by Australian Privacy Act:**

1. ✅ **Data Export Feature** (8 hours)
   ```python
   @router.get("/api/users/me/export")
   async def export_user_data(current_user: UserInDB):
       # Generate JSON with all user data
       # - User profile
       # - Arguments (couple-level)
       # - Perspectives
       # - Check-ins
       # - Goals
       # Return downloadable file
   ```

2. ✅ **Account Deletion Feature** (8 hours)
   ```python
   @router.delete("/api/users/me/account")
   async def delete_account(current_user: UserInDB, confirmation: str):
       if confirmation != "DELETE":
           raise HTTPException(400, "Must confirm deletion")
       
       # Delete or anonymize:
       # - User account
       # - Perspectives
       # - Arguments (if user created)
       # - Subscriptions
       # - Keep financial records (7 years)
   ```

**Files to Create/Modify:**
- `backend/app/api/users.py` (export/delete endpoints)
- `frontend/src/app/settings/page.tsx` (NEW - settings page)
- `frontend/src/components/DataExport.tsx` (NEW)
- `frontend/src/components/AccountDeletion.tsx` (NEW)

**Checklist:**
- [ ] Data export endpoint implemented
- [ ] Account deletion endpoint implemented
- [ ] Settings page created
- [ ] Export UI complete
- [ ] Deletion flow with confirmation
- [ ] Tested end-to-end

---

#### Day 11-14: Production Infrastructure (40 hours)

**DevOps Setup:**

1. ✅ **Hosting Setup** (20 hours)
   - Frontend: Vercel (Next.js)
   - Backend: Railway or Render
   - Database: MongoDB Atlas (already have)
   - Configure environment variables
   - Set up custom domain
   - SSL certificates

2. ✅ **Monitoring Setup** (8 hours)
   - Sentry error tracking (already in config)
   - Configure Sentry DSN
   - Set up alerts
   - Uptime monitoring (Better Uptime / Uptime Robot)

3. ✅ **CI/CD Pipeline** (12 hours)
   ```yaml
   # .github/workflows/deploy.yml
   - Test suite runs on PR
   - Deploy to staging on merge to develop
   - Deploy to production on merge to main
   ```

**Checklist:**
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured
- [ ] Sentry monitoring active
- [ ] CI/CD pipeline working
- [ ] Database backups configured
- [ ] Health check endpoint working

---

### Week 3-4: Testing & Final Security Audit

#### Testing Suite (64 hours)

**Backend Tests (40 hours):**
- Unit tests (pytest)
- Integration tests
- Load tests (Locust)

**Frontend Tests (24 hours):**
- Component tests (Jest + React Testing Library)
- E2E tests (Playwright/Cypress)

**Manual Testing Checklist:**
- Complete user journey
- Payment flow
- Mobile responsiveness
- Edge cases

**Security Audit:**
- Hire penetration tester ($1,500-3,000)
- Fix all critical vulnerabilities
- Documentation updated

---

## 📋 PHASE 2: HIGH PRIORITY (Weeks 5-6)

### UI/UX Optimization (56 hours)

1. **Landing Page Redesign** (16 hours)
   - Stronger value proposition
   - Social proof section
   - How it works section
   - Pricing preview
   - FAQ section

2. **AI Insights Display** (20 hours)
   - Beautiful, engaging design
   - Visual hierarchy
   - Actionable suggestions
   - Emotional safety

3. **Conversion Funnel Optimization** (24 hours)
   - Onboarding flow
   - Drop-off point fixes
   - Mobile optimization

### Product Analytics (16 hours)

- Mixpanel/Amplitude setup
- Key metrics tracking
- Funnel analysis
- A/B testing framework

---

## 📋 PHASE 3: BETA LAUNCH (Weeks 7-8)

### Private Beta (20-30 couples)
- Personal network
- Collect feedback
- Fix critical bugs
- Gather testimonials

### Open Beta (50-100 couples)
- Wider audience
- UI/UX improvements
- Marketing content
- Conversion optimization

---

## 📋 PHASE 4: PUBLIC LAUNCH (Week 9+)

- Marketing campaign
- SEO and content
- Paid acquisition
- Scale infrastructure

---

## 🎯 TOP 10 PRIORITY TASKS (Do First)

1. **Legal Counsel** ($2-4K) - Start Privacy Policy & ToS
2. **Rate Limiting** (8h) - Prevent attacks
3. **Crisis Detection** (12h) - User safety
4. **MongoDB Security** (6h) - Data protection
5. **Production Hosting** (20h) - Vercel + Railway
6. **AI Prompt Rewrite** (8h) - Better quality
7. **Landing Page Redesign** (16h) - Conversion
8. **AI Insights Display** (20h) - Core product
9. **Test Suite** (40h) - Quality assurance
10. **Product Analytics** (16h) - Data-driven decisions

**Total Top 10:** 146 hours + $2-4K (3-4 weeks)

---

## 📊 Progress Tracking

### Critical Blockers Checklist:
- [ ] Legal documents drafted and implemented
- [ ] Security vulnerabilities fixed
- [ ] AI safety detection implemented
- [ ] Production infrastructure deployed
- [ ] Data export/deletion features built
- [ ] Monitoring configured
- [ ] CI/CD pipeline working

### High Priority Checklist:
- [ ] Landing page optimized
- [ ] AI insights beautifully designed
- [ ] Conversion funnel optimized
- [ ] Product analytics implemented
- [ ] Test suite built

---

## 💰 Investment Summary

| Category | Hours | Cost | Priority |
|----------|-------|------|----------|
| **Critical** | 135h | $2-4K | 🔴 Blocking |
| **High Priority** | 136h | $3-6K | 🟡 Before Launch |
| **Recommended** | 114h | $2-6K | 🟢 For Success |
| **TOTAL** | **385h** | **$7-16K** | **5-7 weeks** |

---

## 🚀 Next Steps

**This Week:**
1. Read full EXPERT_REVIEW_REPORT.md
2. Prioritize which issues to tackle first
3. Contact Australian legal counsel
4. Start security fixes (rate limiting, SECRET_KEY)
5. Begin AI safety implementation

**Want me to start implementing?**
- I can begin with **security fixes** (rate limiting, SECRET_KEY validation)
- I can start **AI safety detection** implementation
- I can create **legal document templates** (still need attorney review)
- I can set up **data export/deletion** endpoints

**Your call - where do you want to start?** 🎯

