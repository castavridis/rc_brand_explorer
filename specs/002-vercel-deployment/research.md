# Research: Vercel Deployment Support

**Feature**: Vercel Deployment Support
**Date**: 2025-11-13
**Phase**: Phase 0 - Technology Research

## Purpose

Research Vercel deployment configuration for Vite-based React applications to determine optimal setup for build configuration, static asset serving, SPA routing, and automatic deployments.

## Research Areas

### 1. Vercel + Vite Integration

**Decision**: Use Vercel's automatic framework detection with minimal configuration

**Rationale**:
- Vercel automatically detects Vite projects and applies optimal build settings
- Framework preset `vite` handles build command (`vite build`) and output directory (`dist`) automatically
- No custom build configuration needed unless overriding defaults
- Vercel's build cache works seamlessly with Vite's dependency pre-bundling

**Alternatives Considered**:
- Manual build configuration in `vercel.json` - Rejected: Unnecessary complexity when framework detection works
- Custom build scripts - Rejected: Standard Vite build is production-ready
- Alternative deployment platforms (Netlify, Cloudflare Pages) - Out of scope: User requested Vercel specifically

**Reference**: Vercel Framework Detection (https://vercel.com/docs/frameworks/vite)

### 2. SPA Routing Configuration

**Decision**: Use Vercel's `cleanUrls` and `trailingSlash` rewrites for client-side routing

**Rationale**:
- Vite builds single-page applications that handle routing client-side
- Without configuration, direct navigation to routes (e.g., `/about`) returns 404
- Vercel's `rewrites` configuration redirects all routes to `index.html` for SPA behavior
- This is the standard pattern for all SPA deployments (React Router, Vue Router, etc.)

**Configuration**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Alternatives Considered**:
- File-based routing - Rejected: Not applicable to React SPA
- Server-side rendering - Rejected: Out of scope, adds complexity
- Hash-based routing (#/route) - Rejected: URL aesthetics and SEO concerns

**Reference**: Vercel Rewrites (https://vercel.com/docs/projects/project-configuration#rewrites)

### 3. Static Asset Handling

**Decision**: Use Vite's default public asset handling with base path `/`

**Rationale**:
- Vite automatically processes assets in `public/` directory and preserves paths
- Assets referenced in code (imports) are hashed and bundled automatically
- Current structure has `assets/` and `data/` directories that need to be served
- Vercel serves all files in build output (`dist/`) as static assets

**Asset Strategy**:
- Logo images: Served from `assets/logos/` (copied to `dist/assets/logos/` during build)
- JSON data: Served from `data/brands/` (copied to `dist/data/brands/` during build)
- No CDN configuration needed - Vercel's Edge Network handles caching automatically

**Verification Needed**:
- Ensure `assets/` and `data/` directories are included in Vite's public asset handling
- Test that logo paths resolve correctly after deployment

**Alternatives Considered**:
- CDN URL rewriting - Rejected: Unnecessary for small asset count (8 logos)
- Asset optimization - Deferred: Current SVG files are already optimized

**Reference**: Vite Static Asset Handling (https://vitejs.dev/guide/assets.html)

### 4. Build Command and Output Directory

**Decision**: Use standard Vite build process with TypeScript compilation

**Rationale**:
- Existing `package.json` defines `build` script: `tsc && vite build`
- TypeScript compilation (`tsc`) runs before Vite build to catch type errors
- Output directory is `dist/` (Vite default)
- Build process is already tested locally and produces production-ready bundle

**Build Command**: `npm run build` (uses existing script)
**Output Directory**: `dist`
**Install Command**: `npm install` (default)

**Optimization**:
- Vite automatically tree-shakes unused code
- CSS is extracted and minified
- Images are optimized (but SVGs are unchanged)
- Build process takes ~10-15 seconds locally

**Alternatives Considered**:
- Custom build script - Rejected: Existing script is production-ready
- Skipping TypeScript check - Rejected: Type safety is important
- Different output directory - Rejected: `dist` is Vite standard

### 5. Environment Variables

**Decision**: No environment variables needed for initial deployment

**Rationale**:
- Application is fully static with no API keys or secrets
- Brand data is public and committed to repository
- No backend integration requiring environment-specific configuration

**Future Consideration**:
- If analytics or monitoring added: Use Vercel environment variables
- If API integration added: Store API keys in Vercel project settings

**Alternatives Considered**: N/A - no environment variables currently needed

### 6. Automatic Deployments (Git Integration)

**Decision**: Use Vercel's GitHub integration with automatic deployments for all branches

**Rationale**:
- Main branch deploys to production URL automatically
- Feature branches create preview deployments with unique URLs
- Pull requests show deployment preview links automatically
- No CI/CD configuration needed - Vercel handles builds

**Workflow**:
1. Connect Vercel project to GitHub repository
2. Configure production branch (typically `main`)
3. Push to `main` → production deployment
4. Push to feature branch → preview deployment
5. Open PR → preview URL commented on PR

**Alternatives Considered**:
- Manual deployments via CLI - Rejected: Automation reduces friction
- GitHub Actions + Vercel CLI - Rejected: Unnecessary complexity, Vercel integration is simpler
- Deploy only on PR merge - Rejected: Preview deployments valuable for testing

**Reference**: Vercel Git Integration (https://vercel.com/docs/deployments/git)

### 7. Custom Domains (Optional)

**Decision**: Support custom domain configuration via Vercel dashboard (not automated)

**Rationale**:
- Custom domains are configured through Vercel UI, not `vercel.json`
- DNS configuration requires external domain registrar access
- Automatic SSL certificate provisioning handled by Vercel

**Implementation**: Manual process documented in quickstart guide

**Alternatives Considered**:
- Vercel CLI domain commands - Rejected: Dashboard UI is more user-friendly
- Third-party DNS providers - Out of scope: User decides domain provider

### 8. Performance Optimization

**Decision**: Use Vercel's default edge caching with no custom headers

**Rationale**:
- Vercel automatically sets cache headers for static assets
- Immutable assets (hashed filenames) cached indefinitely
- HTML files cached with revalidation
- Edge Network provides global CDN automatically

**Cache Strategy** (automatic):
- `index.html`: `Cache-Control: public, max-age=0, must-revalidate`
- Hashed assets (`*.js`, `*.css`): `Cache-Control: public, max-age=31536000, immutable`
- Images and data: `Cache-Control: public, max-age=3600` (configurable if needed)

**Alternatives Considered**:
- Custom cache headers in `vercel.json` - Rejected: Defaults are optimal for SPAs
- Service worker caching - Deferred: PWA features out of scope

**Reference**: Vercel Edge Caching (https://vercel.com/docs/edge-network/caching)

### 9. Deployment Configuration File

**Decision**: Create minimal `vercel.json` with SPA rewrites only

**Rationale**:
- Framework detection handles most configuration automatically
- Only SPA routing requires explicit configuration
- Minimal configuration reduces maintenance burden
- Additional settings can be added incrementally if needed

**Minimal Configuration**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Optional Enhancements** (not required for MVP):
- Headers for security (CSP, X-Frame-Options)
- Redirects for legacy URLs
- Custom error pages

**Alternatives Considered**:
- No `vercel.json` at all - Rejected: SPA routing breaks without rewrites
- Comprehensive configuration - Rejected: YAGNI principle, add as needed

### 10. Testing Strategy

**Decision**: Manual deployment testing with verification checklist

**Rationale**:
- Deployment is infrastructure, not application code
- Testing requires actual deployment to Vercel environment
- Automated tests would require Vercel API integration (out of scope)
- Manual verification is sufficient for configuration-only change

**Test Checklist**:
1. Build succeeds without errors
2. Application loads at Vercel URL
3. All 8 logos display correctly
4. Logo modal opens and displays details
5. Client-side routing works (if applicable)
6. HTTPS certificate is valid
7. Performance metrics meet targets (Lighthouse 90+)

**Alternatives Considered**:
- Automated deployment tests - Deferred: Complex setup, low ROI for single config file
- Vercel CLI preview in CI - Deferred: Manual testing sufficient for MVP

## Summary

**Key Technologies**:
- Vercel platform (hosting, CDN, automatic deployments)
- Existing Vite build process (no changes needed)
- GitHub integration (automatic deployments)

**Configuration Required**:
- `vercel.json`: SPA routing rewrites only
- Vercel project setup: Connect to GitHub, configure production branch

**No Changes Needed**:
- Application code (zero modifications)
- Build scripts (existing `npm run build` is production-ready)
- Asset structure (Vite handles assets correctly)

**Success Criteria Validation**:
- ✅ Deployment time <3 minutes (Vite builds fast, Vercel deployment is quick)
- ✅ 100% functionality (static deployment preserves all features)
- ✅ 8 logos load correctly (asset paths work with Vite public directory)
- ✅ Automatic SSL (Vercel default)
- ✅ Lighthouse 90+ (existing app already optimized)

**Implementation Complexity**: Low - Single configuration file, no code changes

**Next Phase**: Define deployment configuration contract and quickstart guide
