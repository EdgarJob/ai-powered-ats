# 🛡️ Safe Development Guide

## 🚨 IMPORTANT: How to Avoid Breaking Your Live Website

Your app is now live at `https://ai-powered-ats-e019d.web.app`, and you want to keep it working!

## 🌿 The Safe Development Workflow

### ✅ SAFE: Work on the `develop` branch
```bash
# Switch to development branch
git checkout develop

# Make your changes here
# Edit files, add features, experiment!

# Test locally
npm run dev

# Commit your changes
git add .
git commit -m "Add new feature"
git push origin develop
```

### ⚠️ RISKY: Working directly on `main` branch
```bash
# DON'T DO THIS for experimental changes:
git checkout main
# Making changes here will automatically deploy to production!
```

## 🔄 How to Safely Deploy to Production

### Step 1: Test on Development Branch
```bash
git checkout develop
# Make your changes
# Test thoroughly locally
git push origin develop
```

### Step 2: Create a Pull Request
1. Go to: https://github.com/EdgarJob/ai-powered-ats/pulls
2. Click "New Pull Request"
3. Select: `develop` → `main`
4. Review your changes
5. Merge only when you're confident

### Step 3: Automatic Production Deployment
- When you merge to `main`, it automatically deploys
- You'll see a big warning in the logs: "🚨 DEPLOYING TO PRODUCTION!"

## 🧪 Testing Your Changes

### Local Testing (Always Do This First)
```bash
cd frontend
npm run dev
# Test your app at http://localhost:5173
```

### Development Branch Testing
- Push to `develop` branch
- GitHub Actions will test your code
- No deployment happens (safe!)

## 🚨 Emergency: If You Break Production

### Quick Fix
```bash
# Revert to last working commit
git checkout main
git revert HEAD
git push origin main
# This will automatically deploy the fix
```

### Proper Fix
```bash
# Fix the issue on develop branch
git checkout develop
# Make your fixes
git push origin develop
# Then create pull request to main
```

## 📋 Development Checklist

Before pushing to `main`:
- [ ] ✅ Tested locally with `npm run dev`
- [ ] ✅ All features work as expected
- [ ] ✅ No console errors
- [ ] ✅ Login/logout works
- [ ] ✅ All pages load correctly
- [ ] ✅ Mobile-friendly (test on phone)

## 🎯 Branch Strategy Summary

| Branch | Purpose | Auto-Deploy? | Risk Level |
|--------|---------|--------------|------------|
| `develop` | Safe experimentation | ❌ No | 🟢 Safe |
| `main` | Production code | ✅ Yes | 🔴 High Risk |

## 💡 Pro Tips

1. **Always start with `develop`**: `git checkout develop`
2. **Test everything locally first**: `npm run dev`
3. **Small changes are safer**: Don't change everything at once
4. **Use descriptive commit messages**: "Fix login bug" not "updates"
5. **When in doubt, ask for help!**

Remember: It's better to be safe than sorry! 🛡️ 