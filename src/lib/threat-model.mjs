/**
 * Heightened-awareness threat model: join a detection to a platform capability
 * library and assess it against protected assets.
 *
 * Geography is schematic: positions are kilometres on a flat plane, with the
 * observed installation at the origin. Installation names are placeholders.
 * Capability figures are rounded open-source reference values and vary by
 * configuration, loadout and profile.
 */

export const LEVELS = ["Unassessed", "Watch", "Elevated", "High"];

export const PLATFORMS = {
  fighter: {
    id: "fighter",
    family: "F-16 family",
    role: "Multirole fighter",
    capability: "Air-to-air and precision strike",
    radiusKm: 550,
    radiusLabel: "Combat radius ≈550 km",
    posture: "Offensive air capability",
  },
  transport: {
    id: "transport",
    family: "C-130 family",
    role: "Tactical airlift",
    capability: "≈90 troops or ≈19 t of cargo per sortie",
    radiusKm: null,
    radiusLabel: "Reach not threat-relevant",
    posture: "Logistics or troop movement",
  },
  tanker: {
    id: "tanker",
    family: "Tanker family",
    role: "Aerial refuelling",
    capability: "Extends the reach of co-located fighters",
    radiusKm: null,
    extensionKm: 300,
    radiusLabel: "Adds ≈300 km to fighter reach",
    posture: "Force extension",
  },
  aew: {
    id: "aew",
    family: "AEW&C family",
    role: "Airborne early warning and control",
    capability: "Wide-area air picture and battle management",
    radiusKm: 400,
    radiusLabel: "Radar coverage ≈400 km",
    posture: "Preparation for coordinated air operations",
  },
};

export const OBSERVED = { id: "base-b", name: "Border Airbase B", x: 0, y: 0 };

export const ASSETS = [
  { id: "radar-t", name: "Radar Site T", kind: "Air-defence radar", x: 95, y: -80, critical: true },
  { id: "afs-k", name: "Forward Air Station K", kind: "Air station", x: 180, y: 30, critical: true },
  { id: "hub-r", name: "Logistics Hub R", kind: "Logistics hub", x: 330, y: -70, critical: false },
  { id: "cmd-n", name: "Command Centre N", kind: "Command node", x: 600, y: 60, critical: true },
];

export const distanceKm = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Reach (km) that matters for this platform at the observed base.
 * - fighter: combat radius, extended when a tanker is co-located
 * - tanker:  the extended reach of co-located fighters (it has no strike reach itself)
 * - aew:     radar coverage
 * - transport: none
 */
export function reachKm(platform, context = {}) {
  if (!platform) return null;
  const fighter = PLATFORMS.fighter.radiusKm;
  if (platform.id === "fighter") return fighter + (context.tankerPresent ? PLATFORMS.tanker.extensionKm : 0);
  if (platform.id === "tanker") return context.fightersPresent === false ? null : fighter + platform.extensionKm;
  return platform.radiusKm;
}

/**
 * detection: { id, count, delta, confidence }
 * Returns a signal the analyst must qualify before it is disseminated.
 */
export function assessThreat(platformId, detection, assets = ASSETS, context = {}) {
  const platform = PLATFORMS[platformId];
  if (!platform) {
    return { level: "Unassessed", levelRank: 0, inRange: [], reasons: ["Platform not in the capability library"], actions: [], requiresQualification: true };
  }

  const reach = reachKm(platform, context);
  const ranked = assets
    .map((asset) => ({ ...asset, distance: Math.round(distanceKm(OBSERVED, asset)) }))
    .sort((a, b) => a.distance - b.distance);
  const inRange = reach ? ranked.filter((asset) => asset.distance <= reach) : [];
  const surge = (detection.delta ?? 0) > 0;
  const nearest = inRange[0];

  let level = "Watch";
  if (platform.id === "fighter") level = inRange.some((a) => a.critical) ? (surge ? "High" : "Elevated") : "Watch";
  if (platform.id === "tanker" || platform.id === "aew") level = inRange.length ? "Elevated" : "Watch";

  const reasons = [
    `${detection.count} × ${platform.family} detected at ${OBSERVED.name}${surge ? ` (+${detection.delta} vs last usable scene)` : ""}`,
    `${platform.role}: ${platform.capability.charAt(0).toLowerCase()}${platform.capability.slice(1)}`,
  ];
  if (platform.id === "fighter") {
    reasons.push(`${platform.radiusLabel}${context.tankerPresent ? ", extended by co-located tankers" : ""} (open-source reference)`);
    if (nearest) reasons.push(`${nearest.name} is ${nearest.distance} km away, inside combat radius`);
    reasons.push("No transport or tanker uplift seen: not a logistics movement");
  } else if (platform.id === "transport") {
    reasons.push("Airlift indicates movement of troops or materiel, not direct strike capability");
    reasons.push("Assessed together with ground activity and follow-on sorties");
  } else if (platform.id === "tanker") {
    reasons.push(`Co-located fighters' reach rises to ≈${reach} km`);
    if (inRange.length) reasons.push(`${inRange.length} protected assets fall inside the extended reach`);
  } else if (platform.id === "aew") {
    reasons.push(`${platform.radiusLabel}: ${inRange.length} protected assets inside the air picture`);
    reasons.push("Often precedes coordinated air activity");
  }

  const actions = {
    High: ["Cue a SAR revisit within 12 h", "Notify air-defence operations", `Raise the watch level for ${nearest?.name ?? "affected assets"}`],
    Elevated: ["Cue a revisit on the next available pass", "Correlate with airspace notices and ADS-B", "Brief the watch officer"],
    Watch: ["Track follow-on sorties and ground movement", "Keep on the site watchlist"],
  }[level] ?? [];

  return {
    platform,
    reach,
    inRange,
    level,
    levelRank: LEVELS.indexOf(level),
    posture: platform.posture,
    headline: nearest && level !== "Watch" ? `${nearest.name} · under threat from detection ${detection.id}` : `No protected asset under direct threat · detection ${detection.id}`,
    reasons,
    actions,
    requiresQualification: true,
  };
}
