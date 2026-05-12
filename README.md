# miar-website

MIAR landing site built with Astro and deployed as a static Cloudflare Pages site with a Pages Function-backed waitlist endpoint.

## Local

- `npm install`
- `npm run dev`
- preview at `http://localhost:3004`

## CI

- `make ci-local`

This runs the local release check used before commits and pushes.

## Structure

- `src/pages/index.astro`
- `src/components/`
- `src/styles/global.css`
- `public/imagery/`
- `public/whitepapers/`
- `public/blogs/`
- `functions/api/waitlist.js`

## Deploy

Cloudflare Pages settings:

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`

## Waitlist persistence

Optional bindings:

- `MIAR_WAITLIST_DB` for D1
- `MIAR_WAITLIST` for KV

If neither binding is present, submissions are still accepted and logged by the Pages Function.
