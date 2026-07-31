# Performance Guardrails

MIAR treats image delivery as part of the build rather than relying on an optional CDN optimization
product. Master imagery stays in `assets/source-imagery` and is not deployed. `npm run build` creates
AVIF and WebP derivatives in `public/imagery` before Astro renders pages.

## Asset policy

- Use `OptimizedPicture.astro` for imagery referenced directly by Astro pages.
- AVIF is preferred and WebP is the fallback.
- Social previews remain JPEG or PNG because crawler support is broader than AVIF support.
- Self-hosted Inter replaces the render-blocking Google Fonts stylesheet.
- Hashed Astro assets, fonts, and versioned imagery receive long-lived immutable cache headers.
- The search index and `site.js` receive shorter stale-while-revalidate policies because their public
  paths are stable between releases.

## Enforced budgets

`scripts/check-performance-budget.mjs` fails the build when:

- a deployed raster asset exceeds 500 KB;
- first-party compiled CSS exceeds 100 KB before transfer compression; or
- `site.js` exceeds 25 KB before transfer compression.

`make ci-local` runs the production build, search-index generation, performance budget, and browser tests.
Run Lighthouse against the deployed custom domain for release-level LCP measurements; laboratory LCP
varies with throttling and edge state and is therefore tracked separately from deterministic CI limits.
