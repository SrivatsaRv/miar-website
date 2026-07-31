import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDirectory = path.resolve("public/social");

const cards = [
  {
    file: "a-satellite-image-is-not-yet-intelligence.png",
    eyebrow: "IMAGERY INTELLIGENCE / ANALYSIS",
    lines: ["A satellite image", "is not yet intelligence."],
    footer: "SENSOR  /  TIME  /  EVIDENCE  /  REVIEW",
  },
  {
    file: "why-repeat-coverage-matters.png",
    eyebrow: "IMAGERY INTELLIGENCE / TRADECRAFT",
    lines: ["Why repeat coverage", "matters."],
    footer: "BASELINE  /  CADENCE  /  CHANGE  /  CONTEXT",
  },
];

const escapeXml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const cardSvg = ({ eyebrow, lines, footer }) => `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#20252c"/>
      <stop offset="0.46" stop-color="#141517"/>
      <stop offset="1" stop-color="#0d0e10"/>
    </linearGradient>
    <radialGradient id="signal" cx="0" cy="0" r="1" gradientTransform="translate(1030 92) rotate(135) scale(480)">
      <stop stop-color="#7896a4" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#7896a4" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d8dde2" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <rect width="1200" height="630" fill="url(#signal)"/>
  <rect x="720" width="480" height="630" fill="url(#grid)"/>
  <path d="M835 130h205v205H835z M887 182h101v101H887z" fill="none" stroke="#a7bcc6" stroke-opacity="0.24"/>
  <path d="M760 408h365M760 430h250M760 452h312" stroke="#a7bcc6" stroke-opacity="0.2"/>
  <circle cx="1025" cy="224" r="7" fill="#c5d7df"/>
  <path d="M1025 224 1114 155" stroke="#c5d7df" stroke-opacity="0.7"/>
  <text x="68" y="66" fill="#f1f0ef" font-family="Avenir Next, Avenir, sans-serif" font-size="24" font-weight="700" letter-spacing="5">MIAR</text>
  <text x="68" y="91" fill="#92979e" font-family="Avenir Next, Avenir, sans-serif" font-size="14" font-weight="500" letter-spacing="2">BY REACHDEFENCE</text>
  <line x1="68" y1="137" x2="1132" y2="137" stroke="#777c82" stroke-opacity="0.38"/>
  <text x="68" y="190" fill="#aeb4ba" font-family="JetBrains Mono, Menlo, monospace" font-size="15" font-weight="600" letter-spacing="2">${escapeXml(eyebrow)}</text>
  <text x="68" y="292" fill="#f1f0ef" font-family="Avenir Next, Avenir, sans-serif" font-size="67" font-weight="600" letter-spacing="-2.6">${escapeXml(lines[0])}</text>
  <text x="68" y="371" fill="#f1f0ef" font-family="Avenir Next, Avenir, sans-serif" font-size="67" font-weight="600" letter-spacing="-2.6">${escapeXml(lines[1])}</text>
  <line x1="68" y1="526" x2="1132" y2="526" stroke="#777c82" stroke-opacity="0.38"/>
  <text x="68" y="572" fill="#9da3a9" font-family="JetBrains Mono, Menlo, monospace" font-size="14" font-weight="600" letter-spacing="1.7">${escapeXml(footer)}</text>
  <text x="1132" y="572" text-anchor="end" fill="#d2d7db" font-family="JetBrains Mono, Menlo, monospace" font-size="14">MIAR.REACHDEFENCE.COM</text>
</svg>`;

await mkdir(outputDirectory, { recursive: true });

for (const card of cards) {
  await sharp(Buffer.from(cardSvg(card))).png({ compressionLevel: 9 }).toFile(path.join(outputDirectory, card.file));
}
