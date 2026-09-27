/**
 * Border watch: threat perception for observed airbases across the international
 * boundary, derived from what was observed and the platform capability library.
 *
 * The three airbases are fictional and deliberately not placed on real airfields.
 * Capability figures come from threat-model.mjs (rounded open-source references).
 */
import { PLATFORMS } from "./threat-model.mjs";

export const PERCEPTION = ["Routine", "Elevated", "High"];

export const BASES = [
  {
    id: "a",
    name: "Airbase A",
    lat: 31.25,
    lng: 73.55,
    pass: "EO 06:42Z · SAR 02:10Z",
    observed: [
      { platform: "fighter", count: 6, delta: 4, note: "+4 fighters since last usable scene" },
      { note: "3 shelters open" },
      { note: "fuel bowsers staged" },
    ],
    protectedInReach: 3,
    previous: "Elevated",
  },
  {
    id: "b",
    name: "Airbase B",
    lat: 30.55,
    lng: 73.2,
    pass: "EO 07:15Z",
    observed: [
      { platform: "tanker", count: 1, delta: 1, note: "tanker arrived" },
      { platform: "aew", count: 1, delta: 1, note: "AEW&C arrived" },
      { platform: "fighter", count: 4, delta: 0, note: "fighters unchanged" },
    ],
    protectedInReach: 2,
    previous: "Routine",
  },
  {
    id: "c",
    name: "Airbase C",
    lat: 29.7,
    lng: 72.7,
    pass: "SAR 05:50Z",
    observed: [
      { platform: "transport", count: 2, delta: 0, note: "2 transports, same stands" },
      { note: "helicopters at 90-day norm" },
    ],
    protectedInReach: 0,
    previous: "Routine",
  },
];

/** Perception from observations: an offensive surge beats enablers, which beat routine movement. */
export function perception(base) {
  const has = (id, surge) => base.observed.some((o) => o.platform === id && (!surge || (o.delta ?? 0) > 0));
  if (has("fighter", true) && base.protectedInReach > 0) return "High";
  if (has("tanker", true) || has("aew", true)) return "Elevated";
  return "Routine";
}

/** Short, record-style assessment for a base: one line per field. */
export function assessBase(base, distanceKm) {
  const level = perception(base);
  const observed = base.observed.map((o) => o.note);
  const raised = PERCEPTION.indexOf(level) > PERCEPTION.indexOf(base.previous);

  if (level === "High") {
    const p = PLATFORMS.fighter;
    return {
      level,
      observed,
      platform: `${p.family}, ${p.role.toLowerCase()}`,
      capability: `${p.radiusLabel}. ${base.protectedInReach} protected assets in reach.`,
      assessment: `Offensive air posture forming ${distanceKm} km from the IB.${raised ? ` Raised from ${base.previous}.` : ""}`,
      next: "SAR revisit within 12 h. Alert air defence.",
      requiresQualification: true,
    };
  }
  if (level === "Elevated") {
    return {
      level,
      observed,
      platform: `${PLATFORMS.tanker.family} and ${PLATFORMS.aew.family}`,
      capability: `Extends fighter reach by ≈${PLATFORMS.tanker.extensionKm} km. Radar cover ≈${PLATFORMS.aew.radiusKm} km.`,
      assessment: `Enablers moving forward ${distanceKm} km from the IB. No fighter surge yet.${raised ? ` Raised from ${base.previous}.` : ""}`,
      next: "Revisit next pass. Check airspace notices.",
      requiresQualification: true,
    };
  }
  return {
    level,
    observed,
    platform: `${PLATFORMS.transport.family}, ${PLATFORMS.transport.role.toLowerCase()}`,
    capability: "Airlift only. No strike capability.",
    assessment: `Matches the 90-day norm, ${distanceKm} km from the IB.`,
    next: "Keep on routine watch.",
    requiresQualification: true,
  };
}

// --- Geometry (small-area equirectangular approximation, fine at this scale) ---

const KM_PER_DEG_LAT = 111.32;
const toXY = (lat, lng, lat0) => [lng * KM_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180), lat * KM_PER_DEG_LAT];

/** Nearest point on a polyline of [lat, lng] pairs: { lat, lng, distanceKm }. */
export function nearestOnLine(point, latlngs) {
  const lat0 = point.lat;
  const cos0 = Math.cos((lat0 * Math.PI) / 180);
  const [px, py] = toXY(point.lat, point.lng, lat0);
  let best = { lat: latlngs[0][0], lng: latlngs[0][1], distanceKm: Infinity };
  for (let i = 1; i < latlngs.length; i++) {
    const [ax, ay] = toXY(latlngs[i - 1][0], latlngs[i - 1][1], lat0);
    const [bx, by] = toXY(latlngs[i][0], latlngs[i][1], lat0);
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    const x = ax + t * dx;
    const y = ay + t * dy;
    const d = Math.hypot(px - x, py - y);
    if (d < best.distanceKm) best = { lat: y / KM_PER_DEG_LAT, lng: x / (KM_PER_DEG_LAT * cos0), distanceKm: d };
  }
  return best;
}

/** Shortest distance (km) from a point to a polyline of [lat, lng] pairs. */
export function distanceToLineKm(point, latlngs) {
  return nearestOnLine(point, latlngs).distanceKm;
}

/** Split the boundary into one sector per base: each vertex goes to the nearest base. */
export function sectorsFor(latlngs, bases) {
  const nearest = (lat, lng) =>
    bases.reduce((best, base) => {
      const d = Math.hypot(lat - base.lat, (lng - base.lng) * Math.cos((lat * Math.PI) / 180));
      return d < best.d ? { id: base.id, d } : best;
    }, { id: bases[0].id, d: Infinity }).id;

  const sectors = [];
  for (const point of latlngs) {
    const id = nearest(point[0], point[1]);
    const last = sectors[sectors.length - 1];
    if (last && last.baseId === id) last.latlngs.push(point);
    else sectors.push({ baseId: id, latlngs: last ? [last.latlngs[last.latlngs.length - 1], point] : [point] });
  }
  return sectors;
}
