export type Solution = {
  slug: string;
  number: string;
  eyebrow: string;
  name: string;
  question: string;
  title: string;
  summary: string;
  example: string;
  problemTitle: string;
  problem: string;
  approachTitle: string;
  approach: string[];
  outputTitle: string;
  outputs: string[];
  outcome: string;
  visual: "scene" | "monitor" | "compare" | "trend" | "delivery";
};

// Terms used consistently across these pages:
// scene (the imagery product), last usable scene (the baseline), site record,
// detection (detector output) becoming a finding once an analyst qualifies it, published.

export const solutions: Solution[] = [
  {
    slug: "tactical-isr",
    number: "01",
    eyebrow: "Tactical ISR",
    name: "Tactical ISR",
    question: "What is on the site in the latest scene, and what is different?",
    title: "Exploit each new scene of a site against its last usable scene.",
    summary:
      "For airbases, naval bases, ports and garrisons under routine watch. MIAR co-registers each new scene to the site's last usable scene, runs the aircraft and ship detectors, and lists what is new, moved or absent for the analyst to qualify.",
    example:
      "A 0.5 m EO scene of an airbase arrives at 06:42Z. The two passes before it were more than 80% cloud, so the last usable scene is four days old. MIAR compares against that scene, finds seven aircraft and flags four as off their previous stands. The analyst reviews those four detections first instead of recounting the whole apron.",
    problemTitle: "Every new scene starts with a manual recount.",
    problem:
      "Before anything in a new scene can be called new, the analyst has to find the previous usable scene, often in a different provider portal, allow for a different look angle and sun position, and recount the site. Across a watchlist of dozens of sites with daily revisit, that recount takes most of the day and is repeated on every pass.",
    approachTitle: "Compare with the last usable scene and queue only the differences.",
    approach: [
      "Orthorectify the new scene and co-register it to the last usable scene of the same site. Passes above the cloud threshold or outside the look-angle limit are not used as baselines.",
      "Run the aircraft and ship detectors, then match each detection to the previous scene by position and type: held, moved, new or absent.",
      "Queue the new, moved and absent detections for the analyst, highest confidence first, with chips from both scenes side by side.",
    ],
    outputTitle: "A qualified current-state record of the site.",
    outputs: [
      "Detections by class and type, each with its confidence",
      "Held, moved, new and absent status against the last usable scene",
      "The analyst's decision and note on each flagged detection",
      "Both source scenes, with acquisition time, GSD and look angle",
    ],
    outcome:
      "The finding is published to the operational picture as soon as the flagged detections are qualified. Where the scene only supports a role call, the aircraft is published at role level until a better scene arrives.",
    visual: "scene",
  },
  {
    slug: "military-asset-monitoring",
    number: "02",
    eyebrow: "Asset Monitoring",
    name: "Asset monitoring",
    question: "How many of each type are on the site, and where is each one parked?",
    title: "Count aircraft and ships by type, and keep where each one was.",
    summary:
      "Counts by type for every reviewed scene of a site, with each detection's position kept against the installation layout. A change in dispersal or parking pattern is recorded even when the totals stay the same.",
    example:
      "Two scenes a week apart both show five transport aircraft and one maritime patrol aircraft. In the second scene two of the transports have moved from the main apron to the eastern hardstand, and a helicopter has arrived. A register of totals records no change for the transports. The MIAR register records the same count, the two stand changes and the new helicopter.",
    problemTitle: "A register of totals loses dispersal.",
    problem:
      "On a busy apron, manual counts by different analysts on different days disagree by one or two airframes, and a spreadsheet of totals keeps no record of where each aircraft was. Dispersal to hardstands, movement into shelters and concentration on one apron are the changes an ORBAT team needs, and they are lost once only the number is written down.",
    approachTitle: "Detect by type, keep each position, and have the analyst confirm.",
    approach: [
      "Detect aircraft and ships as oriented boxes and classify them down the class, family and type hierarchy. Where the scene cannot support a type call, the detection stays at role level.",
      "Store each detection's position against the site's installation layout: apron, hardstand, shelter row or berth.",
      "Compare the layout with the previous reviewed scene and mark stand and berth changes as well as count changes.",
      "Write only analyst-qualified detections into the register.",
    ],
    outputTitle: "A register of what was where, scene by scene.",
    outputs: [
      "Counts by class and type",
      "Position of each asset against the installation layout",
      "Stand and berth changes against the previous reviewed scene",
      "The scene reference and analyst decision behind every row",
    ],
    outcome:
      "The register feeds ORBAT strength and disposition directly. Aircraft held at role level are counted at role level, so strength by type is never raised by an unconfirmed type call.",
    visual: "monitor",
  },
  {
    slug: "change-posture",
    number: "03",
    eyebrow: "Change and Posture",
    name: "Change and posture",
    question: "Is a change at the site routine, or a change in posture?",
    title: "Separate routine movement from a change in posture.",
    summary:
      "Object-level change detection between two scenes of the same site, correlated with the installation layout and the ORBAT. Analysts review changes to the objects on the ground, with differences caused by shadow, season or viewing geometry filtered out before review.",
    example:
      "Pixel differencing of the 2025 and 2026 scenes of the monitored airbase flags long shadows, a resurfaced taxiway and a dozen vehicles. The object-level comparison reports the same six fixed-wing aircraft, three of them in new positions with one on the taxiway, and a rotary-wing aircraft that was not in the earlier scene. Those four changes are the only items sent to the analyst.",
    problemTitle: "Most pixel change comes from geometry, light and season.",
    problem:
      "Two scenes taken months apart differ in sun angle, shadow length, look angle, atmosphere and often sensor. Differencing the pixels turns all of that into candidate change. Without knowing which objects are present and where the installation's aprons, shelters and berths are, the analyst has to dismiss most of the flags by eye.",
    approachTitle: "Compare objects, then assess the change against the site.",
    approach: [
      "Co-register both scenes and limit the comparison to the installation's operating areas.",
      "Match detections between the scenes by position and type instead of differencing pixels.",
      "Correlate the changes with the site's ORBAT entry and its recent activity, so a routine rotation is assessed differently from a surge or a dispersal.",
      "Send material changes to the analyst to accept, reject or annotate.",
    ],
    outputTitle: "A reviewed change with its basis recorded.",
    outputs: [
      "Baseline and current scene chips for each change",
      "Object, position and layout differences",
      "The analyst's disposition and note",
      "Detection confidence and scene provenance",
    ],
    outcome:
      "The posture assessment depends on ORBAT context. For a site with no ORBAT entry, MIAR still reports object-level change, and the posture call is left to the analyst.",
    visual: "compare",
  },
  {
    slug: "archive-trend",
    number: "04",
    eyebrow: "Archive and Trends",
    name: "Archive and trends",
    question: "Is activity at the site rising, falling or recurring?",
    title: "Build a site history from every reviewed scene.",
    summary:
      "Counts by type from every qualified scene of a site, plotted across weeks or months, with each point linked to the scene it came from.",
    example:
      "Across twelve monthly passes of the same airbase, transport presence stays between four and six aircraft. Rotary-wing aircraft appear for the first time in September and reach two by December. Exploited one delivery at a time, each of those scenes looks routine.",
    problemTitle: "Single scenes hide slow build-ups and rotations.",
    problem:
      "When each delivery is exploited on its own, the only comparison is with the previous scene. A build-up over several months, a weekly rotation or a new type arriving in small numbers never appears as one large change, so it goes unnoticed until someone rebuilds the history by hand from old reports.",
    approachTitle: "Keep the class hierarchy fixed so every scene is comparable.",
    approach: [
      "Pull archive scenes of the site from licensed catalogues or public missions such as Sentinel and Landsat, and co-register them to the site.",
      "Exploit every scene with the same detector version and class hierarchy, so a count from March means the same as a count from September.",
      "Record only qualified detections in the history, and show gaps where no usable scene exists instead of interpolating across them.",
    ],
    outputTitle: "A trend that traces back to the imagery.",
    outputs: [
      "Presence by type for each reviewed scene",
      "Build-up, dispersal and first-seen markers",
      "Gaps marked where no usable scene exists",
      "A link from every data point to its source scene",
    ],
    outcome:
      "What the trend can show is limited by revisit. At monthly revisit a weekly rotation is invisible, so the history shows the revisit interval alongside the counts and marks where more frequent collection would be needed to answer the question.",
    visual: "trend",
  },
  {
    slug: "sovereign-delivery",
    number: "05",
    eyebrow: "Sovereign Delivery",
    name: "Sovereign delivery",
    question: "Can exploitation run inside our own network, including disconnected?",
    title: "Run exploitation and publishing inside the customer's boundary.",
    summary:
      "MIAR deploys on customer-controlled infrastructure, including disconnected networks. Imagery, detectors, analyst decisions and published findings stay inside that boundary, and nothing is published without analyst approval.",
    example:
      "In a disconnected deployment, scenes arrive over the customer's own delivery path, the detectors run on local hardware, and qualified findings are published to the customer's ORBAT and GIS services. Once the scene has been received the external network can be disconnected, and the exploitation thread still completes.",
    problemTitle: "Each provider portal is another copy of the data.",
    problem:
      "Buying from several imagery providers usually means several portals, each with its own storage, viewer and export format. Scenes are copied between them and onto analysts' workstations, and the record of who reviewed what, and which version was briefed, is split across those copies.",
    approachTitle: "One exploitation environment behind every provider, under customer control.",
    approach: [
      "Ingest each provider's deliveries in their native formats, such as GeoTIFF or COG, NITF, JPEG 2000 and STAC, into one environment.",
      "Run detection, comparison and analyst review inside that environment, with access managed through the customer's identity provider.",
      "Publish qualified findings to existing systems over OGC API, WFS or GeoJSON, with provenance attached.",
      "Deploy on premises, in a sovereign cloud or on an air-gapped network.",
    ],
    outputTitle: "Findings that keep their evidence chain inside the boundary.",
    outputs: [
      "Published findings with the scene, detector version and analyst decision attached",
      "Feeds for ORBAT, GIS and briefing systems",
      "An audit log of every review and export",
      "Deployment on premises, in a sovereign cloud or disconnected",
    ],
    outcome:
      "In a disconnected deployment, detector updates arrive through the customer's own transfer process, so model updates follow the customer's accreditation cycle rather than a vendor release schedule.",
    visual: "delivery",
  },
];

export const getSolution = (slug: string) =>
  solutions.find((solution) => solution.slug === slug);
