/**
 * Export every site visual as a standalone asset for press and partners.
 *
 *   npm run dev                      # in another terminal
 *   npm run export:widgets           # BASE=http://localhost:3004 by default
 *
 * Output: public/interactive-widgets/
 *   *.svg  standalone SVG: computed styles inlined, Geist fonts and imagery embedded,
 *          SMIL animation kept (opens in any browser or vector tool, no dependencies)
 *   *.gif  animated capture of the interactive widgets only, recorded at 2x pixel density
 *          with a per-frame 256-colour palette and real frame timings
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "@playwright/test";

const BASE = (process.env.BASE || "http://localhost:3004").replace(/\/$/, "");
const out = path.resolve("public/interactive-widgets");
const tmp = path.join(out, ".frames");
await mkdir(tmp, { recursive: true });

const fontCss = async () => {
  const b64 = async (f) => (await readFile(path.resolve("public/fonts", f))).toString("base64");
  return `@font-face{font-family:"Geist";src:url(data:font/woff2;base64,${await b64("geist-latin-variable.woff2")}) format("woff2");font-weight:100 900}` +
    `@font-face{font-family:"Geist Mono";src:url(data:font/woff2;base64,${await b64("geist-mono-latin-variable.woff2")}) format("woff2");font-weight:100 900}`;
};
const FONTS = await fontCss();

const imageCache = new Map();
const embedImage = async (href) => {
  if (imageCache.has(href)) return imageCache.get(href);
  const file = path.resolve("public", href.replace(/^\//, ""));
  const jpeg = await sharp(await readFile(file)).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  const uri = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  imageCache.set(href, uri);
  return uri;
};

// ---------- SVG serialisation (runs in the page) ----------
const serialiseSvg = (selector) => {
  const PROPS = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-dashoffset",
    "stroke-linecap", "stroke-linejoin", "opacity", "font-family", "font-size", "font-weight", "letter-spacing", "text-anchor",
    "dominant-baseline", "display", "visibility", "filter", "mix-blend-mode"];
  const source = document.querySelector(selector);
  if (!source) return null;
  const clone = source.cloneNode(true);
  const srcAll = [source, ...source.querySelectorAll("*")];
  const dstAll = [clone, ...clone.querySelectorAll("*")];
  srcAll.forEach((node, i) => {
    const cs = getComputedStyle(node);
    const target = dstAll[i];
    const style = PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";");
    const transform = cs.getPropertyValue("transform");
    const cssTransform = transform && transform !== "none" && !node.getAttribute("transform") ? `;transform:${transform};transform-box:${cs.getPropertyValue("transform-box")};transform-origin:${cs.getPropertyValue("transform-origin")}` : "";
    target.setAttribute("style", style + cssTransform);
    target.removeAttribute("class");
  });
  const vb = source.viewBox.baseVal;
  // Paint the surrounding panel's background into the SVG so it stands alone on any page.
  let bg = null;
  for (let n = source.parentElement; n && !bg; n = n.parentElement) {
    const c = getComputedStyle(n).backgroundColor;
    if (c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c)) bg = c;
  }
  if (bg) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(vb.x));
    rect.setAttribute("y", String(vb.y));
    rect.setAttribute("width", String(vb.width));
    rect.setAttribute("height", String(vb.height));
    rect.setAttribute("style", `fill:${bg}`);
    clone.insertBefore(rect, clone.firstChild);
  }
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(vb.width));
  clone.setAttribute("height", String(vb.height));
  clone.removeAttribute("aria-hidden");
  const images = [...clone.querySelectorAll("image")].map((img) => img.getAttribute("href") || img.getAttribute("xlink:href"));
  return { markup: clone.outerHTML, images: [...new Set(images.filter(Boolean))] };
};

const writeSvg = async (page, selector, file, title) => {
  const result = await page.evaluate(serialiseSvg, selector);
  if (!result) throw new Error(`No SVG for ${selector}`);
  let markup = result.markup;
  for (const href of result.images) {
    if (href.startsWith("data:")) continue;
    markup = markup.split(`"${href}"`).join(`"${await embedImage(href)}"`);
  }
  markup = markup.replace(/^<svg([^>]*)>/, `<svg$1><title>${title}</title><style>${FONTS}</style>`);
  await writeFile(path.join(out, file), `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`);
  console.log(`  ${file}`);
};

// ---------- GIF capture (interactive widgets only) ----------
// Frames are captured at 2x pixel density. Each frame keeps its own duration, and the encoder
// builds a 256-colour palette per frame with Floyd-Steinberg dithering, so gradients and
// imagery do not band.
const frames = [];
const grab = async (page, selector, ms) => {
  frames.push({ buffer: await page.locator(selector).first().screenshot({ animations: "allow" }), ms });
};
// Record a transition: several frames over `total` ms, then hold the settled state.
const settle = async (page, selector, { total = 520, step = 65, hold = 900 } = {}) => {
  for (let t = 0; t < total; t += step) {
    await page.waitForTimeout(step);
    await grab(page, selector, step);
  }
  await grab(page, selector, hold);
};
const writeGif = async (file, { width = 1600 } = {}) => {
  const dir = path.join(tmp, file.replace(/\W/g, "_"));
  await mkdir(dir, { recursive: true });
  const durations = [];
  for (const [i, frame] of frames.entries()) {
    await sharp(frame.buffer).resize({ width, withoutEnlargement: true }).png().toFile(path.join(dir, `${String(i).padStart(4, "0")}.png`));
    durations.push(Math.max(20, Math.round(frame.ms / 10) * 10));
  }
  const { execFileSync } = await import("node:child_process");
  execFileSync("python3", ["-c", `
import sys, glob, json
from PIL import Image
files = sorted(glob.glob(sys.argv[1] + "/*.png"))
durations = json.loads(sys.argv[3])
raw = [Image.open(f).convert("RGB") for f in files]
W = max(im.width for im in raw); H = max(im.height for im in raw)
padded = []
for im in raw:
    canvas = Image.new("RGB", (W, H), im.getpixel((2, 2)))
    canvas.paste(im, (0, 0))
    padded.append(canvas)
# One 256-colour palette sampled from across the whole animation. A shared palette keeps the
# dither pattern identical between frames, so each frame only stores the pixels that change.
picks = padded[:: max(1, len(padded) // 16)]
thumb_w = W // 2; thumb_h = H // 2
sheet = Image.new("RGB", (thumb_w, thumb_h * len(picks)))
for k, im in enumerate(picks): sheet.paste(im.resize((thumb_w, thumb_h)), (0, k * thumb_h))
pal = sheet.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
frames = [im.quantize(palette=pal, dither=Image.Dither.FLOYDSTEINBERG) for im in padded]
frames[0].save(sys.argv[2], save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True, disposal=1)
`, dir, path.join(out, file), JSON.stringify(durations)]);
  frames.length = 0;
  console.log(`  ${file}`);
};

const browser = await chromium.launch();
const open = async (route, { width = 1440, height = 1500, scale = 2 } = {}) => {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale, colorScheme: "dark", reducedMotion: "no-preference" });
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  // Keep captures clean: no page-level overlays (progress rail, dev toolbar) in any frame.
  await page.addStyleTag({ content: "[data-rail], astro-dev-toolbar { display: none !important; }" });
  await page.evaluate(() => document.querySelectorAll(".section").forEach((s) => s.classList.add("is-in")));
  await page.waitForTimeout(800);
  return page;
};
const scrollTo = (page, selector, block = "center") => page.evaluate(([s, b]) => document.querySelector(s).scrollIntoView({ block: b }), [selector, block]);

// 1. Multi-layer detection: EO / SAR / HSI stack, four candidates, each sensor layer peeled.
console.log("sensor-stack-workbench");
{
  const page = await open("/");
  await scrollTo(page, "[data-sensor-stack]");
  await page.waitForTimeout(700);
  await writeSvg(page, "[data-sensor-stack] svg", "sensor-stack-workbench.svg", "MIAR sensor stack: optical, radar and hyperspectral layers fused into one assessment");
  const sel = "[data-sensor-stack]";
  await grab(page, sel, 1400);
  for (const id of ["C-2", "C-3", "C-4", "C-1"]) {
    await page.locator(`${sel} .wb-cands [data-select="${id}"]`).click();
    await settle(page, sel, { hold: 1200 });
    // Peel the layers where the sensors disagree: the decoy (C-3) and the hidden vehicle (C-4).
    if (id === "C-3" || id === "C-4") {
      for (const layer of ["eo", "sar", "hsi"]) {
        await page.locator(`[data-panel="${id}"] [data-peel="${layer}"]`).hover();
        await settle(page, sel, { hold: 1000 });
      }
      await page.mouse.move(5, 5);
      await settle(page, sel, { hold: 600 });
    }
  }
  await writeGif("sensor-stack-workbench.gif", { width: 1320 });
  await page.close();
}

// 2. Capabilities pipeline: SMIL animation stepped at exact times for even motion.
console.log("capabilities-pipeline");
{
  const page = await open("/capabilities/");
  await scrollTo(page, "[data-ph]");
  await page.waitForTimeout(1200);
  await writeSvg(page, "[data-ph] .ph-wide", "capabilities-pipeline.svg", "Provider satellites over an AOI, customer storage, the MIAR pipeline and an intelligence contract");
  await page.evaluate(() => document.querySelector("[data-ph] .ph-wide").pauseAnimations());
  const fps = 15;
  for (let i = 0; i < fps * 12; i++) {
    await page.evaluate((t) => document.querySelector("[data-ph] .ph-wide").setCurrentTime(t), 30 + i / fps);
    await grab(page, "[data-ph] .ph-wide", 1000 / fps);
  }
  await writeGif("capabilities-pipeline.gif", { width: 1600 });
  await page.close();
  const tall = await open("/capabilities/", { width: 390, height: 844, scale: 3 });
  await scrollTo(tall, "[data-ph]");
  await tall.waitForTimeout(1200);
  await writeSvg(tall, "[data-ph] .ph-tall", "capabilities-pipeline-vertical.svg", "Vertical version: provider satellites to an intelligence contract");
  await tall.close();
}

// 3. Fragmentation: nine separate tools collapsing into one MIAR layer.
console.log("fragmentation-flow");
{
  const page = await open("/", { height: 900 });
  const frag = await page.evaluate(() => { const r = document.querySelector("[data-frag]").getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
  const at = (p) => page.evaluate(([t, h, p]) => window.scrollTo(0, t + (h - innerHeight) * p), [frag.top, frag.h, p]);
  const sel = "[data-frag] .frag-grid";
  await at(0.02); await page.waitForTimeout(900); await grab(page, sel, 1400);
  await at(0.28); await settle(page, sel, { total: 1500, step: 75, hold: 2200 });
  await writeSvg(page, "[data-frag] .frag-figure svg", "fragmentation-today.svg", "Imagery from five sources through nine separate tools");
  await at(0.55); await settle(page, sel, { total: 1500, step: 75, hold: 1400 });
  await at(0.9); await settle(page, sel, { total: 1400, step: 75, hold: 2600 });
  await writeSvg(page, "[data-frag] .frag-figure svg", "fragmentation-through-miar.svg", "Five sources through one MIAR post-reception layer to one intelligence contract");
  await writeGif("fragmentation-flow.gif", { width: 1600 });
  await page.close();
}

// 4. Change compare: 2025 baseline against 2026, eased drag sweep.
console.log("change-compare");
{
  const page = await open("/");
  await scrollTo(page, "[data-compare]");
  await page.waitForTimeout(2500);
  const set = (v) => page.evaluate((v) => { const r = document.querySelector("[data-compare-range]"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); }, v);
  await set(50);
  await writeSvg(page, "[data-compare] svg", "change-compare.svg", "Same airbase apron, 2025 baseline and 2026 current scene, with changes marked");
  const sel = "[data-compare]";
  await grab(page, sel, 1000);
  const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;
  const sweep = async (from, to, n) => { for (let i = 1; i <= n; i++) { await set(from + (to - from) * ease(i / n)); await grab(page, sel, 45); } };
  await sweep(50, 8, 34); await grab(page, sel, 900);
  await sweep(8, 92, 60); await grab(page, sel, 900);
  await sweep(92, 50, 34); await grab(page, sel, 1400);
  await writeGif("change-compare.gif", { width: 1600 });
  await page.close();
}

// 5. Detection taxonomy drill-down.
console.log("detection-taxonomy");
{
  const page = await open("/");
  await scrollTo(page, "[data-tx]", "start");
  await page.waitForTimeout(700);
  const sel = "[data-tx]";
  await grab(page, sel, 1500);
  for (const id of ["transport", "transport-unresolved", "rotary", "ships", "submarine", "ssk-drydock", "vehicles"]) {
    await page.locator(`${sel} .tx-node[data-id="${id}"]`).click();
    await settle(page, sel, { total: 420, step: 60, hold: 1500 });
  }
  await writeGif("detection-taxonomy.gif", { width: 1600 });
  await page.close();
}

// 6. Border watch: threat perception per observed airbase across the IB.
console.log("border-watch");
{
  const page = await open("/");
  await scrollTo(page, "[data-bw]");
  await page.waitForTimeout(4500);
  const sel = "[data-bw]";
  for (const id of ["a", "b", "c"]) {
    await page.locator(`[data-bw-pick="${id}"]`).click();
    await settle(page, sel, { total: 360, step: 60, hold: 2200 });
  }
  await writeGif("border-watch.gif", { width: 1600 });
  await page.close();
}

// Static visuals: SVG only.
console.log("solution visuals (SVG)");
for (const [route, selector, file, title] of [
  ["/solutions/tactical-isr/", ".solution-scene svg", "tactical-isr-scene.svg", "Current pass of a monitored airbase with detections"],
  ["/solutions/military-asset-monitoring/", ".asset-register-map svg", "asset-register-map.svg", "Apron plan with each aircraft's position and moved stands"],
  ["/solutions/archive-trend/", "[data-trend] svg", "archive-trend-chart.svg", "Aircraft on the apron by type across twelve passes"],
  ["/solutions/sovereign-delivery/", ".delivery-desktop", "sovereign-delivery-flow.svg", "Providers into MIAR inside the customer boundary, approved output out"],
]) {
  const page = await open(route);
  await scrollTo(page, selector);
  await page.waitForTimeout(900);
  await writeSvg(page, selector, file, title);
  await page.close();
}

await browser.close();
const { rm } = await import("node:fs/promises");
await rm(tmp, { recursive: true, force: true });
console.log("done");
