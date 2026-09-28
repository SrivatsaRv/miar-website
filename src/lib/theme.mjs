/**
 * Theme runtime helpers for code that paints outside CSS (canvas, map libraries).
 * CSS stays the source of truth: these read the resolved design tokens and notify on change.
 */

/** Parse #rgb or #rrggbb into [r, g, b]. Returns null for anything else. */
export function parseHex(value) {
  const hex = String(value).trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) return [...hex].map((c) => parseInt(c + c, 16));
  if (/^[0-9a-f]{6}$/i.test(hex)) return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return null;
}

/** rgba() string from a hex token value and an alpha, for canvas APIs. */
export function withAlpha(hexValue, alpha) {
  const rgb = parseHex(hexValue);
  if (!rgb) return hexValue;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0, Math.min(1, alpha))})`;
}

/** Current value of a design token on :root (browser only). */
export function token(name, element = document.documentElement) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

/** Call `callback` whenever the effective theme changes (toggle or system setting). */
export function onThemeChange(callback) {
  document.addEventListener("themechange", callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    document.removeEventListener("themechange", callback);
    media.removeEventListener("change", callback);
  };
}
