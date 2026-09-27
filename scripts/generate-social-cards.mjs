/**
 * Link-preview cards and tab icons.
 *
 * Cards are rendered in headless Chromium with the site's own fonts and imagery, then
 * compressed to JPEG. Run after changing page titles, solutions or articles:
 *
 *   npm run generate:social
 *
 * Output (committed, not built in CI so fonts can't drift):
 *   public/social/v2/*.jpg        one 1200×630 card per page
 *   public/favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png,
 *   icon-maskable-512.png, site.webmanifest
 *
 * Layout keeps the brand and headline inside the centre 600px column, so WhatsApp's
 * square crop and X/LinkedIn's full 1.91:1 card both read correctly.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "@playwright/test";

const root = path.resolve(".");
const out = path.join(root, "public/social/v2");
await mkdir(out, { recursive: true });

// ---------- Content ----------

const solutionsSource = await readFile(path.join(root, "src/data/solutions.ts"), "utf8");
const solutions = [...solutionsSource.matchAll(/slug: "([^"]+)",\s*number: "(\d+)",[\s\S]*?name: "([^"]+)",[\s\S]*?title: "([^"]+)"/g)].map(
  ([, slug, number, name, title]) => ({ slug, number, name, title })
);

const posts = [];
for (const file of await readdir(path.join(root, "src/content/blog"))) {
  if (!file.endsWith(".md")) continue;
  const text = await readFile(path.join(root, "src/content/blog", file), "utf8");
  const field = (key) => text.match(new RegExp(`^${key}: "([^"]*)"`, "m"))?.[1] ?? "";
  posts.push({ slug: file.replace(/\.md$/, ""), title: field("title"), category: field("category") });
}

const cards = [
  { file: "home", label: "Post-reception imagery exploitation", title: "Know what changed at every site you watch." },
  { file: "solutions", label: "Solutions", title: "One review process for every question about a site." },
  { file: "how-it-works", label: "How it works", title: "From received scene to qualified finding." },
  { file: "insights", label: "Insights", title: "Imagery intelligence, explained plainly." },
  ...solutions.map((s) => ({ file: `solution-${s.slug}`, label: `Solutions · ${s.number} ${s.name}`, title: s.title })),
  ...posts.map((p) => ({ file: `post-${p.slug}`, label: `Insights · ${p.category}`, title: p.title })),
];

// ---------- Assets as data URIs ----------

const dataUri = async (file, type) => `data:${type};base64,${(await readFile(path.join(root, file))).toString("base64")}`;
const geist = await dataUri("public/fonts/geist-latin-variable.woff2", "font/woff2");
const geistMono = await dataUri("public/fonts/geist-mono-latin-variable.woff2", "font/woff2");

const scene = path.join(root, "assets/source-imagery/monitored-site-follow-on-2026.png");
const crop = async (left, top, size, mode) => {
  let image = sharp(scene).extract({ left, top, width: size, height: size }).resize(120, 120);
  if (mode === "sar") image = image.grayscale().linear(1.6, -120).modulate({ brightness: 0.7 });
  if (mode === "dim") image = image.modulate({ brightness: 0.72, saturation: 0.75 });
  return `data:image/jpeg;base64,${(await image.jpeg({ quality: 78 }).toBuffer()).toString("base64")}`;
};

// Record strip: the same apron over time, last passes carrying the change.
const strip = [];
const stripSpots = [[420, 430], [900, 380], [1000, 390], [1250, 440], [860, 560], [640, 740], [880, 700], [430, 430], [1250, 430], [620, 740]];
for (const [i, [x, y]] of stripSpots.entries()) strip.push({ src: await crop(x, y, 190, i % 3 === 1 ? "sar" : "dim"), change: i >= 8 });

// Scattered scenes at the edges (outside the square-crop safe zone).
const scatter = [];
const scatterSpots = [
  [40, 70, -9], [150, 220, 7], [60, 400, 4], [180, 500, -6], [1040, 60, 8], [1110, 230, -5], [980, 380, 6], [1090, 480, -8],
];
for (const [i, [x, y, r]] of scatterSpots.entries()) {
  scatter.push({ x, y, r, src: await crop(300 + i * 130, 250 + (i % 4) * 150, 260, i % 2 ? "sar" : "dim") });
}

// ---------- Template ----------

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const titleSize = (title) => (title.length > 58 ? 50 : title.length > 44 ? 56 : 64);

const html = (card) => `<!doctype html><html><head><style>
@font-face { font-family: Geist; src: url(${geist}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: "Geist Mono"; src: url(${geistMono}) format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0b0e10; color: #f2f1ec; font-family: Geist, sans-serif; position: relative; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(242,241,236,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(242,241,236,.05) 1px, transparent 1px); background-size: 42px 42px; -webkit-mask-image: radial-gradient(ellipse 60% 70% at 50% 45%, #000 25%, transparent 80%); }
.tile { position: absolute; width: 74px; height: 74px; border: 1px solid rgba(242,241,236,.28); background-size: cover; opacity: .55; }
.center { position: absolute; left: 300px; width: 600px; top: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; text-align: center; }
.brand { margin-top: 58px; display: flex; align-items: center; gap: 12px; }
.brand svg { width: 34px; height: 34px; }
.brand b { font-size: 26px; font-weight: 600; letter-spacing: .02em; }
.brand span { font-family: "Geist Mono"; font-size: 13px; letter-spacing: .06em; text-transform: uppercase; color: rgba(242,241,236,.55); }
.label { margin-top: 44px; font-family: "Geist Mono"; font-size: 15px; letter-spacing: .08em; text-transform: uppercase; color: #ff7b45; }
h1 { margin-top: 18px; font-weight: 500; letter-spacing: -.035em; line-height: 1.02; text-wrap: balance; }
.strip { position: absolute; bottom: 88px; display: flex; gap: 6px; }
.strip i { width: 54px; height: 54px; background-size: cover; border: 1px solid rgba(242,241,236,.3); }
.strip i.change { border: 2px solid #e4571e; box-shadow: 0 0 0 3px rgba(228,87,30,.18); }
.url { position: absolute; bottom: 42px; font-family: "Geist Mono"; font-size: 14px; letter-spacing: .06em; color: rgba(242,241,236,.55); }
</style></head><body>
<div class="grid"></div>
${scatter.map((t) => `<div class="tile" style="left:${t.x}px;top:${t.y}px;transform:rotate(${t.r}deg);background-image:url(${t.src})"></div>`).join("")}
<div class="center">
  <div class="brand">
    <svg viewBox="0 0 32 32" fill="none"><path d="M2 10V2h8M22 2h8v8M30 22v8h-8M10 30H2v-8" stroke="#f2f1ec" stroke-width="2.4"/><rect x="11" y="11" width="10" height="10" fill="#E4571E"/></svg>
    <b>MIAR</b><span>by ReachDefence</span>
  </div>
  <p class="label">${escape(card.label)}</p>
  <h1 style="font-size:${titleSize(card.title)}px">${escape(card.title)}</h1>
  <div class="strip">${strip.map((t) => `<i class="${t.change ? "change" : ""}" style="background-image:url(${t.src})"></i>`).join("")}</div>
  <p class="url">miar.reachdefence.com</p>
</div>
</body></html>`;

// ---------- Render ----------

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of cards) {
  await page.setContent(html(card), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(path.join(out, `${card.file}.jpg`));
  console.log(`social/v2/${card.file}.jpg`);
}

// ---------- Icons ----------

const markSvg = (size, { pad = 0, bg = "#0b0e10", radius = 0 } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
  <rect width="32" height="32" rx="${radius}" fill="${bg}"/>
  <g transform="translate(${pad} ${pad}) scale(${(32 - pad * 2) / 32})">
    <path d="M6 12V6h6M20 6h6v6M26 20v6h-6M12 26H6v-6" fill="none" stroke="#f2f1ec" stroke-width="2.4"/>
    <rect x="12.5" y="12.5" width="7" height="7" fill="#E4571E"/>
  </g>
</svg>`;

const png = (svg) => sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(path.join(root, "public/favicon.svg"), markSvg(32, { radius: 6 }).trim() + "\n");
await writeFile(path.join(root, "public/apple-touch-icon.png"), await png(markSvg(180, { pad: 3 })));
await writeFile(path.join(root, "public/icon-192.png"), await png(markSvg(192, { radius: 6 })));
await writeFile(path.join(root, "public/icon-512.png"), await png(markSvg(512, { radius: 6 })));
await writeFile(path.join(root, "public/icon-maskable-512.png"), await png(markSvg(512, { pad: 5 })));

// favicon.ico with 16, 32 and 48 px PNG entries.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(markSvg(s, { radius: s >= 32 ? 5 : 3 }))));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((image, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i], 0);
  entry.writeUInt8(sizes[i], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  return entry;
});
await writeFile(path.join(root, "public/favicon.ico"), Buffer.concat([header, ...entries, ...images]));

await writeFile(
  path.join(root, "public/site.webmanifest"),
  JSON.stringify(
    {
      name: "MIAR by ReachDefence",
      short_name: "MIAR",
      description: "Post-reception imagery exploitation for defence imagery teams.",
      start_url: "/",
      display: "browser",
      background_color: "#0b0e10",
      theme_color: "#0b0e10",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    null,
    2
  ) + "\n"
);
console.log("icons + site.webmanifest");

await browser.close();
