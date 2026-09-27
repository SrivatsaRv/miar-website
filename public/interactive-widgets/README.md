# MIAR visuals for press and partners

Standalone exports of the visuals on miar.reachdefence.com. Each file works on its own:
SVGs carry their own styles, fonts (Geist, SIL Open Font License) and embedded imagery, and
GIFs are ready to drop into an article or slide.

Public URL: `https://miar.reachdefence.com/interactive-widgets/<file>`

| File | What it shows | Format |
| --- | --- | --- |
| `hero-scene-field.gif` | Scenes from five providers arrive scattered, settle into one co-registered site record, and one intelligence contract is issued | Animated GIF |
| `capabilities-pipeline.svg` / `.gif` | Provider satellites pass over an AOI, scenes land in customer storage, flow through Register, Exploit, Qualify and Publish, and leave as an intelligence contract | Animated SVG, animated GIF |
| `capabilities-pipeline-vertical.svg` | The same pipeline in portrait, for mobile and print columns | Animated SVG |
| `fragmentation-today.svg` | Imagery from five sources passing through nine separate tools | SVG |
| `fragmentation-through-miar.svg` | The same five sources through one MIAR layer to one contract | SVG |
| `fragmentation-flow.gif` | Transition from the fragmented tool chain to MIAR | Animated GIF |
| `sensor-stack-workbench.svg` / `.gif` | Optical, radar and hyperspectral layers of one airfield, and the analyst qualifying four candidates (including a decoy and a concealed vehicle) | SVG, animated GIF |
| `change-compare.svg` / `.gif` | Same airbase apron in 2025 and 2026: six aircraft in both, three in new positions, a rotary-wing arrival | SVG, animated GIF |
| `detection-taxonomy.gif` | Drill-down from domain to role, type and state, including a type held at role level | Animated GIF |
| `border-watch.gif` | Heightened awareness: threat perception for three observed airbases across the international boundary | Animated GIF |
| `workflow-five-steps.gif` | Register, Detect, Compare, Qualify, Publish | GIF |
| `sensor-matrix.gif` | What EO, SAR, HSI and thermal imagery each show under different conditions | GIF |
| `detection-models.gif` | Purpose-trained detection models: aircraft, ships, armed forces vehicles (in development) | GIF |
| `evidence-record.gif` | A qualified finding with its scenes, confidence, analyst decision and history | GIF |
| `intelligence-contract.gif` | The published contract and its downstream effects | GIF |
| `tactical-isr-scene.svg` | Current pass of a monitored airbase with detections | SVG |
| `asset-register.gif`, `asset-register-map.svg` | Counts by type and each aircraft's position, with moved stands | GIF, SVG |
| `archive-trend-chart.svg` | Aircraft on the apron by type across twelve passes | SVG |
| `sovereign-delivery-flow.svg` | Providers into MIAR inside the customer's boundary, approved output out | SVG |

Link-preview cards (1200 × 630) are in `/social/v2/`.

## Usage

Credit: **MIAR by ReachDefence**. Please do not crop out labels such as "Illustrative" or
"fictional". All figures, counts, installations and assessments shown are illustrative
exercise data. Airbases A, B and C are fictional; the international boundary is from Natural
Earth (public domain); map tiles © OpenStreetMap contributors.

## Regenerating

With the dev server running (`npm run dev`), run `npm run export:widgets`. The script is
`scripts/export-widgets.mjs`.
