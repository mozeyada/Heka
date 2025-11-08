# Business Model - Heka

## Executive Summary

Heka operates on a **freemium subscription model** with a strategic free tier designed to demonstrate value and convert users to paid subscriptions. The model prioritizes user acquisition through low barrier to entry, then monetizes through recurring subscriptions.

---

## 1. Revenue Model

### 1.1 Freemium Strategy

**Free Tier:**
- **Offering:** 7-day free trial with 5 argument resolution limit
- **Purpose:** 
  - Demonstrate Heka's value proposition (arguments + retention features)
  - Allow users to experience full workflow over time
  - Experience weekly check-ins and goal tracking
  - Reduce friction for sign-ups (no credit card required)
  - Enable word-of-mouth marketing
- **Features Included:**
  - Up to 5 argument resolutions
  - Weekly relationship check-ins
  - Relationship goal setting and tracking
  - Full AI mediation and insights
  - Historical argument tracking
- **Limitations:**
  - 5 argument resolution limit (hard cap)
  - 7-day time limit
  - After trial: Upgrade required to continue

### 1.2 Subscription Tiers (Proposed)

#### Tier 1: Basic Subscription
- **Price:** AUD $9.99/month or AUD $99/year (save ~17%)
- **Features:**
  - Unlimited argument resolutions
  - Basic AI mediation
  - Historical argument tracking
  - Resolution progress metrics
  - **Weekly relationship check-ins**
  - **Monthly relationship insights email**
  - **Basic communication exercises (5/month)**
  - Email support

#### Tier 2: Premium Subscription
- **Price:** AUD $19.99/month or AUD $199/year (save ~17%)
- **Features:**
  - Everything in Basic
  - Advanced AI insights with deeper analysis
  - Action plan creation and tracking
  - **Unlimited communication exercises**
  - **Relationship goal setting & tracking**
  - **Weekly relationship insights with AI analysis**
  - **Preventive communication prompts**
  - **Date night & activity suggestions**
  - **Relationship pattern analysis**
  - **Achievement badges & progress tracking**
  - **Access to relationship library**
  - Priority support
  - Export resolution reports
  - Follow-up reminders
  - Relationship health trends

#### Tier 3: Couples Plus (Future)
- **Price:** AUD $29.99/month or AUD $299/year
- **Features:**
  - Everything in Premium
  - Voice input support
  - Video session preparation tools
  - Therapist referral integration
  - Personalized communication strategies
  - Advanced analytics dashboard

**Note:** Pricing to be validated through market research and testing.

---

## 2. Pricing Strategy Rationale

### 2.1 Value-Based Pricing
- **Positioning:** Premium relationship tool, not commodity app
- **Comparison:** Professional therapy ($100-200/hour) vs. Heka ($10-20/month)
- **Value Proposition:** Affordable alternative/complement to therapy

### 2.2 Market Research Considerations
- Australian average app subscription: $5-15/month
- Relationship/wellness apps: $10-30/month
- Professional services: $100-200/hour

### 2.3 Conversion Strategy
- Free tier creates immediate value demonstration
- Low monthly price reduces purchase friction
- Annual plans provide cost savings + higher LTV
- Premium tier offers clear upgrade path

---

## 3. Cost Structure

### 3.1 Variable Costs (Per User)

**AI API Costs (OpenAI GPT-4):**
- Estimated: $0.10-0.50 per argument resolution
- Depends on:
  - Argument complexity
  - Token usage
  - Response length

**Infrastructure Costs:**
- Database storage: ~$0.01/user/month
- Bandwidth: ~$0.02/user/month
- Compute: Variable based on usage

**Payment Processing:**
- Stripe fees: ~2.9% + $0.30 per transaction (Australia)
- Refund costs (minimal if managed well)

**Total Variable Cost per User (Basic Tier):**
- Low usage: ~$0.50/user/month
- Average usage (3 arguments/month): ~$1.50/user/month
- High usage (10+ arguments/month): ~$3.00/user/month

### 3.2 Fixed Costs

**Monthly Fixed Costs (MVP Scale):**
- Cloud hosting (AWS/GCP): $50-200
- Database (PostgreSQL): $20-100
- Monitoring & Analytics: $50-100
- Domain & SSL: $10
- Email services: $20-50
- Legal/Compliance tools: $50-100

**Total Fixed Costs:** ~$200-560/month (scales with users)

**Team Costs (if applicable):**
- Development: Variable
- Support: Variable
- Marketing: Variable

### 3.3 Break-Even Analysis

**Assumptions:**
- Average subscription: $15/month (mix of tiers)
- Variable cost per user: $1.50/month (average usage)
- Fixed costs: $500/month

**Break-Even Calculation:**
- Contribution margin: $15 - $1.50 = $13.50/user/month
- Break-even users: $500 / $13.50 = ~37 paid users

**Scalability:**
- 100 users: Profit ~$850/month
- 500 users: Profit ~$6,250/month
- 1,000 users: Profit ~$13,000/month

---

## 4. Customer Acquisition Strategy

### 4.1 Acquisition Channels

**Organic:**
- Word-of-mouth (partners invite partners)
- App store optimization (iOS/Android)
- SEO for web platform
- Content marketing (relationship advice blog)
- Social media presence

**Paid:**
- Google Ads (targeted: "couples counseling", "relationship help")
- Facebook/Instagram ads (relationship-focused targeting)
- Partnership with relationship influencers
- Podcast sponsorships (relationship/wellness podcasts)

**Partnerships:**
- Relationship coaches (referral partnerships)
- Dating apps (post-match relationship support)
- Wellness platforms
- University counseling centers (student relationships)

### 4.2 Customer Acquisition Cost (CAC)

**Target CAC:**
- Free tier: $0-5 (organic/low-cost acquisition)
- Paid users: $20-50 (to achieve 3-4 month payback)

**CAC Calculation:**
- Lifetime Value (LTV): $180 (12 months × $15 average)
- Target LTV:CAC ratio: 3:1 to 4:1

### 4.3 Conversion Funnel

**Expected Conversion Rates:**
1. Visitor → Sign-up: 5-10%
2. Sign-up → Complete free case: 40-60%
3. Free case → Paid subscription: 10-20%
4. Paid subscription → Retention (month 2+): 70-85%

**Overall Conversion:** 0.35% - 1.2% visitor to paid user

---

## 5. Retention Strategy

### 5.1 Churn Mitigation

**Retention Tactics:**
- **Proactive Features:** Weekly check-ins, relationship goals, communication exercises
- **Preventive Value:** Catch issues before they become arguments
- **Continuous Engagement:** Monthly insights, achievement badges, progress tracking
- **Relationship Enrichment:** Date suggestions, exercises, library content
- **Value Reminders:** Email when not using for 2 weeks
- **Success Stories:** Share resolution wins
- **Feature Updates:** Regular improvements
- **Engagement:** Follow-up on past arguments
- **Discounts:** Offer annual plan discounts

**New Positioning:** Relationship health platform (not just argument resolver)

**Expected Churn:**
- Month 1-2: 20-30% (highest churn)
- Month 3-6: 10-15% monthly
- Month 7+: 5-10% monthly

**Target Retention:**
- 70% retention at month 2
- 50% retention at month 6
- 40% retention at month 12

### 5.2 Expansion Revenue

**Up-sell Opportunities:**
- Basic → Premium upgrade
- Annual plan promotions
- Gift subscriptions (future)
- Corporate/group plans (future)

---

## 6. Financial Projections (Year 1)

### 6.1 Conservative Scenario

**Assumptions:**
- Month 1: 50 sign-ups, 20 paid users
- Growth: 20% month-over-month
- Average revenue per user: $12/month
- Churn: 15% monthly

**Year 1 Projection:**
- Total users: ~500 sign-ups
- Paid users (peak): ~150
- Monthly Recurring Revenue (MRR): ~$1,800/month
- Annual Revenue: ~$15,000

### 6.2 Optimistic Scenario

**Assumptions:**
- Month 1: 200 sign-ups, 50 paid users
- Growth: 30% month-over-month
- Average revenue per user: $15/month
- Churn: 10% monthly

**Year 1 Projection:**
- Total users: ~2,000 sign-ups
- Paid users (peak): ~500
- Monthly Recurring Revenue (MRR): ~$7,500/month
- Annual Revenue: ~$60,000

### 6.3 Revenue Breakdown (Optimistic Year 1)

- Subscription revenue: $60,000
- Less: Payment processing (3%): -$1,800
- Less: Variable costs (AI, infrastructure): -$9,000
- Less: Fixed costs: -$6,000
- Less: Marketing: -$10,000
- **Net Revenue:** ~$33,200

---

## 7. Unit Economics

### 7.1 Key Metrics

**Per User Economics (Average):**
- Revenue: $15/month
- Variable Cost: $1.50/month
- Contribution Margin: $13.50/month
- Contribution Margin %: 90%

**CAC Payback Period:**
- Target: 3-4 months
- Formula: CAC / Contribution Margin = $40 / $13.50 = ~3 months

**Lifetime Value (LTV):**
- Average lifetime: 8 months (with 15% monthly churn)
- LTV: 8 × $13.50 = $108 (after variable costs)
- LTV:CAC Ratio: $108 / $40 = 2.7:1 (target 3:1+)

---

## 8. Go-to-Market Strategy

### 8.1 Launch Strategy (Australia)

**Phase 1: Soft Launch (Months 1-2)**
- Limited beta users (50-100)
- Gather feedback
- Refine product
- Build testimonials

**Phase 2: Local Launch (Months 3-4)**
- Focus on major cities (Sydney, Melbourne, Brisbane)
- Local marketing
- Partnership with local relationship coaches
- PR and media outreach

**Phase 3: National Expansion (Months 5-6)**
- Expand to all Australian cities
- Digital marketing campaign
- App store optimization
- Influencer partnerships

**Phase 4: Scale (Months 7-12)**
- Optimize conversion funnel
- Expand marketing channels
- International expansion consideration

### 8.2 Marketing Budget (Year 1)

**Total Marketing Budget:** $10,000-20,000
- Digital ads: $5,000-10,000
- Content creation: $2,000-3,000
- PR/Influencers: $2,000-4,000
- Events/Partnerships: $1,000-3,000

---

## 9. Key Performance Indicators (KPIs)

### 9.1 Acquisition Metrics
- Sign-ups per month
- Sign-ups by channel
- CAC by channel
- Free tier completion rate

### 9.2 Conversion Metrics
- Free → Paid conversion rate
- Trial completion rate
- Time to first paid subscription

### 9.3 Retention Metrics
- Monthly churn rate
- Retention by cohort
- Average customer lifetime
- Net Revenue Retention (NRR)

### 9.4 Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Average Revenue Per User (ARPU)
- LTV and LTV:CAC ratio

### 9.5 Product Metrics
- Arguments resolved per user
- Resolution success rate
- Feature usage rates
- User satisfaction (NPS)

---

## 10. Pricing Experiments & Optimization

### 10.1 A/B Testing Opportunities
- Free tier: 1 case vs. 2 cases
- Pricing: $9.99 vs. $12.99 vs. $14.99
- Annual discount: 10% vs. 17% vs. 20%
- Feature differentiation between tiers

### 10.2 Pricing Psychology
- Anchoring: Show Premium tier first (make Basic look affordable)
- Annual plan emphasis (higher LTV, lower churn)
- Limited-time promotions (annual plans)

---

## 11. Future Revenue Streams (Post-MVP)

### 11.1 Potential Additions
- **Enterprise/B2B:** Corporate relationship wellness programs
- **White-label:** License to other platforms
- **API Access:** Third-party integrations
- **Professional Services:** Therapist marketplace integration
- **Data Insights:** Anonymized relationship trend reports (research)

---

## 12. Risks & Mitigation

### 12.1 Business Model Risks

**Risk:** Low free-to-paid conversion
- **Mitigation:** Optimize free tier value, improve onboarding, A/B test conversion flows

**Risk:** High churn rate
- **Mitigation:** Improve product value, engagement campaigns, annual plan incentives

**Risk:** AI costs exceed projections
- **Mitigation:** Optimize prompts, implement caching, usage-based tier limits

**Risk:** Competition from free alternatives
- **Mitigation:** Focus on unique value (dual-perspective mediation), build brand

---

## Summary

Heka's freemium subscription model balances user acquisition (free tier) with monetization (subscriptions). The model is designed for:

1. **Low barrier to entry** (free tier)
2. **High value demonstration** (complete case resolution)
3. **Clear upgrade path** (multiple subscription tiers)
4. **Strong unit economics** (high contribution margins)
5. **Scalable growth** (recurring revenue model)

**Key Success Factors:**
- Achieve 10-20% free-to-paid conversion
- Maintain <15% monthly churn
- Keep CAC below $50 with 3+ month payback
- Scale to 500+ paid users in Year 1

