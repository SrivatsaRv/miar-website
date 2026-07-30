export type Solution = {
  slug: string;
  number: string;
  eyebrow: string;
  title: string;
  summary: string;
  thesis: string;
  problemTitle: string;
  problem: string;
  approachTitle: string;
  approach: string[];
  outputTitle: string;
  outputs: string[];
  outcome: string;
  visual: "scene" | "monitor" | "compare" | "trend" | "delivery";
};

export const solutions: Solution[] = [
  {
    slug: "tactical-isr",
    number: "01",
    eyebrow: "Tactical ISR",
    title: "See what is happening at a monitored site now.",
    summary:
      "Review the latest imagery of an airfield, base, port, route, or launch area against what was there before.",
    thesis:
      "The latest pass is useful when an analyst can place it against a known baseline and answer the question at hand.",
    problemTitle: "A new image still needs context.",
    problem:
      "An image may show aircraft, vehicles, equipment, or construction. It does not say which activity is new, whether it is routine, or what deserves attention. That judgement requires comparison and review.",
    approachTitle: "Review the latest pass against a known baseline.",
    approach: [
      "Place current and earlier scenes of the same AOI in one review sequence.",
      "Surface visible objects and scene differences for analyst confirmation.",
      "Keep the source image, comparison, confidence, and review decision together.",
    ],
    outputs: [
      "Current asset count by visible class",
      "Movement and site-status observations",
      "Analyst-reviewed findings",
      "Source imagery and comparison evidence",
    ],
    outputTitle: "A current assessment with the evidence attached.",
    outcome:
      "The result is a concise account of what is present and what changed, backed by the imagery used to reach it.",
    visual: "scene",
  },
  {
    slug: "military-asset-monitoring",
    number: "02",
    eyebrow: "Military Asset Monitoring",
    title: "Maintain a current picture of assets at high-value sites.",
    summary:
      "Count and locate visible aircraft, vessels, vehicles, and equipment across repeated coverage of the same site.",
    thesis:
      "Five aircraft in a hardened shelter area can mean something different from five aircraft dispersed across an apron.",
    problemTitle: "The count is only part of the picture.",
    problem:
      "Manual counts take time and vary between reviewers. Counts also miss changes in spacing, concentration, dispersal, and placement that may matter more than the total.",
    approachTitle: "Count the assets. Keep their position and layout.",
    approach: [
      "Detect and tabulate visible assets by class.",
      "Compare their position, spacing, and distribution with earlier scenes.",
      "Require analyst confirmation before a machine finding is treated as reviewed intelligence.",
    ],
    outputs: [
      "Counts by visible asset class",
      "Changes in distribution and density",
      "Site-level review notes",
      "Review history and source provenance",
    ],
    outputTitle: "A site record that preserves more than totals.",
    outcome:
      "Each review adds to a site record showing what was present, where it was located, and how the layout changed.",
    visual: "monitor",
  },
  {
    slug: "change-posture",
    number: "03",
    eyebrow: "Change + Posture",
    title: "Separate routine movement from a change in posture.",
    summary:
      "Compare two scenes, identify the objects involved, and review whether the difference matters.",
    thesis:
      "The relevant question is not whether the pixels changed. It is what changed on the ground.",
    problemTitle: "Most visible change is not a warning.",
    problem:
      "Cloud, shadow, season, viewing angle, construction, and routine movement can all trigger a change result. Without object and site context, the analyst receives noise.",
    approachTitle: "Identify the object before judging the change.",
    approach: [
      "Align the current scene with the selected baseline.",
      "Check detected objects, movement, structures, and layout together.",
      "Send material differences to an analyst for disposition.",
    ],
    outputs: [
      "Before-and-after evidence",
      "Object, position, and layout differences",
      "Analyst disposition",
      "Confidence and source provenance",
    ],
    outputTitle: "A reviewed change with a clear basis.",
    outcome:
      "The analyst can see the baseline, the current scene, the detected difference, and the reason a change was accepted or dismissed.",
    visual: "compare",
  },
  {
    slug: "archive-trend",
    number: "04",
    eyebrow: "Archive + Trend",
    title: "Follow activity at the same AOI over time.",
    summary:
      "Use earlier scenes and reviewed detections to see how a site changes across days, weeks, or longer periods.",
    thesis:
      "One image shows a moment. A sequence shows whether the activity is normal, rising, falling, or recurring.",
    problemTitle: "A single scene hides the pattern.",
    problem:
      "Reviewing each delivery in isolation makes it difficult to spot buildup, dispersal, recurring activity, or a change in the mix of assets at a site.",
    approachTitle: "Use the same classes and questions across each review.",
    approach: [
      "Select and align historical scenes for the AOI.",
      "Record confirmed detections using a consistent class structure.",
      "Plot presence by type while keeping every data point linked to its source scene.",
    ],
    outputs: [
      "Scene history for the AOI",
      "Asset presence by type",
      "Buildup and dispersal observations",
      "Before-and-after comparisons",
    ],
    outputTitle: "A site history that remains tied to the imagery.",
    outcome:
      "Analysts can inspect the trend, open the scene behind any observation, and distinguish a one-off event from a sustained pattern.",
    visual: "trend",
  },
  {
    slug: "sovereign-delivery",
    number: "05",
    eyebrow: "Sovereign Delivery",
    title: "Keep mission data and reviewed outputs under customer control.",
    summary:
      "Support controlled deployment and delivery where the customer retains authority over imagery, review, models, and approved findings.",
    thesis:
      "Using more than one imagery provider should not force the analysis and review process into more than one provider portal.",
    problemTitle: "Every handoff adds a control point.",
    problem:
      "Imagery may pass through provider portals, processing systems, review teams, and downstream consumers. Access, provenance, and approval state need to survive those handoffs.",
    approachTitle: "Keep collection sources separate from review authority.",
    approach: [
      "Accept imagery from multiple providers into one downstream review process.",
      "Attach evidence, analyst action, and approval state to each derived finding.",
      "Support controlled integration and deployment patterns, including sovereign environments where required.",
    ],
    outputs: [
      "Controlled intelligence delivery",
      "Provenance attached to reviewed findings",
      "API and briefing-ready output formats",
      "Deployment options aligned with customer authority",
    ],
    outputTitle: "Reviewed intelligence that keeps its chain of evidence.",
    outcome:
      "MIAR sits between imagery supply and the teams or systems that consume reviewed intelligence, without claiming ownership of the collection itself.",
    visual: "delivery",
  },
];

export const getSolution = (slug: string) =>
  solutions.find((solution) => solution.slug === slug);
