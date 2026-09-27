/**
 * Export every site visual as a standalone asset for press and partners.
 *
 *   npm run dev                      # in another terminal
 *   npm run export:widgets           # BASE=http://localhost:3004 by default
 *
 * Output: public/interactive-widgets/
 *   *.svg  standalone SVG: computed styles inlined, Geist fonts and imagery embedded,
 *          SMIL animation kept (opens in any browser or vector tool, no dependencies)
 *   *.gif  animated capture of interactive or animated widgets, or a still for static ones
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

// ---------- GIF capture ----------
const frames = [];
const grab = async (page, selector, hold = 1) => {
  const buffer = await page.locator(selector).first().screenshot();
  for (let i = 0; i < hold; i++) frames.push(buffer);
};
const writeGif = async (file, { delay = 120, width = 960 } = {}) => {
  // Encode with PIL (python3) for a compact adaptive palette; sharp handles resize.
  const dir = path.join(tmp, file.replace(/\W/g, "_"));
  await mkdir(dir, { recursive: true });
  const names = [];
  for (const [i, buffer] of frames.entries()) {
    const name = path.join(dir, `${String(i).padStart(4, "0")}.png`);
    await sharp(buffer).resize({ width, withoutEnlargement: true }).png().toFile(name);
    names.push(name);
  }
  const { execFileSync } = await import("node:child_process");
  execFileSync("python3", ["-c", `
import sys, glob
from PIL import Image
files = sorted(glob.glob(sys.argv[1] + "/*.png"))
raw = [Image.open(f).convert("RGB") for f in files]
# Interactive widgets change height as they are used; pad every frame to one size.
W = max(im.width for im in raw); H = max(im.height for im in raw)
ims = []
for im in raw:
    canvas = Image.new("RGB", (W, H), im.getpixel((2, 2)))
    canvas.paste(im, (0, 0))
    ims.append(canvas)
# Palette from frames across the whole animation, so colours that only appear late (the contract) survive.
picks = [ims[i] for i in sorted({0, len(ims)//4, len(ims)//2, 3*len(ims)//4, len(ims)-1})]
w, h = picks[0].size
strip = Image.new("RGB", (w, h * len(picks)))
for k, im in enumerate(picks): strip.paste(im.resize((w, h)), (0, k * h))
pal = strip.quantize(colors=200, method=Image.Quantize.MEDIANCUT)
q = [im.quantize(palette=pal, dither=Image.Dither.NONE) for im in ims]
q[0].save(sys.argv[2], save_all=True, append_images=q[1:], duration=int(sys.argv[3]), loop=0, optimize=True, disposal=1)
`, dir, path.join(out, file), String(delay)]);
  frames.length = 0;
  console.log(`  ${file}`);
};

const browser = await chromium.launch();
const open = async (route, { width = 1440, height = 1500 } = {}) => {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1.5, colorScheme: "light", reducedMotion: "no-preference" });
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  // Keep captures clean: no page-level overlays (progress rail, dev toolbar) in any frame.
  await page.addStyleTag({ content: "[data-rail], astro-dev-toolbar { display: none !important; }" });
  await page.evaluate(() => document.querySelectorAll(".section").forEach((s) => s.classList.add("is-in")));
  await page.waitForTimeout(800);
  return page;
};
const scrollTo = (page, selector, block = "center") => page.evaluate(([s, b]) => document.querySelector(s).scrollIntoView({ block: b }), [selector, block]);

// 1. Hero scene field: scattered scenes settle into one site record, contract issued.
console.log("hero-scene-field");
{
  const page = await open("/", { height: 900 });
  await page.waitForTimeout(1600);
  const span = await page.evaluate(() => document.querySelector("[data-field]").getBoundingClientRect().height - innerHeight);
  for (let i = 0; i <= 40; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (span * i) / 40);
    await page.waitForTimeout(70);
    await grab(page, ".field-sticky", i === 0 ? 10 : i === 40 ? 16 : 1);
  }
  await writeGif("hero-scene-field.gif", { delay: 90, width: 1080 });
  await page.close();
}

// 2. Sensor-stack workbench: EO / SAR / HSI layers, candidates, layer peel.
console.log("sensor-stack-workbench");
{
  const page = await open("/");
  await scrollTo(page, "[data-sensor-stack]");
  await page.waitForTimeout(600);
  await writeSvg(page, "[data-sensor-stack] svg", "sensor-stack-workbench.svg", "MIAR sensor stack: optical, radar and hyperspectral layers fused into one assessment");
  for (const id of ["C-2", "C-3", "C-4", "C-1"]) {
    await page.locator(`[data-sensor-stack] .wb-cands [data-select="${id}"]`).click();
    await page.waitForTimeout(450);
    await grab(page, "[data-sensor-stack]", 3);
    for (const layer of ["eo", "sar", "hsi"]) {
      await page.locator(`[data-panel="${id}"] [data-peel="${layer}"]`).hover();
      await page.waitForTimeout(500);
      await grab(page, "[data-sensor-stack]", 2);
    }
    await page.mouse.move(5, 5);
    await page.waitForTimeout(450);
  }
  await writeGif("sensor-stack-workbench.gif", { delay: 450, width: 820 });
  await page.close();
}

// 3. Fragmentation flow: fragmented tool chain collapsing into MIAR.
console.log("fragmentation-flow");
{
  const page = await open("/");
  const frag = await page.evaluate(() => { const r = document.querySelector("[data-frag]").getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
  const at = async (p) => { await page.evaluate(([t, h, p]) => window.scrollTo(0, t + (h - innerHeight) * p), [frag.top, frag.h, p]); };
  for (const [p, n] of [[0.02, 6], [0.28, 12], [0.55, 12], [0.9, 14]]) {
    await at(p);
    for (let i = 0; i < n; i++) { await page.waitForTimeout(110); await grab(page, "[data-frag] .frag-grid"); }
    if (p === 0.28) { await page.waitForTimeout(1200); await writeSvg(page, "[data-frag] .frag-figure svg", "fragmentation-today.svg", "Imagery from five sources through nine separate tools"); }
    if (p === 0.9) { await page.waitForTimeout(1200); await writeSvg(page, "[data-frag] .frag-figure svg", "fragmentation-through-miar.svg", "Five sources through one MIAR post-reception layer to one intelligence contract"); }
  }
  await grab(page, "[data-frag] .frag-grid", 10);
  await writeGif("fragmentation-flow.gif", { delay: 130, width: 1080 });
  await page.close();
}

// 4. Change compare: 2025 baseline against 2026, drag sweep.
console.log("change-compare");
{
  const page = await open("/");
  await scrollTo(page, "[data-compare]");
  await page.waitForTimeout(2500);
  const set = (v) => page.evaluate((v) => { const r = document.querySelector("[data-compare-range]"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); }, v);
  await set(50);
  await writeSvg(page, "[data-compare] svg", "change-compare.svg", "Same airbase apron, 2025 baseline and 2026 current scene, with changes marked");
  const path1 = [...Array(18)].map((_, i) => 50 - i * 2.2).concat([...Array(34)].map((_, i) => 12 + i * 2.2), [...Array(18)].map((_, i) => 85 - i * 1.95));
  for (const v of path1) { await set(v); await page.waitForTimeout(30); await grab(page, "[data-compare]"); }
  await grab(page, "[data-compare]", 8);
  await writeGif("change-compare.gif", { delay: 70, width: 1080 });
  await page.close();
}

// 5. Detection taxonomy drill-down.
console.log("detection-taxonomy");
{
  const page = await open("/");
  await scrollTo(page, "[data-tx]", "start");
  await page.waitForTimeout(600);
  await grab(page, "[data-tx] .tx-cols", 3);
  for (const id of ["transport", "transport-unresolved", "rotary", "ships", "submarine", "ssk-drydock", "vehicles"]) {
    await page.locator(`[data-tx] .tx-node[data-id="${id}"]`).click();
    await page.waitForTimeout(450);
    await grab(page, "[data-tx]", 3);
  }
  await writeGif("detection-taxonomy.gif", { delay: 650, width: 1080 });
  await page.close();
}

// 6. Border watch: threat perception per observed airbase across the IB.
console.log("border-watch");
{
  const page = await open("/");
  await scrollTo(page, "[data-bw]");
  await page.waitForTimeout(4000);
  for (const id of ["a", "b", "c"]) {
    await page.locator(`[data-bw-pick="${id}"]`).click();
    await page.waitForTimeout(700);
    await grab(page, "[data-bw]", 4);
  }
  await writeGif("border-watch.gif", { delay: 700, width: 1080 });
  await page.close();
}

// 7. Static homepage visuals as stills.
console.log("homepage stills");
{
  const page = await open("/");
  for (const [selector, file, width] of [
    [".flow", "workflow-five-steps.gif", 1080],
    [".matrix-layout", "sensor-matrix.gif", 1080],
    [".detectors", "detection-models.gif", 1080],
    [".record", "evidence-record.gif", 820],
    ["[data-contract]", "intelligence-contract.gif", 1080],
  ]) {
    await scrollTo(page, selector);
    await page.waitForTimeout(2600);
    await grab(page, selector);
    await writeGif(file, { width });
  }
  await page.close();
}

// 8. Capabilities pipeline: satellites over the AOI to an intelligence contract (animated SVG + GIF).
console.log("pipeline");
{
  const page = await open("/capabilities/");
  await scrollTo(page, "[data-ph]");
  await page.waitForTimeout(1500);
  await writeSvg(page, "[data-ph] .ph-wide", "capabilities-pipeline.svg", "Provider satellites over an AOI, customer storage, the MIAR pipeline and an intelligence contract");
  for (let i = 0; i < 60; i++) { await page.waitForTimeout(110); await grab(page, "[data-ph] .ph-wide"); }
  await writeGif("capabilities-pipeline.gif", { delay: 110, width: 1080 });
  await page.close();
  const tall = await open("/capabilities/", { width: 390, height: 844 });
  await scrollTo(tall, "[data-ph]");
  await tall.waitForTimeout(1200);
  await writeSvg(tall, "[data-ph] .ph-tall", "capabilities-pipeline-vertical.svg", "Vertical version: provider satellites to an intelligence contract");
  await tall.close();
}

// 9. Solution page visuals.
console.log("solution visuals");
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
{
  const page = await open("/solutions/military-asset-monitoring/");
  await scrollTo(page, ".solution-evidence-monitor");
  await page.waitForTimeout(900);
  await grab(page, ".solution-evidence-monitor");
  await writeGif("asset-register.gif", { width: 1080 });
  await page.close();
}

await browser.close();
const { rm } = await import("node:fs/promises");
await rm(tmp, { recursive: true, force: true });
console.log("done");
