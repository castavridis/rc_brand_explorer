# Quickstart: Vercel Deployment Support

**Feature**: Vercel Deployment Support
**Date**: 2025-11-13
**Phase**: Phase 1 - Implementation Quickstart

## Overview

This guide provides step-by-step instructions for implementing Vercel deployment support for the Brand Logo Browser application. The implementation adds deployment infrastructure without modifying application code.

## Prerequisites

**Before Starting**:
- ✅ Application builds successfully with `npm run build`
- ✅ All features work correctly in local development (`npm run dev`)
- ✅ Git repository is pushed to GitHub (or GitLab/Bitbucket)
- ✅ Vercel account created (free tier sufficient)

## Implementation Steps

### Step 1: Create Vercel Configuration

**File**: `vercel.json` (repository root)

**Action**: Create minimal configuration for SPA routing

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Why**: This configuration ensures all routes are handled by the React application's client-side router. Without it, direct navigation to routes returns 404 errors.

**Validation**:
- ✅ File is valid JSON (no syntax errors)
- ✅ File is placed at repository root (same level as `package.json`)

### Step 2: Verify Build Configuration

**File**: `package.json`

**Action**: Verify `build` script exists and produces `dist/` output

```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

**Test Locally**:
```bash
npm run build
```

**Expected Output**:
- ✅ TypeScript compilation succeeds (no type errors)
- ✅ Vite build completes successfully
- ✅ `dist/` directory created with `index.html` and assets

**Validation**:
```bash
# Check dist/ structure
ls -la dist/
# Should show: index.html, assets/, data/, logos/

# Verify build size
du -sh dist/
# Should be < 10MB
```

### Step 3: Create Vercel Project

**Platform**: Vercel Dashboard (https://vercel.com/dashboard)

**Action**: Connect GitHub repository to Vercel

1. Click "Add New Project"
2. Select "Import Git Repository"
3. Choose the `rc_brand_explorer` repository
4. Configure project settings:
   - **Framework Preset**: Auto-detected (should show "Vite")
   - **Root Directory**: `.` (repository root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Click "Deploy"

**Expected Result**:
- ✅ Vercel detects Vite framework automatically
- ✅ Build settings are pre-filled correctly
- ✅ First deployment starts immediately

### Step 4: Monitor First Deployment

**Platform**: Vercel Dashboard > Deployments

**Action**: Watch build logs and verify success

**Build Process**:
1. Installing dependencies (`npm install`)
2. Running build command (`npm run build`)
3. Uploading assets to Edge Network
4. Deployment ready

**Expected Duration**: 1-3 minutes

**Validation**:
- ✅ Build completes without errors
- ✅ Deployment status shows "Ready"
- ✅ Production URL is generated (e.g., `brand-explorer.vercel.app`)

### Step 5: Test Deployed Application

**URL**: Production deployment URL from Vercel dashboard

**Test Cases**:

1. **Application Loads**:
   - Visit deployment URL
   - ✅ Application loads without errors
   - ✅ No console errors in browser DevTools

2. **Logos Display**:
   - ✅ All 8 brand logos visible in grid
   - ✅ No broken image placeholders
   - ✅ Images load correctly (check Network tab)

3. **Modal Functionality**:
   - Click on any logo
   - ✅ Modal opens and displays logo details
   - ✅ Close button works
   - ✅ Escape key closes modal

4. **HTTPS Certificate**:
   - Check browser address bar
   - ✅ Padlock icon shows valid HTTPS
   - ✅ Certificate is issued by Let's Encrypt (Vercel default)

5. **Performance**:
   - Run Lighthouse audit in Chrome DevTools
   - ✅ Performance score 90+ (should match local development)
   - ✅ Accessibility score 90+
   - ✅ Best Practices score 90+

### Step 6: Configure Automatic Deployments

**Platform**: Vercel Dashboard > Project Settings > Git

**Action**: Verify automatic deployment settings

**Configuration**:
- **Production Branch**: `main` (default)
- **Preview Deployments**: Enabled for all branches
- **Deployment Protection**: Disabled (public application)

**Test Automatic Deployment**:
1. Make a small change to application (e.g., update title in `index.html`)
2. Commit and push to `main` branch:
   ```bash
   git add index.html
   git commit -m "test: Verify automatic deployment"
   git push origin main
   ```
3. Watch Vercel dashboard for new deployment

**Validation**:
- ✅ Deployment triggers automatically within 10 seconds of push
- ✅ Build completes successfully
- ✅ Changes appear on production URL

### Step 7: Test Preview Deployments

**Action**: Create feature branch and verify preview deployment

```bash
# Create feature branch
git checkout -b feature/test-preview

# Make a change
echo "<!-- Preview deployment test -->" >> index.html

# Commit and push
git add index.html
git commit -m "test: Verify preview deployment"
git push origin feature/test-preview
```

**Expected Result**:
- ✅ Preview deployment created with unique URL
- ✅ URL format: `brand-explorer-git-feature-test-preview.vercel.app`
- ✅ Preview shows changes without affecting production

**Cleanup**:
```bash
git checkout main
git branch -D feature/test-preview
git push origin --delete feature/test-preview
```

## Optional: Custom Domain Setup

**When**: Only if custom domain is required (User Story 3 - Priority P3)

**Platform**: Vercel Dashboard > Project Settings > Domains

**Steps**:
1. Click "Add Domain"
2. Enter domain name (e.g., `brand-explorer.example.com`)
3. Vercel provides DNS records to add:
   - **A Record**: Points to Vercel IP
   - **CNAME Record**: Points to `cname.vercel-dns.com`
4. Add records to domain registrar's DNS settings
5. Wait for DNS propagation (5 minutes to 24 hours)
6. Vercel automatically provisions SSL certificate

**Validation**:
- ✅ Domain shows as "Valid" in Vercel dashboard
- ✅ Application accessible via custom domain
- ✅ HTTPS works automatically

## Troubleshooting

### Build Fails with "Command not found: tsc"

**Cause**: TypeScript not installed or missing from dependencies

**Fix**:
```bash
npm install --save-dev typescript
git add package.json package-lock.json
git commit -m "fix: Add TypeScript to dependencies"
git push
```

### Assets Return 404 Errors

**Cause**: Asset paths incorrect or files not included in build output

**Fix**:
1. Verify assets exist in `dist/` after build:
   ```bash
   npm run build
   ls -R dist/assets/
   ls -R dist/data/
   ```
2. Check asset paths in `brands.json` match actual file locations
3. Ensure `public/` directory is correctly configured in Vite

### SPA Routes Return 404

**Cause**: Missing or incorrect rewrite configuration

**Fix**:
1. Verify `vercel.json` exists at repository root
2. Check rewrites configuration:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
3. Redeploy after adding configuration

### Deployment Takes Too Long (>5 minutes)

**Cause**: Large dependencies or network issues

**Fix**:
1. Check build logs for slow steps
2. Consider adding `.vercelignore` to exclude unnecessary files:
   ```
   .git/
   node_modules/
   specs/
   .specify/
   ```
3. Verify `package-lock.json` is committed (enables faster installs)

## Success Criteria Checklist

After completing implementation, verify all success criteria are met:

- [ ] **SC-001**: Application deploys to Vercel successfully within 3 minutes
- [ ] **SC-002**: 100% of application features function correctly on deployed site
- [ ] **SC-003**: All 8 brand logos load and display correctly
- [ ] **SC-004**: Deployment process completes without manual intervention for Git pushes
- [ ] **SC-005**: Preview deployments created within 3 minutes for feature branch pushes
- [ ] **SC-006**: Deployed site achieves 90+ Lighthouse performance score
- [ ] **SC-007**: SSL certificate automatically provisioned and HTTPS works

## Next Steps

**After MVP Deployment (User Story 1 - P1)**:
- ✅ Application is publicly accessible
- ✅ HTTPS enabled automatically
- ✅ All features work correctly

**Optional Enhancements**:
- Configure automatic deployments for PR previews (User Story 2 - P2)
- Add custom domain (User Story 3 - P3)
- Add security headers to `vercel.json`
- Configure environment variables (if needed later)

## Reference

**Vercel Documentation**:
- Framework Detection: https://vercel.com/docs/frameworks/vite
- Configuration: https://vercel.com/docs/projects/project-configuration
- Git Integration: https://vercel.com/docs/deployments/git
- Custom Domains: https://vercel.com/docs/custom-domains

**Project Files**:
- `vercel.json`: Deployment configuration
- `package.json`: Build scripts
- `vite.config.ts`: Build configuration
- `dist/`: Build output (generated, not committed)
