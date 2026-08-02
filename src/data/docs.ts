export const docsSections = [
  {
    slug: "dataset-versioning",
    number: "01",
    shortTitle: "Dataset versioning",
    eyebrow: "Data custody",
    title: "Version training data without putting it in Git.",
    summary:
      "Use Git, DVC, and object storage together so a model release can resolve the exact corpus that produced it.",
  },
  {
    slug: "model-packages",
    number: "02",
    shortTitle: "Model packages",
    eyebrow: "Release evidence",
    title: "Treat a model as evidence, not a weights file.",
    summary:
      "Package weights with ontology, suitability limits, benchmark evidence, checksums, and rollback identity.",
  },
  {
    slug: "systems-of-record",
    number: "03",
    shortTitle: "Systems of record",
    eyebrow: "MLOps architecture",
    title: "Give every ML record one authoritative home.",
    summary:
      "Separate binary custody, dataset identity, experiment history, release approval, and runtime state.",
  },
  {
    slug: "contributor-workflow",
    number: "04",
    shortTitle: "Contributor workflow",
    eyebrow: "Team operations",
    title: "Move data safely across a multi-contributor team.",
    summary:
      "Use scoped credentials, reproducible pulls, explicit publication, and review gates for every corpus or model change.",
  },
] as const;

export type DocsSlug = (typeof docsSections)[number]["slug"];

export const docsPath = (slug: DocsSlug) => `/docs/${slug}/`;
