# Retention Strategy - Keeping Couples Engaged Beyond Arguments

## The Core Challenge

**Problem:** If couples resolve arguments successfully and don't argue frequently, why would they keep paying?  
**Solution:** Transform Heka from a "reactive argument resolver" to a **"proactive relationship health platform"**

---

## 1. Account Model Decision ✅

### Recommendation: **Individual Accounts Per Partner** (Flo App Model)

**Decision:** Each partner has their own account on their own device, linked through a shared couple profile.

**Rationale:**
- ✅ **Privacy:** Each partner can access their perspective independently
- ✅ **Notifications:** Individual push notifications per device
- ✅ **Personalization:** Tailored content and insights per user
- ✅ **Flexibility:** Partners can engage at different times
- ✅ **Security:** Each user has their own credentials
- ✅ **Better UX:** Native mobile experience per person
- ✅ **Data Ownership:** Clear separation of personal vs. shared data

**How It Works:**
1. Partner 1 creates account and couple profile
2. Partner 1 invites Partner 2 (via email/phone)
3. Partner 2 creates their own account and joins couple profile
4. Both partners see shared data (arguments, resolutions) but have individual accounts
5. Subscription can be managed by either partner (shared billing)

**Technical Implementation:**
- Already designed in schema: `user1_id`, `user2_id` in Couples table
- Each user authenticates separately
- Shared data linked via `couple_id`
- Individual privacy settings per user

---

## 2. Retention Features: Beyond Arguments

### 2.1 Proactive Relationship Maintenance

#### Feature: **Relationship Health Check-Ins** 🔄
- **Frequency:** Weekly or bi-weekly prompts
- **Function:** Quick 2-minute check-in questions
  - "How are you feeling about communication this week?"
  - "Rate your relationship satisfaction (1-10)"
  - "Any small tensions brewing?"
- **Value:** Catch issues before they become arguments
- **AI Response:** Personalized insights based on check-in patterns

#### Feature: **Preventive Communication Prompts** 💬
- **Function:** AI suggests proactive conversations
  - "You haven't discussed finances in 3 weeks - consider a check-in"
  - "Based on past patterns, this might be a good time to talk about [topic]"
- **Delivery:** Push notifications to both partners
- **Value:** Prevent arguments before they happen

#### Feature: **Relationship Goal Setting & Tracking** 🎯
- **Function:** Couples set relationship goals together
  - Improve communication frequency
  - Plan date nights
  - Work on specific areas (intimacy, trust, etc.)
- **Tracking:** Progress metrics, milestone celebrations
- **AI Insights:** Suggestions for achieving goals
- **Value:** Ongoing engagement, measurable improvement

### 2.2 Relationship Enrichment Features

#### Feature: **Weekly Relationship Insights** 📊
- **Function:** AI-generated insights based on:
  - Argument patterns and trends
  - Resolution success rates
  - Communication frequency
  - Relationship check-in data
- **Delivery:** Weekly digest email/app notification
- **Value:** "Even when we're not arguing, Heka helps us understand our relationship"

#### Feature: **Communication Exercises** 📚
- **Function:** Guided exercises and activities
  - "Active Listening Practice" (10 minutes)
  - "Gratitude Sharing" prompts
  - "Understanding Your Partner's Love Language"
  - "Conflict Style Assessment"
- **Delivery:** Weekly suggestions, on-demand library
- **Value:** Continuous learning and improvement

#### Feature: **Date Night & Activity Suggestions** 💑
- **Function:** Personalized suggestions based on:
  - Past successful activities
  - Relationship goals
  - Local events (future: integration with local services)
- **Delivery:** Weekly recommendations
- **Value:** Positive relationship building, not just conflict resolution

#### Feature: **Milestone Celebrations** 🎉
- **Function:** Track and celebrate:
  - Arguments successfully resolved
  - Relationship milestones (anniversaries, goals achieved)
  - Communication streaks (e.g., "7 days of open communication")
- **Value:** Positive reinforcement, gamification

### 2.3 Value-Added Content

#### Feature: **Relationship Library** 📖
- **Articles:** Evidence-based relationship advice
- **Expert Content:** Guest posts from relationship coaches/therapists
- **Case Studies:** Anonymized success stories
- **Video Content:** Short educational videos (future)
- **Value:** Premium content keeps users engaged between conflicts

#### Feature: **Relationship Patterns & Insights** 🔍
- **Function:** AI identifies patterns over time:
  - "You tend to argue more about finances in November (tax season)"
  - "Your communication improved 40% since using active listening exercises"
  - "Common triggers: [identified patterns]"
- **Delivery:** Monthly relationship report
- **Value:** Deep insights that justify ongoing subscription

### 2.4 Social & Community Features (Future)

#### Feature: **Anonymous Community** (Optional)
- **Function:** Share experiences, learn from others
- **Privacy:** Fully anonymized, no identifying information
- **Value:** Sense of community, ongoing engagement

---

## 3. Engagement Tactics

### 3.1 Smart Notifications

**Types:**
1. **Proactive Check-ins:** "Time for your weekly relationship check-in"
2. **Preventive Alerts:** "You haven't logged in this week - anything brewing?"
3. **Success Reminders:** "3 weeks since your last argument - great progress!"
4. **Goal Updates:** "You're 75% toward your communication goal"
5. **Insight Alerts:** "Your weekly relationship insights are ready"

**Frequency:** 
- Maximum 2-3 per week per user
- Personalized based on usage patterns
- Opt-out for "quiet weeks"

### 3.2 Gamification Elements

- **Achievement Badges:**
  - "Conflict Resolver" (10 arguments resolved)
  - "Communication Champion" (30 days consistent check-ins)
  - "Goal Achiever" (completed relationship goals)
  - "Streak Master" (60 days without arguments)

- **Progress Visualization:**
  - Relationship health score over time
  - Communication frequency charts
  - Resolution success rate trends

### 3.3 Personalized Value Delivery

**AI-Powered Personalization:**
- Content recommendations based on:
  - Past argument categories
  - Communication style
  - Relationship goals
  - Engagement patterns

**Example:**
- Couple argues about finances → Get financial communication exercises
- Couple values quality time → Get date night suggestions
- Couple struggles with communication → Get active listening content

---

## 4. Updated Subscription Tiers

### Free Tier (No Change)
- 1 argument resolution
- Basic features

### Basic Subscription ($9.99/month)
**Core Features:**
- Unlimited argument resolutions
- Basic AI mediation
- Historical argument tracking
- **NEW:** Weekly relationship check-ins
- **NEW:** Monthly relationship insights email
- **NEW:** Basic communication exercises (5 exercises/month)
- Email support

### Premium Subscription ($19.99/month)
**Everything in Basic, plus:**
- Advanced AI insights
- Action plan creation and tracking
- **NEW:** Unlimited communication exercises
- **NEW:** Relationship goal setting & tracking
- **NEW:** Weekly relationship insights with AI analysis
- **NEW:** Preventive communication prompts
- **NEW:** Date night & activity suggestions
- **NEW:** Relationship pattern analysis
- **NEW:** Achievement badges & progress tracking
- **NEW:** Access to relationship library
- Priority support
- Export resolution reports
- Follow-up reminders

---

## 5. Value Proposition Reframing

### Old Positioning (Reactive):
❌ "Resolve arguments when they happen"

### New Positioning (Proactive + Reactive):
✅ **"Build a stronger relationship and resolve conflicts when they arise"**

**Key Messages:**
- "Stay connected even when things are going well"
- "Prevent arguments before they happen"
- "Understand your relationship patterns"
- "Continuous improvement, not just crisis management"

---

## 6. Retention Metrics to Track

### Engagement Metrics
- **Weekly Active Users (WAU):** Target 60%+
- **Monthly Active Users (MAU):** Target 80%+
- **Check-in Completion Rate:** Target 50%+
- **Content Consumption:** Articles/exercises viewed per user
- **Feature Usage:** Which retention features drive engagement?

### Retention Metrics
- **Churn Rate:** Target <10% monthly after month 3
- **Feature-to-Retention Correlation:** Which features reduce churn?
- **Time Between Arguments:** Track improvement over time
- **Relationship Health Score Trend:** Are scores improving?

---

## 7. Onboarding Strategy

### Updated Onboarding Flow

**Step 1:** Welcome & Value Proposition
- "Build a stronger relationship, prevent conflicts, resolve arguments"

**Step 2:** Individual Account Creation
- Each partner creates their own account
- Age verification (16+)

**Step 3:** Couple Profile Setup
- Partner 1 creates couple profile
- Invites Partner 2
- Partner 2 joins with their account

**Step 4:** Relationship Goal Setting (New!)
- "What would you like to improve in your relationship?"
- Set 1-3 initial goals
- This sets up ongoing engagement

**Step 5:** First Check-In (New!)
- Quick relationship satisfaction check
- Demonstrates proactive features immediately

**Step 6:** Tutorial
- Show argument resolution (if needed)
- Show check-ins and goals (new focus)

---

## 8. Communication Strategy

### Messaging Themes

**Week 1 (Post-Signup):**
- "Welcome! Here's how to get started"
- "Set your first relationship goal"

**Week 2-4:**
- "Time for your weekly check-in"
- "Here are this week's relationship insights"
- "Try this communication exercise"

**Month 2+:**
- "Great progress on your relationship goals!"
- "Your monthly relationship report is ready"
- "3 weeks without arguments - keep it up!"

**When Arguments Occur:**
- "We're here to help you resolve this"
- (After resolution) "Great job! Let's work on preventing similar issues"

---

## 9. Implementation Priority

### MVP (Must Have for Retention)
1. ✅ Individual accounts per partner (already designed)
2. 🔄 Weekly relationship check-ins
3. 🔄 Basic relationship insights
4. 🔄 Relationship goal setting

### Post-MVP (High Priority)
1. Communication exercises library
2. Preventive communication prompts
3. Achievement badges & gamification
4. Relationship library content

### Future (Nice to Have)
1. Date night suggestions (with local integrations)
2. Community features
3. Video content
4. Advanced pattern analysis

---

## 10. Success Criteria

### Retention Goals
- **Month 1-2 Churn:** <25% (vs. 30% baseline)
- **Month 3-6 Churn:** <12% (vs. 15% baseline)
- **Month 7+ Churn:** <8% (vs. 10% baseline)
- **Annual Retention:** 50%+ (vs. 40% baseline)

### Engagement Goals
- **Weekly Active Rate:** 60%+ of paid subscribers
- **Check-in Completion:** 50%+ weekly
- **Content Consumption:** 2+ items per user per month
- **Goal Achievement Rate:** 40%+ of set goals completed

---

## Summary

**Key Insight:** Heka should be positioned as a **relationship health platform**, not just an argument resolver.

**Core Strategy:**
1. **Proactive Features:** Check-ins, goals, exercises, insights
2. **Prevention:** Catch issues before they become arguments
3. **Enrichment:** Build stronger relationships, not just resolve conflicts
4. **Continuous Value:** Weekly/monthly engagement even without arguments
5. **Individual Accounts:** Privacy, personalization, better UX

**Result:** Couples see value in maintaining subscription even during "good times" because Heka helps them:
- Understand their relationship better
- Prevent future conflicts
- Build stronger connections
- Track progress and growth

---

**This transforms Heka from a "reactive tool" to a "proactive relationship partner."**

