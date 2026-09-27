/**
 * Pure state for the processing rail.
 *
 * sections: [{ stage, top, bottom }] in viewport coordinates (getBoundingClientRect),
 * in document order. Only sections that belong to a pipeline stage are passed in.
 * The reading line ("probe") sits at `probeRatio` of the viewport height.
 *
 * Returns { visible, complete, stage, progress, track, index }:
 * - visible:  the rail should be on screen
 * - complete: the last stage's sections have been read (shown briefly before hiding)
 * - stage:    current stage index (0-based)
 * - progress: 0–1 across the whole pipeline, continuous within each stage
 * - track:    0–1 fill for a rail whose stage dots sit at i / (stageCount - 1),
 *             so the fill reaches a stage's dot exactly as that stage begins
 * - index:    index of the section under the probe (for its status text)
 */
export function railState(sections, viewportHeight, stageCount, options = {}) {
  const { probeRatio = 0.5, holdRatio = 0.35 } = options;
  const hidden = { visible: false, complete: false, stage: 0, progress: 0, track: 0, index: -1 };
  if (!sections.length || stageCount < 1) return hidden;

  const probe = viewportHeight * probeRatio;
  const first = sections[0];
  const last = sections[sections.length - 1];

  if (probe < first.top) return hidden;

  if (probe > last.bottom) {
    const pastBy = probe - last.bottom;
    if (pastBy > viewportHeight * holdRatio) return { ...hidden, complete: true, stage: stageCount - 1, progress: 1, track: 1 };
    return { visible: true, complete: true, stage: stageCount - 1, progress: 1, track: 1, index: sections.length - 1 };
  }

  let index = 0;
  sections.forEach((section, i) => {
    if (section.top <= probe) index = i;
  });
  const stage = sections[index].stage;

  const inStage = sections.filter((section) => section.stage === stage);
  const spanTop = inStage[0].top;
  const spanBottom = inStage[inStage.length - 1].bottom;
  const within = Math.min(1, Math.max(0, (probe - spanTop) / Math.max(1, spanBottom - spanTop)));

  return {
    visible: true,
    complete: false,
    stage,
    progress: Math.min(1, (stage + within) / stageCount),
    track: stageCount > 1 ? Math.min(1, (stage + within) / (stageCount - 1)) : 1,
    index,
  };
}
