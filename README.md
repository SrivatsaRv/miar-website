# miar-website

MIAR landing site built with Astro and deployed as a Cloudflare Worker with a worker-backed waitlist endpoint.

## Local

- `npm install`
- `npm run dev`
- worker preview at `http://localhost:8787` with `npm run preview`
- static-only preview at `http://localhost:3005` with `npm run preview:static`

Use `npm run preview` when testing the waitlist form. It runs the Cloudflare Worker
locally so `/api/waitlist` is exercised on the same runtime used for deployment.

## CI

- `make ci-local`

This builds the production bundle and runs Playwright browser checks used before commits and
pushes. The browser suite covers the shared header/footer shell, burger navigation, responsive
overflow, imagery loading, and desktop/mobile request-access form behavior.

- `npm run test:e2e` runs the browser suite directly.
- Playwright starts an isolated Astro test server on `http://127.0.0.1:4327`.
- Failure traces, screenshots, and video are retained under the Playwright output directories.

## Structure

- `src/pages/index.astro`
- `src/pages/capabilities/index.astro`
- `src/pages/legal/index.astro`
- `src/pages/privacy/index.astro`
- `src/pages/terms/index.astro`
- `src/content/blog/`
- `src/content.config.ts`
- `docs/blog-publishing.md`
- `src/components/`
- `src/styles/global.css`
- `src/pages/api/waitlist.ts`
- `db/waitlist.sql`
- `public/imagery/`
- `public/whitepapers/`
- `public/blogs/`

## Publishing status

- `/blogs` is live with Analysis and Tradecraft articles
- planned journal categories: Analysis, Tradecraft, Case Notes, Product Notes
- blog entries are validated Markdown files in `src/content/blog/`
- publishing and agency handoff instructions: `docs/blog-publishing.md`
- `/whitepapers` is temporarily disabled
- source whitepaper assets remain in `public/whitepapers/` for later reuse

## Deploy

Cloudflare Worker settings:

- Build command: `npm run build`
- Deploy command: `npm run deploy`
- Worker config: `wrangler.jsonc`

## Waitlist persistence

Primary binding:

- `MIAR_WAITLIST_DB` for D1

Fallback binding:

- `MIAR_WAITLIST` for KV

If neither binding is present, submissions are accepted but only logged in worker output. That
is suitable for local verification, not production capture.

## Cloudflare D1 setup

1. Create the database:
   - `npx wrangler d1 create miar-waitlist`
2. Copy the returned `database_id` into `wrangler.jsonc` under a `d1_databases` binding named `MIAR_WAITLIST_DB`.
3. Apply the schema:
   - `npx wrangler d1 execute miar-waitlist --remote --file=./db/waitlist.sql`
4. Deploy:
   - `npm run deploy`

The waitlist currently records:

- contact identity: `name`, `email`, `organization`, `role`
- market signal: `interest`, `focus`, `timeline`, `mission`
- request metadata: `submitted_at`, `referrer`, `user_agent`, `cf_country`, `cf_region`, `cf_city`
- acknowledgements: `privacy_acknowledged`, `eligibility_acknowledged`

## Legal and access notices

- legal hub: `/legal/`
- public-site privacy notice: `/privacy/`
- public website terms: `/terms/`
- the request-access form links to the privacy notice and website terms
- the waitlist API rejects requests geolocated to `CN` and `PK`

## Capability framing

- homepage now positions MIAR as a vendor-agnostic intelligence layer rather than a tasking portal
- public capabilities route: `/capabilities/`
- core themes: tactical ISR, military asset monitoring, change and posture, archive trend intelligence, and sovereign delivery

## Country blocking

App-level checks are only a second layer for the waitlist endpoint. If you need to block the
entire website, enforce it at Cloudflare WAF with a custom rule.

Recommended rule expression:

```txt
(ip.src.country in {"CN" "PK"})
```

Recommended action:

- `Block`
