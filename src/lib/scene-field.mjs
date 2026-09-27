/**
 * Scene field: pure layout for the option-3 hero.
 *
 * Scenes arrive scattered ("chaos") from several providers, then settle into one
 * co-registered site record: rows by sensor, columns by collection date. Unusable
 * scenes (cloud) and duplicates drop out. Nothing here touches the DOM.
 */

export const SENSORS = ["eo", "sar", "hsi"];

export const SOURCES = [
  { id: "a", sensor: "eo", tag: "PORTAL A · GEOTIFF", from: "left" },
  { id: "b", sensor: "sar", tag: "PORTAL B · SICD", from: "right" },
  { id: "c", sensor: "hsi", tag: "BUCKET C · ENVI", from: "top" },
  { id: "d", sensor: "eo", tag: "GROUND STATION · NITF", from: "bottom" },
  { id: "e", sensor: "sar", tag: "SENTINEL-1 · SAFE", from: "right" },
];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build the scene set for `dates` collection dates.
 * - EO: one usable scene per date; every third date also has a cloudy (unusable) pass.
 * - SAR: one usable scene per date; every fourth date has a duplicate from a second provider.
 * - HSI: a usable cube on every other date.
 * - The latest date carries the change on EO and SAR; HSI's latest cube carries it too.
 */
export function makeScenes(dates, seed = 14) {
  const random = mulberry32(seed);
  const scenes = [];
  let n = 0;
  const push = (scene) => scenes.push({ id: n++, seed: Math.floor(random() * 1e9), variant: Math.floor(random() * 4), ...scene });
  const lastHsi = dates - 1 - ((dates - 1) % 2);

  for (let date = 0; date < dates; date++) {
    push({ sensor: "eo", source: date % 2 ? "d" : "a", date, usable: true, change: date === dates - 1 });
    if (date % 3 === 1) push({ sensor: "eo", source: "a", date, usable: false, reason: "cloud" });
    push({ sensor: "sar", source: "b", date, usable: true, change: date === dates - 1 });
    if (date % 4 === 2) push({ sensor: "sar", source: "e", date, usable: false, reason: "duplicate" });
    if (date % 2 === 0) push({ sensor: "hsi", source: "c", date, usable: true, change: date === lastHsi });
  }
  return scenes;
}

const overlaps = (x, y, size, rect) =>
  x + size > rect.left && x < rect.right && y + size > rect.top && y < rect.bottom;

/**
 * Scattered position for a scene, outside the protected rectangle(s): the headline
 * block and, optionally, the site header. Deterministic per scene seed and viewport.
 * Returns { x, y, rot } (top-left, degrees).
 */
export function chaosPosition(scene, viewport, safeRects, size, margin = 12) {
  const rects = Array.isArray(safeRects) ? safeRects : [safeRects];
  const safe = rects[0];
  const blocked = (x, y) => rects.some((rect) => overlaps(x, y, size, rect));
  const random = mulberry32(scene.seed);
  const maxX = Math.max(margin, viewport.width - size - margin);
  const maxY = Math.max(margin, viewport.height - size - margin);
  let x = margin;
  let y = margin;
  for (let attempt = 0; attempt < 60; attempt++) {
    x = margin + random() * (maxX - margin);
    y = margin + random() * (maxY - margin);
    if (!blocked(x, y)) break;
    if (attempt === 59) {
      // Fall back to the nearest side of the protected rectangle.
      const gaps = [
        { d: safe.left - size - margin, x: safe.left - size - margin, y },
        { d: viewport.width - safe.right - size - margin, x: safe.right + margin, y },
      ].sort((a, b) => b.d - a.d);
      x = Math.max(margin, gaps[0].x);
    }
  }
  return { x, y, rot: (random() - 0.5) * 36 };
}

/** Where each scene enters from before it lands in its scattered position. */
export function entryPosition(scene, viewport, size) {
  const random = mulberry32(scene.seed ^ 0x9e3779b9);
  const from = SOURCES.find((source) => source.id === scene.source)?.from ?? "left";
  const along = random();
  if (from === "left") return { x: -size * 2, y: along * viewport.height };
  if (from === "right") return { x: viewport.width + size, y: along * viewport.height };
  if (from === "top") return { x: along * viewport.width, y: -size * 2 };
  return { x: along * viewport.width, y: viewport.height + size };
}

/**
 * Grid for usable scenes inside `band` ({ left, top, width, height }).
 * Returns { size, gap, left, top, width, height, rowY, colX, positions: Map(id -> {x, y}) }.
 */
export function recordLayout(scenes, band, dates, options = {}) {
  const { maxSize = 52, minSize = 18, gapRatio = 0.18, labelWidth = 44 } = options;
  const rows = SENSORS.length;
  const usableWidth = Math.max(0, band.width - labelWidth);
  const byWidth = usableWidth / (dates + (dates - 1) * gapRatio);
  const byHeight = band.height / (rows + (rows - 1) * gapRatio);
  const size = Math.max(minSize, Math.min(maxSize, byWidth, byHeight));
  const gap = size * gapRatio;
  const width = dates * size + (dates - 1) * gap;
  const height = rows * size + (rows - 1) * gap;
  const left = band.left + labelWidth + Math.max(0, (usableWidth - width) / 2);
  const top = band.top + Math.max(0, (band.height - height) / 2);
  const colX = Array.from({ length: dates }, (_, i) => left + i * (size + gap));
  const rowY = SENSORS.map((_, i) => top + i * (size + gap));

  const positions = new Map();
  for (const scene of scenes) {
    if (!scene.usable) continue;
    positions.set(scene.id, { x: colX[scene.date], y: rowY[SENSORS.indexOf(scene.sensor)] });
  }
  return { size, gap, left, top, width, height, rowY, colX, positions };
}

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Story phases from pinned-scroll progress p (0–1):
 * - order:    scattered → site record (0.12 → 0.62)
 * - discard:  unusable scenes fade out (0.2 → 0.55)
 * - change:   change markers light up (0.62 → 0.74)
 * - contract: contract is issued (0.74 → 0.9)
 * - caption:  0, 1 or 2 for the three narrative lines
 */
export function phases(p) {
  const progress = clamp01(Number.isFinite(p) ? p : 0);
  const order = easeInOut(clamp01((progress - 0.12) / 0.5));
  return {
    order,
    discard: clamp01((progress - 0.2) / 0.35),
    change: clamp01((progress - 0.62) / 0.12),
    contract: clamp01((progress - 0.74) / 0.16),
    caption: progress < 0.12 ? 0 : progress < 0.7 ? 1 : 2,
  };
}

/** Per-scene stagger so tiles settle in a wave (earlier dates first). */
export function staggered(order, scene, dates) {
  const delay = (scene.date / Math.max(1, dates - 1)) * 0.35;
  return clamp01((order - delay) / (1 - 0.35));
}
