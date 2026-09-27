/**
 * Detection taxonomy for the drill-down: Domain → Role → Type / family → State.
 * Counts are one illustrative pass per domain. Type names are representative;
 * the classes available depend on the deployment.
 *
 * Each node: { id, name, count, confidence, note?, limited?, soon?, children? }
 * - confidence: detector confidence at this level (0–1). Classification confidence
 *               narrows from domain to role to type; state is a separate attribute
 *               and can be more certain than the type call.
 * - limited:    recognition stopped at this level because the imagery doesn't support more
 */
export const LEVELS = ["Domain", "Role", "Type / family", "State"];

const state = (id, name, count, confidence, note) => ({ id, name, count, confidence, note });

export const TAXONOMY = [
  {
    id: "aircraft",
    name: "Aircraft",
    count: 16,
    confidence: 0.99,
    note: "Airbase pass · EO 0.5 m with SAR cross-cue",
    children: [
      {
        id: "fighter",
        name: "Fighter",
        count: 8,
        confidence: 0.96,
        children: [
          {
            id: "su30",
            name: "Su-30 family",
            count: 5,
            confidence: 0.88,
            children: [
              state("su30-apron", "On apron", 3, 0.86, "Shadow and outline visible in EO"),
              state("su30-shelter", "In shelter", 1, 0.74, "Shelter door open; nose visible in EO, return confirmed in SAR"),
              state("su30-ir", "Engines running", 1, 0.81, "Thermal signature at the exhaust in IR"),
            ],
          },
          {
            id: "rafale",
            name: "Rafale family",
            count: 3,
            confidence: 0.84,
            children: [
              state("rafale-apron", "On apron", 2, 0.83, "Delta-canard planform resolved in EO"),
              state("rafale-taxi", "Taxiing", 1, 0.77, "On taxiway, off-stand, between two passes"),
            ],
          },
        ],
      },
      {
        id: "transport",
        name: "Transport",
        count: 4,
        confidence: 0.95,
        children: [
          {
            id: "c130",
            name: "C-130 family",
            count: 2,
            confidence: 0.9,
            children: [
              state("c130-apron", "On apron", 1, 0.88, "Four-engine high wing resolved in EO"),
              state("c130-maint", "Under maintenance", 1, 0.71, "Ground equipment and open cowling"),
            ],
          },
          {
            id: "il76",
            name: "Il-76 family",
            count: 1,
            confidence: 0.87,
            children: [state("il76-apron", "On apron", 1, 0.85, "T-tail and wing sweep resolved in EO")],
          },
          {
            id: "transport-unresolved",
            name: "Type not resolved",
            count: 1,
            confidence: 0.58,
            limited: true,
            note: "At 1.5 m GSD the airframe supports a role call, not a type call. MIAR reports it at role level.",
            children: [state("tu-apron", "On apron", 1, 0.8, "Position and state are still reported")],
          },
        ],
      },
      {
        id: "tanker",
        name: "Tanker",
        count: 1,
        confidence: 0.93,
        children: [
          {
            id: "il78",
            name: "Il-78 family",
            count: 1,
            confidence: 0.82,
            children: [state("il78-apron", "On apron", 1, 0.8, "Refuelling pods visible in EO")],
          },
        ],
      },
      {
        id: "patrol",
        name: "Maritime patrol",
        count: 1,
        confidence: 0.94,
        children: [
          {
            id: "p8",
            name: "P-8 family",
            count: 1,
            confidence: 0.86,
            children: [state("p8-apron", "On apron", 1, 0.84, "Narrow-body with raked wingtips")],
          },
        ],
      },
      {
        id: "rotary",
        name: "Rotary wing",
        count: 2,
        confidence: 0.97,
        children: [
          {
            id: "mi17",
            name: "Mi-17 family",
            count: 1,
            confidence: 0.83,
            children: [state("mi17-dispersed", "Dispersed", 1, 0.76, "Parked off the main apron")],
          },
          {
            id: "ch47",
            name: "CH-47 family",
            count: 1,
            confidence: 0.89,
            children: [state("ch47-apron", "On apron", 1, 0.87, "Tandem rotor resolved in EO")],
          },
        ],
      },
    ],
  },
  {
    id: "ships",
    name: "Ships",
    count: 12,
    confidence: 0.99,
    note: "Naval base pass · SAR with EO confirmation",
    children: [
      {
        id: "combatant",
        name: "Surface combatant",
        count: 5,
        confidence: 0.94,
        children: [
          {
            id: "destroyer",
            name: "Destroyer · 150–165 m",
            count: 2,
            confidence: 0.86,
            children: [
              state("dd-alongside", "Alongside", 1, 0.9, "Berthed at the main jetty"),
              state("dd-underway", "Under way", 1, 0.82, "Wake visible in EO and SAR"),
            ],
          },
          {
            id: "frigate",
            name: "Frigate · 120–140 m",
            count: 3,
            confidence: 0.84,
            children: [
              state("ff-alongside", "Alongside", 2, 0.88, "Berthed, gangway out"),
              state("ff-anchor", "At anchor", 1, 0.8, "Stationary off the breakwater"),
            ],
          },
        ],
      },
      {
        id: "submarine",
        name: "Submarine",
        count: 2,
        confidence: 0.9,
        children: [
          {
            id: "ssk",
            name: "Diesel-electric · 65–80 m",
            count: 2,
            confidence: 0.8,
            children: [
              state("ssk-alongside", "Alongside", 1, 0.78, "Low freeboard at the submarine pier"),
              state("ssk-drydock", "In dry dock", 1, 0.85, "Hull fully exposed"),
            ],
          },
        ],
      },
      {
        id: "amphib",
        name: "Amphibious",
        count: 1,
        confidence: 0.92,
        children: [
          {
            id: "lpd",
            name: "LPD · 170–190 m",
            count: 1,
            confidence: 0.85,
            children: [state("lpd-alongside", "Alongside", 1, 0.88, "Well-deck stern resolved in EO")],
          },
        ],
      },
      {
        id: "auxiliary",
        name: "Auxiliary",
        count: 2,
        confidence: 0.91,
        children: [
          {
            id: "tanker-ship",
            name: "Fleet tanker · 160–180 m",
            count: 2,
            confidence: 0.83,
            children: [state("aor-alongside", "Alongside", 2, 0.86, "Replenishment rigs visible")],
          },
        ],
      },
      {
        id: "commercial",
        name: "Commercial",
        count: 2,
        confidence: 0.93,
        children: [
          {
            id: "cargo",
            name: "Cargo · 100–200 m",
            count: 2,
            confidence: 0.81,
            children: [state("cargo-anchor", "At anchor", 2, 0.84, "Holding in the outer anchorage")],
          },
        ],
      },
    ],
  },
  {
    id: "vehicles",
    name: "Armed forces vehicles",
    count: 0,
    confidence: 0,
    soon: true,
    note: "In development. Planned roles and states shown for reference.",
    children: [
      { id: "mbt", name: "Main battle tank", count: 0, confidence: 0, soon: true, children: [] },
      { id: "ifv", name: "IFV / APC", count: 0, confidence: 0, soon: true, children: [] },
      { id: "arty", name: "Self-propelled artillery", count: 0, confidence: 0, soon: true, children: [] },
      { id: "mlrs", name: "Rocket artillery", count: 0, confidence: 0, soon: true, children: [] },
      { id: "sam", name: "Air-defence launcher", count: 0, confidence: 0, soon: true, children: [] },
      { id: "logistics", name: "Logistics vehicle", count: 0, confidence: 0, soon: true, children: [] },
    ],
  },
];

/** Resolve a list of ids (one per level) into the chain of nodes; stops at the first miss. */
export function resolvePath(tree, ids) {
  const chain = [];
  let level = tree;
  for (const id of ids) {
    const node = level?.find((candidate) => candidate.id === id);
    if (!node) break;
    chain.push(node);
    level = node.children ?? [];
  }
  return chain;
}

/** Extend a partial path to full depth by taking the first child at each remaining level. */
export function completePath(tree, ids) {
  const chain = resolvePath(tree, ids);
  const path = chain.map((node) => node.id);
  let level = chain.length ? chain[chain.length - 1].children ?? [] : tree;
  while (level && level.length && path.length < LEVELS.length) {
    path.push(level[0].id);
    level = level[0].children ?? [];
  }
  return path;
}

/** Choosing a node at `depth` keeps the path above it and resets everything below. */
export function selectAt(tree, path, depth, id) {
  return completePath(tree, [...path.slice(0, depth), id]);
}

/** Share of the parent's count (0–1). Roots are shared against the largest root. */
export function share(node, parent, siblings = []) {
  const base = parent ? parent.count : Math.max(1, ...siblings.map((s) => s.count));
  return base > 0 ? node.count / base : 0;
}

/** Every node whose children don't add up to its count (should be empty). */
export function countMismatches(tree) {
  const bad = [];
  const walk = (nodes) => {
    for (const node of nodes) {
      const kids = node.children ?? [];
      if (kids.length && !node.soon) {
        const sum = kids.reduce((total, kid) => total + kid.count, 0);
        if (sum !== node.count) bad.push({ id: node.id, count: node.count, sum });
      }
      walk(kids);
    }
  };
  walk(tree);
  return bad;
}
