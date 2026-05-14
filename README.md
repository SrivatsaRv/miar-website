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

This runs the local release check used before commits and pushes.

## Structure

- `src/pages/index.astro`
- `src/pages/legal/index.astro`
- `src/components/`
- `src/styles/global.css`
- `src/pages/api/waitlist.ts`
- `db/waitlist.sql`
- `public/imagery/`
- `public/whitepapers/`
- `public/blogs/`

## Publishing status

- `/blogs` is temporarily disabled
- `/whitepapers` is temporarily disabled
- source assets remain in `public/blogs/` and `public/whitepapers/` for later reuse

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

## Legal and access notice

- public notice route: `/legal/`
- the request-access form links to the site notice and treats submission as acknowledgement
- the waitlist API rejects requests geolocated to `CN` and `PK`

## Country blocking

App-level checks are only a second layer for the waitlist endpoint. If you need to block the
entire website, enforce it at Cloudflare WAF with a custom rule.

Recommended rule expression:

```txt
(ip.src.country in {"CN" "PK"})
```

Recommended action:

- `Block`
