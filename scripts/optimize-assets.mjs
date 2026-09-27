import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.resolve("assets/source-imagery");
const outputDirectory = path.resolve("public/imagery");
const sources = [
  "annotated-airfield-scene",
  "operational-airfield-scene",
  "monitored-site-reference-2025",
  "monitored-site-follow-on-2026",
];

await mkdir(outputDirectory, { recursive: true });

for (const name of sources) {
  const source = path.join(sourceDirectory, `${name}.png`);
  const image = sharp(source).rotate();

  await Promise.all([
    image.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(outputDirectory, `${name}.avif`)),
    image.clone().webp({ quality: 76, effort: 6 }).toFile(path.join(outputDirectory, `${name}.webp`)),
  ]);
}

// Link-preview cards are generated separately (npm run generate:social) and committed.
