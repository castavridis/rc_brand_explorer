/**
 * TypeScript interface for vercel.json configuration
 *
 * This interface defines the structure of Vercel deployment configuration.
 * Use this for type-checking vercel.json files or generating configuration programmatically.
 *
 * Reference: https://vercel.com/docs/projects/project-configuration
 */

/**
 * URL rewrite rule for SPA routing or proxying
 */
export interface VercelRewrite {
  /** URL pattern to match (supports regex, e.g., "/(.*)" or "/api/:path*") */
  source: string;
  /** Target path or URL to rewrite to */
  destination: string;
}

/**
 * HTTP redirect rule (301/302)
 */
export interface VercelRedirect {
  /** URL pattern to match */
  source: string;
  /** Target URL to redirect to */
  destination: string;
  /** Use 301 (true) or 302 (false) status code */
  permanent?: boolean;
  /** Custom status code (301, 302, 303, 307, 308) */
  statusCode?: 301 | 302 | 303 | 307 | 308;
}

/**
 * Custom HTTP response header
 */
export interface VercelHeaderRule {
  /** URL pattern to apply headers to */
  source: string;
  /** Header key-value pairs */
  headers: Array<{
    /** HTTP header name (e.g., "Cache-Control", "X-Frame-Options") */
    key: string;
    /** HTTP header value */
    value: string;
  }>;
}

/**
 * Supported Vercel framework presets
 */
export type VercelFramework =
  | 'vite'
  | 'nextjs'
  | 'create-react-app'
  | 'vue'
  | 'nuxtjs'
  | 'gatsby'
  | 'svelte'
  | 'sveltekit'
  | 'astro'
  | 'remix'
  | 'solidstart';

/**
 * Vercel deployment configuration (vercel.json)
 */
export interface VercelConfig {
  /** URL rewrite rules for SPA routing and proxying */
  rewrites?: VercelRewrite[];

  /** HTTP redirect rules (301/302) */
  redirects?: VercelRedirect[];

  /** Custom HTTP response headers */
  headers?: VercelHeaderRule[];

  /** Custom build command (overrides framework detection) */
  buildCommand?: string;

  /** Build output directory relative to project root (e.g., "dist", "build") */
  outputDirectory?: string;

  /** Framework preset for automatic configuration */
  framework?: VercelFramework;

  /** Custom install command (overrides default npm/yarn/pnpm detection) */
  installCommand?: string;

  /** Environment variables for build and runtime */
  env?: Record<string, string>;

  /** Remove .html extensions from URLs */
  cleanUrls?: boolean;

  /** Add or remove trailing slashes from URLs */
  trailingSlash?: boolean;

  /** Make deployment publicly accessible (true) or require authentication (false) */
  public?: boolean;
}

/**
 * Minimal Vercel configuration for Vite SPA
 *
 * This is the recommended configuration for single-page applications
 * built with Vite. It enables client-side routing by rewriting all
 * requests to index.html.
 */
export const MINIMAL_VITE_CONFIG: VercelConfig = {
  rewrites: [
    { source: '/(.*)', destination: '/index.html' }
  ]
};

/**
 * Enhanced Vercel configuration for Vite SPA with security headers
 */
export const ENHANCED_VITE_CONFIG: VercelConfig = {
  rewrites: [
    { source: '/(.*)', destination: '/index.html' }
  ],
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ]
    }
  ]
};
