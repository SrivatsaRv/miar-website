import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDirectory = path.resolve("public/social");

// Right-hand plate: a darkened crop of the 2026 follow-on scene, centred on the eastern hardstand.
const plate = await sharp(await readFile(path.resolve("assets/source-imagery/monitored-site-follow-on-2026.png")))
  .extract({ left: 1010, top: 250, width: 520, height: 546 })
  .resize(540, 630)
  .modulate({ brightness: 0.78, saturation: 0.7 })
  .jpeg({ quality: 82 })
  .toBuffer();
const plateUri = `data:image/jpeg;base64,${plate.toString("base64")}`;

const cards = [
  {
    file: "a-satellite-image-is-not-yet-intelligence.png",
    eyebrow: "ANALYSIS",
    lines: ["A satellite image", "is not yet", "intelligence."],
  },
  {
    file: "why-repeat-coverage-matters.png",
    eyebrow: "TRADECRAFT",
    lines: ["Why repeat", "coverage matters."],
  },
  {
    file: "miar-site-preview.jpg",
    eyebrow: "IMAGERY INTELLIGENCE",
    lines: ["Know what", "changed at every", "site you watch."],
  },
];

const escapeXml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const sans = "Helvetica Neue, Helvetica, Arial, sans-serif";
const mono = "SF Mono, Menlo, monospace";

const cardSvg = ({ eyebrow, lines }) => `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="1200" height="630" fill="#f4f3ef"/>
  <image x="660" y="0" width="540" height="630" preserveAspectRatio="xMidYMid slice" xlink:href="${plateUri}"/>
  <line x1="660" y1="0" x2="660" y2="630" stroke="#0e1113" stroke-width="2"/>
  <path d="M990 294v-18h18M1048 276h18v18M1066 334v18h-18M1008 352h-18v-18" fill="none" stroke="#e4571e" stroke-width="4"/>
  <rect x="990" y="364" width="146" height="30" fill="#e4571e"/>
  <text x="1002" y="385" fill="#ffffff" font-family="${mono}" font-size="15" letter-spacing="1.5">NEW POSITION</text>

  <path d="M64 76V60h16M104 60h16v16M120 100v16h-16M80 116H64v-16" fill="none" stroke="#0e1113" stroke-width="3.2"/>
  <rect x="82" y="78" width="20" height="20" fill="#e4571e"/>
  <text x="140" y="97" fill="#0e1113" font-family="${sans}" font-size="30" font-weight="700" letter-spacing="1">MIAR</text>
  <text x="236" y="96" fill="#6b7176" font-family="${mono}" font-size="14" letter-spacing="1.5">BY REACHDEFENCE</text>

  <text x="64" y="${lines.length === 3 ? 238 : 290}" fill="#b8400f" font-family="${mono}" font-size="17" letter-spacing="2">${escapeXml(eyebrow)}</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="62" y="${(lines.length === 3 ? 318 : 370) + index * 74}" fill="#0e1113" font-family="${sans}" font-size="68" font-weight="500" letter-spacing="-2.4">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="64" y1="548" x2="596" y2="548" stroke="#0e1113" stroke-width="1.5"/>
  <text x="64" y="584" fill="#3f454a" font-family="${mono}" font-size="15" letter-spacing="1">MIAR.REACHDEFENCE.COM</text>
</svg>`;

await mkdir(outputDirectory, { recursive: true });

for (const card of cards) {
  const image = sharp(Buffer.from(cardSvg(card)));
  const output = path.join(outputDirectory, card.file);
  if (card.file.endsWith(".jpg")) {
    await image.jpeg({ quality: 86, mozjpeg: true }).toFile(output);
  } else {
    await image.png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(output);
  }
}
