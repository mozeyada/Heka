# How to Find GitHub Secrets - Step by Step

## ⚠️ Important: GitHub Secrets is NOT a VS Code Extension!

**GitHub Secrets** is a feature on **GitHub.com** (the website), not in VS Code.

---

## ✅ Correct Way to Access GitHub Secrets

### Step 1: Go to GitHub.com
1. Open your web browser
2. Go to **https://github.com**
3. Sign in to your GitHub account

### Step 2: Navigate to Your Repository
1. Find your **Heka** repository
2. Click on it to open

### Step 3: Go to Settings
1. Click the **"Settings"** tab (top menu bar, next to "Code", "Issues", "Pull requests", etc.)
2. If you don't see "Settings", you may not have admin access - ask the repository owner

### Step 4: Find Secrets
1. In the left sidebar, look for **"Secrets and variables"**
2. Click on it
3. Click **"Actions"** (under "Secrets and variables")

### Step 5: Add New Secret
1. Click **"New repository secret"** button
2. Enter the secret name (e.g., `RAILWAY_TOKEN`)
3. Enter the secret value
4. Click **"Add secret"**

---

## 📍 Visual Path

```
github.com
  ↓
Your Repository (Heka)
  ↓
Settings (top menu)
  ↓
Secrets and variables (left sidebar)
  ↓
Actions
  ↓
New repository secret (button)
```

---

## 🎯 What You're Looking For

**In GitHub.com Settings, you should see:**

```
┌─────────────────────────────────────┐
│  Repository Settings                │
├─────────────────────────────────────┤
│  General                            │
│  Access                            │
│  Secrets and variables  ← CLICK HERE│
│    ├─ Actions                      │
│    └─ Dependencies                 │
│  Actions                            │
│  ...                                │
└─────────────────────────────────────┘
```

---

## ❌ What You DON'T Need

- ❌ VS Code extensions
- ❌ Marketplace tools
- ❌ Any software installation
- ❌ Command line tools

**You just need:** A web browser and access to GitHub.com

---

## 🔍 Can't Find "Settings" Tab?

**Possible reasons:**

1. **You're not the repository owner**
   - Ask the owner to add you as a collaborator with admin access
   - Or ask them to add the secrets for you

2. **You're viewing a fork**
   - Settings are only available on the original repository
   - You need to add secrets to YOUR fork's settings

3. **You're on the wrong page**
   - Make sure you're on the repository page (not a file, not an issue)
   - URL should be: `https://github.com/YOUR_USERNAME/Heka`

---

## 📝 Quick Checklist

- [ ] Opened github.com in browser
- [ ] Signed in to GitHub account
- [ ] Navigated to Heka repository
- [ ] Can see "Settings" tab (top menu)
- [ ] Clicked "Settings"
- [ ] Can see "Secrets and variables" in left sidebar
- [ ] Clicked "Secrets and variables" → "Actions"
- [ ] Can see "New repository secret" button

---

## 🆘 Still Can't Find It?

**Alternative: Use GitHub CLI**

If you have GitHub CLI installed, you can add secrets via command line:

```bash
# Install GitHub CLI (if not installed)
# macOS: brew install gh
# Linux: sudo apt install gh
# Windows: winget install GitHub.cli

# Authenticate
gh auth login

# Add secret
gh secret set RAILWAY_TOKEN --repo YOUR_USERNAME/Heka
```

But the web interface is easier!

---

## 💡 Pro Tip

**Bookmark this URL:**
```
https://github.com/YOUR_USERNAME/Heka/settings/secrets/actions
```

Replace `YOUR_USERNAME` with your GitHub username.

---

**Need help?** Tell me:
1. Can you see the "Settings" tab?
2. What do you see when you click "Settings"?
3. Are you the repository owner?

