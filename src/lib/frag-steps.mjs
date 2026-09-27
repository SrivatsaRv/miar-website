/** Scroll progress (0–1) through the fragmentation section → story step (0–3). */
export const FRAG_THRESHOLDS = [0.1, 0.42, 0.66];

export function fragStep(progress) {
  const p = Number.isFinite(progress) ? progress : 0;
  return FRAG_THRESHOLDS.filter((threshold) => p >= threshold).length;
}

/** Scroll progress within a pinned section, from its bounding rect and the viewport height. */
export function pinnedProgress(top, height, viewportHeight) {
  const span = height - viewportHeight;
  if (span <= 0) return top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -top / span));
}
