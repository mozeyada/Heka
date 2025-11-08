# Code Review Findings - Heka Project

## Critical Severity Issues

### 1. CWE-94 - Unsanitized input is run as code
- **File**: `/home/zeyada/Heka/frontend/.next/static/chunks/webpack.js`
- **Lines**: 370-371

### 2. CWE-94 - Unsanitized input is run as code
- **File**: `/home/zeyada/Heka/frontend/.next/static/chunks/fallback/webpack.js`
- **Lines**: 302-303

### 3. CWE-94 - Unsanitized input is run as code
- **File**: `/home/zeyada/Heka/frontend/.next/server/webpack-runtime.js`
- **Lines**: 197-198

### 4. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/subscription_service.py`
- **Lines**: 33-34

### 5. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/subscription_service.py`
- **Lines**: 72-74

### 6. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/settings/page.tsx`
- **Lines**: 11-12

### 7. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/perspectives.py`
- **Lines**: 152-153

### 8. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/.github/workflows/ci-cd.yml`
- **Lines**: 45-86
- **Description**: The entire backend-tests job (lines 45-86) uses `continue-on-error: true` for critical steps like linting and tests. This means failures won't stop the pipeline, potentially allowing broken code to be deployed.

### 9. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/.github/workflows/ci-cd.yml`
- **Lines**: 96-115

### 10. Performance inefficiencies detected in code
- **File**: `/home/zeyada/Heka/backend/app/services/ai_service.py`
- **Lines**: 171-172

### 11. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/checkins.py`
- **Lines**: 67-68

### 12. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/dashboard/page.tsx`
- **Lines**: 50-54

### 13. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/email_service.py`
- **Lines**: 86-87

### 14. CWE-327,937,1035 - Package Vulnerability
- **File**: `/home/zeyada/Heka/backend/requirements.txt`
- **Lines**: 18-19
- **Package**: Cryptography package vulnerability

### 15. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/components/LoadingSpinner.tsx`
- **Lines**: 31-32

### 16. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 38-39

### 17. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/goals.py`
- **Lines**: 246-247

## High Severity Issues

### 1. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/subscription_service.py`
- **Lines**: 23-24

### 2. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/subscription_service.py`
- **Lines**: 62-63

### 3. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/perspectives.py`
- **Lines**: 137-144

### 4. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/ai_service.py`
- **Lines**: 192-195

### 5. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/ai_service.py`
- **Lines**: 186-187

### 6. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/ai_service.py`
- **Lines**: 279-282

### 7. CWE-89 - SQL injection
- **File**: `/home/zeyada/Heka/backend/app/api/checkins.py`
- **Lines**: 136-140

### 8. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/checkins.py`
- **Lines**: 114-127

### 9. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/checkins.py`
- **Lines**: 161-162

### 10. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/dashboard/page.tsx`
- **Lines**: 27-28

### 11. Performance inefficiencies detected in code
- **File**: `/home/zeyada/Heka/backend/app/services/email_service.py`
- **Lines**: 104-108

### 12. CWE-117,93 - Log injection
- **File**: `/home/zeyada/Heka/backend/app/services/email_service.py`
- **Lines**: 33-34

### 13. Insufficient or improper logging found
- **File**: `/home/zeyada/Heka/backend/app/services/email_service.py`
- **Lines**: 35-36

### 14. CWE-770,937,1035 - Package Vulnerability
- **File**: `/home/zeyada/Heka/backend/requirements.txt`
- **Lines**: 6-7

### 15. CWE-292,696,937,1035 - Package Vulnerability
- **File**: `/home/zeyada/Heka/backend/requirements.txt`
- **Lines**: 14-15

### 16. CWE-125,937,1035 - Package Vulnerability
- **File**: `/home/zeyada/Heka/backend/requirements.txt`
- **Lines**: 13-14

### 17. CWE-400,937,1035,1333 - Package Vulnerability
- **File**: `/home/zeyada/Heka/backend/requirements.txt`
- **Lines**: 4-5

### 18. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/components/LoadingSpinner.tsx`
- **Lines**: 41-42

### 19. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/components/LoadingSpinner.tsx`
- **Lines**: 30-31

### 20. Inconsistent or unclear naming detected
- **File**: `/home/zeyada/Heka/frontend/src/components/LoadingSpinner.tsx`
- **Lines**: 16-17

### 21. CWE-89 - SQL injection
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 61-65

### 22. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 140-141

### 23. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 52-53

### 24. CWE-89 - SQL injection
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 116-117

### 25. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 104-106

### 26. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 86-87

### 27. CWE-89 - SQL injection
- **File**: `/home/zeyada/Heka/backend/app/services/usage_service.py`
- **Lines**: 51-58

### 28. CWE-89 - SQL injection
- **File**: `/home/zeyada/Heka/backend/app/api/goals.py`
- **Lines**: 129-130

### 29. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/goals.py`
- **Lines**: 178-179

### 30. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/goals.py`
- **Lines**: 341-351

### 31. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/main.py`
- **Lines**: 27-28

### 32. Performance inefficiencies detected in code
- **File**: `/home/zeyada/Heka/backend/app/main.py`
- **Lines**: 19-20

### 33. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/main.py`
- **Lines**: 101-102

### 34. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/subscription/page.tsx`
- **Lines**: 222-223

### 35. CWE-79,80 - Cross-site scripting
- **File**: `/home/zeyada/Heka/frontend/src/app/subscription/page.tsx`
- **Lines**: 78-79

### 36. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/invitation.py`
- **Lines**: 48-49

### 37. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/ai_insight.py`
- **Lines**: 57-58

### 38. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/ai_insight.py`
- **Lines**: 59-60

### 39. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/ai_insight.py`
- **Lines**: 26-27

### 40. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/register/page.tsx`
- **Lines**: 156-157

### 41. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/register/page.tsx`
- **Lines**: 175-176

### 42. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/lib/api.ts`
- **Lines**: 85-87

### 43. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/lib/api.ts`
- **Lines**: 94-101

### 44. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/lib/api.ts`
- **Lines**: 17-18

### 45. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/lib/api.ts`
- **Lines**: 74-79

### 46. CWE-79,80 - Cross-site scripting
- **File**: `/home/zeyada/Heka/frontend/src/lib/api.ts`
- **Lines**: 74-75

### 47. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/user.py`
- **Lines**: 67-68

### 48. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/user.py`
- **Lines**: 22-23

### 49. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/user.py`
- **Lines**: 28-29

### 50. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/page.tsx`
- **Lines**: 11-15

### 51. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/subscriptions.py`
- **Lines**: 256-257

### 52. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/subscriptions.py`
- **Lines**: 283-302

### 53. Readability and maintainability issues detected
- **File**: `/home/zeyada/Heka/backend/app/api/subscriptions.py`
- **Lines**: 243-250

### 54. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/subscriptions.py`
- **Lines**: 257-259

### 55. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/couples/create/page.tsx`
- **Lines**: 97-105

### 56. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/couples/create/page.tsx`
- **Lines**: 59-73

### 57. CWE-918 - Server side request forgery
- **File**: `/home/zeyada/Heka/frontend/src/app/couples/create/page.tsx`
- **Lines**: 65-66

### 58. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/argument.py`
- **Lines**: 76-77

### 59. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/argument.py`
- **Lines**: 74-75

### 60. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/auth.py`
- **Lines**: 110-122

### 61. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/auth.py`
- **Lines**: 87-88

### 62. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/config.py`
- **Lines**: 22-23

### 63. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/config.py`
- **Lines**: 15-16

### 64. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/arguments/[id]/page.tsx`
- **Lines**: 59-60

### 65. CWE-918 - Server side request forgery
- **File**: `/home/zeyada/Heka/frontend/src/app/arguments/[id]/page.tsx`
- **Lines**: 77-78

### 66. CWE-918 - Server side request forgery
- **File**: `/home/zeyada/Heka/frontend/src/app/arguments/[id]/page.tsx`
- **Lines**: 98-99

### 67. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/relationship_checkin.py`
- **Lines**: 62-67

### 68. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/couples.py`
- **Lines**: 163-164

### 69. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/couples.py`
- **Lines**: 236-242

### 70. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/couples.py`
- **Lines**: 91-96

### 71. CWE-89 - SQL injection
- **File**: `/home/zeyada/Heka/backend/app/api/couples.py`
- **Lines**: 204-208

### 72. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/couples.py`
- **Lines**: 127-128

### 73. CWE-89 - SQL injection
- **File**: `/home/zeyada/Heka/backend/app/api/couples.py`
- **Lines**: 52-57

### 74. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/store/argumentsStore.ts`
- **Lines**: 16-20

### 75. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/perspective.py`
- **Lines**: 45-46

### 76. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/models/perspective.py`
- **Lines**: 47-50

### 77. CWE-918 - Server side request forgery
- **File**: `/home/zeyada/Heka/frontend/src/app/invite/[token]/page.tsx`
- **Lines**: 83-84

### 78. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/arguments.py`
- **Lines**: 198-205

### 79. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/arguments.py`
- **Lines**: 103-114

### 80. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/ai_mediation.py`
- **Lines**: 113-120

### 81. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/store/authStore.ts`
- **Lines**: 98-105

### 82. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/app/arguments/create/page.tsx`
- **Lines**: 59-63

### 83. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/users.py`
- **Lines**: 147-148

### 84. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/api/users.py`
- **Lines**: 77-78

### 85. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/services/safety_service.py`
- **Lines**: 57-62

### 86. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/db/indexes.py`
- **Lines**: 6-67

### 87. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/frontend/src/components/AuthInitializer.tsx`
- **Lines**: 13-14

### 88. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/core/sanitization.py`
- **Lines**: 33-53

### 89. Inadequate error handling detected
- **File**: `/home/zeyada/Heka/backend/app/core/security.py`
- **Lines**: 16-18

## Medium Severity Issues

### CI/CD Workflow Issue (Lines 52-53)
- **File**: `/home/zeyada/Heka/.github/workflows/ci-cd.yml`
- **Lines**: 52-53
- **Description**: Inadequate error handling in the "Run tests" step

### Package Vulnerabilities
- **File**: `/home/zeyada/Heka/backend/requirements.txt`
- **Lines**: 44-45 - CWE-200,937,1035 - Package Vulnerability
- **Lines**: 39-40 - CWE-75,937,1035,1333 - Package Vulnerability

### Multiple Medium Severity Issues in Various Files
- Performance inefficiencies
- Readability and maintainability issues
- Inadequate error handling
- Insufficient or improper logging
- Missing or incomplete documentation

---

## Summary Statistics
- **Total Findings**: 300 (limited from larger set)
- **Critical**: 17
- **High**: 89
- **Medium**: 194

## Recommendations
1. **Immediate**: Fix all Critical and High severity security vulnerabilities (SQL injection, XSS, SSRF, code injection)
2. **High Priority**: Update vulnerable packages in requirements.txt
3. **Medium Priority**: Improve error handling across the codebase
4. **Ongoing**: Address readability and maintainability issues

---
Generated: $(date)
