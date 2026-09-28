// Guardrail: UI colour must come from design tokens (src/styles/global.css). Raw colour
// literals are allowed only in the token block and in the imagery palettes below, which
// describe what satellite imagery looks like and stay the same in both themes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const IMAGERY = new Set([
  // Optical (EO) ground, runway, hangars and aircraft
  "#57534a", "#4a5642", "#8b877b", "#2a2d2f", "#2a2a25", "#5b5847", "#b9b3a3", "#efece4", "#e9e6dd",
  "#6c685b", "#58624c", "#908b7e", "#2b2e30",
  // SAR background, speckle and returns
  "#0a0d10", "#030405", "#0b0f12", "#cfe0e8", "#bfe3ff", "#e9f4f8",
  "rgba(191,227,255,0)", "rgba(233,244,248,0.85)", "rgba(255,255,255,1)",
  // Hyperspectral material classes
  "#7d6538", "#23806a", "#6d7789", "#262c3a", "#4f79a6", "#d6dbe0", "#a07ccf", "#a9ad3d",
  // Cloud cover on unusable scenes
  "rgba(245,245,242,0.95)", "rgba(245,245,242,0)",
]);
const ALWAYS = new Set(["#000", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]); // masks and shadows
const LAYOUT_META = new Set(["#f4f3ef", "#0e1214"]); // no-JS theme-color fallbacks

const root = path.resolve(import.meta.dirname, "../..");
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const files = [
  ...walk(path.join(root, "src/components")),
  ...walk(path.join(root, "src/pages")).filter((f) => f.endsWith(".astro")),
  ...walk(path.join(root, "src/layouts")),
  path.join(root, "src/styles/global.css"),
  path.join(root, "public/site.js"),
];
const literal = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])|rgba?\([^)$]*\)/g;

test("components use design tokens, not raw colours", () => {
  const offenders = [];
  for (const file of files) {
    let text = readFileSync(file, "utf8");
    if (file.endsWith("global.css")) text = text.slice(text.indexOf("/* ---------- Reset"));
    for (const match of text.match(literal) ?? []) {
      const value = match.toLowerCase().replace(/\s/g, "");
      const allowed = IMAGERY.has(value) || ALWAYS.has(value) || (file.endsWith("BaseLayout.astro") && LAYOUT_META.has(value));
      if (!allowed) offenders.push(`${path.relative(root, file)}: ${match}`);
    }
  }
  assert.deepEqual(offenders, [], `Use a token from src/styles/global.css instead:\n${offenders.join("\n")}`);
});

test("every token has a dark value, and both dark blocks agree", () => {
  const css = readFileSync(path.join(root, "src/styles/global.css"), "utf8");
  const block = (selector) => {
    const start = css.indexOf(selector);
    return css.slice(start, css.indexOf("}", start));
  };
  const names = (text) => new Set([...text.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]));
  const values = (text) => Object.fromEntries([...text.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const explicit = values(block(':root[data-theme="dark"],'));
  const system = values(block(':root:not([data-theme="light"])'));
  assert.deepEqual(system, explicit, "system-dark and explicit-dark tokens must match");
  const colourTokens = [...names(block(":root {"))].filter((n) => /^--(paper|ink|rule|panel|on-panel|signal-ink|ok|header-bg|placeholder|body-ink|sensor)/.test(n));
  for (const name of colourTokens) assert.ok(name in explicit, `${name} has no dark value`);
});
