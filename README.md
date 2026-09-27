# miar-website

The MIAR public site: an Astro static site deployed as a Cloudflare Worker, with a
Worker-backed request-access form (`/api/waitlist/`) that writes to D1.

Production: https://miar.reachdefence.com

## Local development

```bash
npm install
npm run dev            # http://localhost:3004
```

- `npm run preview` builds and runs the Worker locally with Wrangler (http://localhost:8787).
  Use it to exercise `/api/waitlist/` on the same runtime as production.
- `npm run preview:static` serves the static build only (http://localhost:3005).

## Tests

```bash
npm run test:unit      # node:test, pure logic in src/lib (no browser)
npm run test:e2e       # Playwright, starts its own server on 127.0.0.1:4327
make ci-local          # production build + search index check + e2e
```

Unit tests cover the interactive components' logic, which lives in `src/lib` as plain
modules so it can be tested without a browser:

| Module | What it drives |
| --- | --- |
| `rail-state.mjs` | The processing rail (Receive → Publish) that follows the page |
| `frag-steps.mjs` | The scroll-driven fragmentation → MIAR widget |
| `scene-field.mjs` | The hero scene field: scattered scenes settling into one site record |
| `taxonomy.mjs` | The detection drill-down: domain → role → type → state |
| `threat-model.mjs` | Platform capability library and threat assessment |
| `border-watch.mjs` | Heightened awareness: perception per observed airbase, IB geometry |

`npm run build` also enforces performance budgets (`scripts/check-performance-budget.mjs`):
raster images under 500 KB, each CSS file under 100 KB, `public/site.js` under 25 KB.

## Deploy (local, to production)

Deploys go from a local machine straight to production with Wrangler.

1. Create a Cloudflare API token: **dash.cloudflare.com → My Profile → API Tokens →
   Create Token → "Edit Cloudflare Workers"** template, scoped to the ReachDefence account.
   Make sure it includes Account → Workers Scripts → Edit, Account → D1 → Edit,
   Account → Account Settings → Read and User → User Details → Read. Set an expiry.
2. Put it in `.env` in the project root (gitignored; Wrangler reads it automatically):

   ```bash
   CLOUDFLARE_API_TOKEN=...
   CLOUDFLARE_ACCOUNT_ID=...
   ```

3. Check the token, then deploy from `main`:

   ```bash
   npx wrangler whoami
   git checkout main && git pull
   npm run deploy         # build + budgets + wrangler deploy
   ```

Never commit `.env` or paste the token into issues, chat or docs.

### Cloudflare Workers Builds

The repository is also connected to Cloudflare Workers Builds, so a push to `main` triggers
a production build in Cloudflare as well. Non-production branch builds should stay limited
(Workers → miar-website → Settings → Build → Branch control) so design branches never deploy.

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Production |
| `miar-landing-page-redesign-option-1` | Redesign reference: editorial theme, sensor-stack hero |
| `miar-landing-page-redesign-option-2` | Reference: reactive page, fragmentation widget, light/dark |
| `miar-landing-page-redesign-option-3` | Reference: scene-field hero, centred headline |
| `miar-landing-page-redesign-option-4` | Consolidated redesign, released to `main` |

Options 1–3 are kept for comparison and are not deployed.

## Structure

- `src/pages/` routes: home, `/solutions/`, `/capabilities/` (How it works), `/blogs/`
  (Insights), `/legal/`, `/privacy/`, `/terms/`, and `api/waitlist.ts`
- `src/components/` page sections and interactive widgets
- `src/lib/` pure, unit-tested logic for the widgets
- `src/data/` solutions, navigation, and `ib-sector.json` (boundary geometry)
- `src/content/blog/` validated Markdown articles (see `docs/blog-publishing.md`)
- `src/styles/global.css` design tokens (light and dark) and shared styles
- `public/` fonts (Geist, Geist Mono, self-hosted), imagery, social cards, `site.js`
- `scripts/` asset optimisation, social card generation, search index, budgets
- `db/waitlist.sql` D1 schema

## Request-access form

The form posts to `/api/waitlist/` with fields `name`, `email`, `organization`, `role`,
`interest`, `focus`, `timeline`, `mission` and the `website` honeypot. `timeline` is omitted
when not chosen; the API treats missing fields as empty.

Persistence: `MIAR_WAITLIST_DB` (D1) first, `MIAR_WAITLIST` (KV) as fallback. With neither
bound, submissions are accepted and only logged, which is fine locally but not in production.

Recorded fields: identity (`name`, `email`, `organization`, `role`), requirement (`interest`,
`focus`, `timeline`, `mission`), request metadata (`submitted_at`, `referrer`, `user_agent`,
`cf_country`, `cf_region`, `cf_city`) and acknowledgements.

### D1 setup (one-off)

```bash
npx wrangler d1 create miar-waitlist
# copy the database_id into wrangler.jsonc under MIAR_WAITLIST_DB
npx wrangler d1 execute miar-waitlist --remote --file=./db/waitlist.sql
```

## Map and third-party assets

The heightened-awareness map uses:

- **Leaflet 1.9.4** from cdnjs, loaded lazily with Subresource Integrity.
- **OpenStreetMap standard tiles** (keyless; attribution shown). The OSM tile service is
  volunteer-run and suited to light use. For sustained traffic, switch the tile URL in
  `src/components/BorderWatch.astro` to a keyed provider or self-hosted tiles.
- **Natural Earth** 1:10m boundary lines (public domain) for the international boundary,
  clipped to the Punjab and north Rajasthan sector.

The map view is bounded below Jammu so the Jammu and Kashmir region is never rendered. The
three airbases and their assessments are fictional exercise data; capability figures are
rounded open-source reference values. Installation names live in `src/lib/border-watch.mjs`
and `src/lib/threat-model.mjs`.

## Legal and access

- Legal hub `/legal/`, privacy notice `/privacy/`, website terms `/terms/`.
- The waitlist API rejects requests geolocated to `CN` and `PK`. For a site-wide block, use
  a Cloudflare WAF custom rule: `(ip.src.country in {"CN" "PK"})` with action **Block**.
