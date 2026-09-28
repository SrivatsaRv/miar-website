# MIAR design system: colour and theming

All UI colour comes from semantic tokens in `src/styles/global.css`. Components never use raw
colour values; `tests/unit/tokens.test.mjs` fails the build if they do.

## Themes

| Order | Source | How |
| --- | --- | --- |
| 1 | Saved choice | `html[data-theme="light" \| "dark"]`, stored in `localStorage["miar-theme"]` |
| 2 | System | `prefers-color-scheme` when nothing is saved |
| 3 | Default | Light |

- An inline script in `BaseLayout.astro` applies the saved choice before first paint (no flash).
- `color-scheme` is set per theme so native controls, scrollbars and form fields match.
- `public/site.js` keeps the toggle, `aria-pressed`, the `theme-color` meta and listeners in
  sync, follows live system changes when nothing is saved, and dispatches a `themechange`
  event on `document`.
- Dark values live in one selector list (`:root[data-theme="dark"], [data-surface="inverse"]`)
  and are repeated for `prefers-color-scheme`. A unit test checks the two blocks match and that
  every colour token has a dark value.

## Tokens

| Group | Tokens | Use |
| --- | --- | --- |
| Page | `--paper`, `--paper-raised`, `--paper-sunk`, `--ink`, `--ink-2`, `--ink-3`, `--rule`, `--rule-strong` | Page background, body text, dividers |
| Panel | `--panel`, `--panel-2`, `--panel-3`, `--on-panel`, `--on-panel-2`, `--on-panel-3`, `--panel-rule` | Visuals, figures and feature sections. Light panels in light mode, dark in dark mode |
| Accent | `--signal` (lines, fills, marks), `--signal-ink` (text), `--signal-fill` (fills behind text), `--on-signal` | The one accent colour. Text always uses `--signal-ink` for contrast |
| Status | `--ok`, `--threat-high`, `--threat-elevated`, `--threat-routine` | Positive state; threat perception levels |
| Sensors | `--sensor-eo`, `--sensor-sar`, `--sensor-hsi` | Satellite tracks and data points by sensor |
| Data | `--series-1`, `--series-2`, `--series-3` | Chart series (validated palette) |
| Chrome | `--header-bg`, `--placeholder`, `--body-ink`, `--map-tile-filter` | Header, inputs, article text, map tiles |

Alpha variants use `color-mix()`, for example
`color-mix(in srgb, var(--on-panel) 28%, transparent)`, so they follow the theme.

## Surfaces

- `.panel-surface` marks a section painted with the panel tokens.
- `[data-surface="inverse"]` keeps an area dark in both themes (the footer). It sets the dark
  token values locally, so everything inside it works unchanged.
- The MIAR core block inside diagrams is drawn with `--on-panel` as its fill and `--panel` as
  its text, so it is always the inverse of its surroundings.

## Canvas, SVG and map libraries

- SVG presentation attributes cannot hold `var()`. Put colour in `style` or a class.
- Canvas code reads tokens with `token()` and `withAlpha()` from `src/lib/theme.mjs` and
  redraws on `onThemeChange()`.
- Leaflet paths are styled through `className` so CSS tokens win over the library defaults.
  Tiles use `--map-tile-filter`: none in light mode, inverted and toned down in dark mode.

## Imagery palettes

Satellite imagery (EO ground and aircraft, SAR speckle and returns, hyperspectral material
classes, cloud) keeps fixed colours in both themes, because it represents what a sensor sees.
These are the only literals allowed outside the token block, and they are listed in
`tests/unit/tokens.test.mjs`. Add a new imagery colour there, never a UI colour.

## Adding a colour

1. Add a semantic token with a light value in `:root` and a dark value in both dark blocks.
2. Use it through `var(--token)` or `color-mix()`.
3. Run `npm run test:unit`; the guardrail and parity tests must pass.
