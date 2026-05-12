# MIAR Website Handover

Date: 2026-05-12

## Current State

The MIAR landing site has been moved out of `/Users/one2n/miar` and into:

- `/Users/one2n/miar-website`

This folder is now initialized as its own git repository and has its remote set to:

- `https://github.com/SrivatsaRv/miar-website.git`

The site is built with Astro and deployed as a Cloudflare Worker with a worker-backed
waitlist submission route.

## Key Files

- `README.md`
- `wrangler.jsonc`
- `db/waitlist.sql`
- `src/pages/index.astro`
- `src/styles/global.css`
- `public/site.js`
- `src/pages/api/waitlist.ts`

## Experience Summary

The current website is:

- single-page
- responsive
- worker-deployed
- Cloudflare-friendly
- visually oriented around Earth observation, orbital sensing, inference, and SHIELD-style
  evidence handoff

The main UX pattern is:

- left side: editorial story flow
- right side: sticky "inference stage" that changes as the user scrolls through the page

The live homepage sections are:

- Home
- Solutions
- Insights
- Waitlist

Additional publishing routes now exist:

- `/whitepapers/`
- `/blogs/`

Those routes are currently disabled with temporary unavailable placeholder pages.

## Waitlist Behavior

The waitlist form posts to:

- `/api/waitlist`

The function supports:

- `MIAR_WAITLIST_DB` as a D1 binding
- `MIAR_WAITLIST` as a KV binding

If neither is configured, submissions are still accepted and logged from the Worker.

## Cloudflare Worker Assumptions

Current intended deploy settings:

- Build command: `npm run build`
- Deploy command: `npm run deploy`
- Runtime config: `wrangler.jsonc`

The current production binding is:

- `MIAR_WAITLIST_DB` -> D1 database `miar-waitlist`

## Validation Already Done

The following checks were already run successfully before handoff:

- `npm run build`
- `make ci-local`
- live D1-backed waitlist submission in production

## Important Notes For The Next Agent

1. The repo is live and deployed from this codebase as a Worker.
2. There is no `wrangler.toml`; configuration lives in `wrangler.jsonc`.
3. Whitepaper artifacts from `/Users/one2n/miar/docs` were copied into:
   - `public/whitepapers/library/`
4. Those duplicate whitepaper/docs artifacts were then removed from `/Users/one2n/miar`
   so the website repo is now the publishing home.
5. There is one initial blog post under:
   - `public/blogs/posts/why-miar-starts-with-cadence.html`
6. The D1 schema now lives in:
   - `db/waitlist.sql`
7. There are no screenshots or visual regression assets yet.
8. The current design is stronger than the first version, but it can still be pushed
   further if the goal is an even more premium or cinematic launch experience.

## Recommended Next Actions

1. Verify the latest desktop custom dropdown styling on the live site.
2. Decide whether the disabled `/blogs/` and `/whitepapers/` routes should remain placeholders or return 404s.
3. Add a lightweight internal export or dashboard path if submissions need operational review without using the D1 console.
4. Rotate any Cloudflare API token used during setup if it was exposed outside a secure shell.

## Original Source Repo Context

The website assets were removed from:

- `/Users/one2n/miar/public`
- `/Users/one2n/miar/functions`

The original `/Users/one2n/miar` repo now keeps the docs and whitepaper work only.
