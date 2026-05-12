# MIAR Website Handover

Date: 2026-05-12

## Current State

The MIAR landing site has been moved out of `/Users/one2n/miar` and into:

- `/Users/one2n/miar-website`

This folder is now initialized as its own git repository and has its remote set to:

- `https://github.com/SrivatsaRv/miar-website.git`

The site is built as a static Cloudflare Pages project with a Pages Function for waitlist
submission.

## Key Files

- `README.md`
- `public/whitepapers/index.html`
- `public/blogs/index.html`
- `public/index.html`
- `public/styles.css`
- `public/app.js`
- `functions/api/waitlist.js`

## Experience Summary

The current website is:

- single-page
- responsive
- static-first
- Cloudflare Pages-friendly
- visually oriented around Earth observation, orbital sensing, inference, and SHIELD-style
  evidence handoff

The main UX pattern is:

- left side: editorial story flow
- right side: sticky "inference stage" that changes as the user scrolls through the page

The four sections are:

- Home
- Capabilities
- About
- Waitlist

Additional publishing routes now exist:

- `/whitepapers/`
- `/blogs/`

## Waitlist Behavior

The waitlist form posts to:

- `/api/waitlist`

The function supports:

- `MIAR_WAITLIST_DB` as a D1 binding
- `MIAR_WAITLIST` as a KV binding

If neither is configured, submissions are still accepted and logged from the Pages
Function.

## Cloudflare Pages Assumptions

Current intended deploy settings:

- Framework preset: `None`
- Build command: leave empty
- Build output directory: `public`

Because `functions/` exists beside `public/`, Pages Functions should be available once the
repo is connected to Cloudflare Pages.

## Validation Already Done

The following checks were already run successfully before handoff:

- anchor target check for section navigation in `public/index.html`
- `node --check public/app.js`
- `node --check functions/api/waitlist.js`

## Important Notes For The Next Agent

1. The repo has been initialized locally, but nothing has been staged, committed, or
   pushed yet.
2. There is no `wrangler.toml` yet.
3. Whitepaper artifacts from `/Users/one2n/miar/docs` were copied into:
   - `public/whitepapers/library/`
4. Those duplicate whitepaper/docs artifacts were then removed from `/Users/one2n/miar`
   so the website repo is now the publishing home.
5. There is one initial blog post under:
   - `public/blogs/posts/why-miar-starts-with-cadence.html`
6. There is no D1 schema or migration file yet beyond the defensive table creation inside
   the function.
7. There are no screenshots or visual regression assets yet.
8. The current design is stronger than the first version, but it can still be pushed
   further if the goal is an even more premium or cinematic launch experience.

## Recommended Next Actions

1. Review the current visual system in `public/index.html` and `public/styles.css`.
2. Decide whether to keep the static single-page architecture or introduce a build tool.
3. Add `wrangler.toml` if Cloudflare bindings and local workflows should be explicit.
4. If persistence is required immediately, wire D1 or KV and document binding names.
5. Stage, commit, and push the repo to GitHub.
6. Connect the GitHub repo to Cloudflare Pages.
7. Test waitlist submissions in the deployed environment.

## Original Source Repo Context

The website assets were removed from:

- `/Users/one2n/miar/public`
- `/Users/one2n/miar/functions`

The original `/Users/one2n/miar` repo now keeps the docs and whitepaper work only.
