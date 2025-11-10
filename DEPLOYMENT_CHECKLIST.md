# Deployment Checklist - App Store Requirements

## Apple App Store Requirements ✅

### Technical Requirements:
- [ ] **HTTPS API endpoints** - Backend must use HTTPS (not HTTP)
- [ ] **24/7 Availability** - App must be accessible (cloud hosting required)
- [ ] **No crashes on launch** - App must function properly
- [ ] **Privacy Policy** - Required (see LEGAL_COMPLIANCE.md)
- [ ] **Data Collection Disclosure** - Must disclose what data you collect

### App Store Review:
- [ ] **App functions as described**
- [ ] **No broken features**
- [ ] **User authentication works**
- [ ] **API endpoints respond correctly**

**Database:** ✅ Not required to disclose - App stores don't care

---

## Google Play Store Requirements ✅

### Technical Requirements:
- [ ] **HTTPS API endpoints** - Backend must use HTTPS
- [ ] **Privacy Policy** - Required (accessible via app)
- [ ] **Data Safety section** - Describe data collection and usage
- [ ] **App must function** - No crashes, proper functionality

### Play Store Review:
- [ ] **App works correctly**
- [ ] **All features functional**
- [ ] **No misleading claims**

**Database:** ✅ Not required to disclose - Play Store doesn't care

---

## What App Stores Care About:

### ✅ Required:
1. **App functionality** - Does it work?
2. **Security** - HTTPS, secure data handling
3. **Privacy** - Privacy policy, data disclosure
4. **Availability** - App accessible when users try to use it
5. **User experience** - Quality, no crashes

### ❌ NOT Required:
- Database type (PostgreSQL, MongoDB, etc.)
- Hosting provider details
- Technical architecture
- Server infrastructure

---

## Pre-Launch Checklist

### Backend (Before Mobile App Submission):
- [ ] Backend deployed to cloud (Railway/Render/etc.)
- [ ] HTTPS enabled (automatic with hosting)
- [ ] API endpoints tested and working
- [ ] Health check endpoint working
- [ ] Error handling in place
- [ ] Rate limiting configured (prevent abuse)

### Mobile App:
- [ ] Points to production HTTPS API URL
- [ ] Handles API errors gracefully
- [ ] Shows appropriate error messages
- [ ] Works offline (basic caching, error handling)

### Legal/Compliance:
- [ ] Privacy Policy published (web + in-app)
- [ ] Terms of Service published
- [ ] Data collection disclosed (App Store/Play Store)
- [ ] Age verification (16+) implemented

---

## Deployment Timeline

### Sprint 6 (Week 14) - Launch Prep:
1. Deploy backend to cloud hosting
2. Set up MongoDB Atlas (production cluster)
3. Configure HTTPS/SSL
4. Test all API endpoints
5. Update mobile apps with production API URL
6. Submit to App Store/Play Store

**Timeline:** 1-2 weeks for app store review + deployment

---

**Status:** All requirements achievable. No database-specific requirements for app stores.


