import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const limits = {
  raster: 500_000,
  css: 100_000,
  javascript: 25_000,
};
const failures = [];

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const location = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(location) : [location];
      })
    )
  ).flat();
};

for (const file of await walk(path.resolve("public"))) {
  if (!/\.(?:avif|jpe?g|png|webp)$/i.test(file)) continue;
  const { size } = await stat(file);
  if (size > limits.raster) failures.push(`${path.relative(process.cwd(), file)} is ${(size / 1024).toFixed(0)} KiB; limit is ${limits.raster / 1000} KiB`);
}

for (const file of await walk(path.resolve("dist/client"))) {
  const { size } = await stat(file);
  const relative = path.relative(process.cwd(), file);
  if (file.endsWith(".css") && size > limits.css) {
    failures.push(`${relative} exceeds the ${limits.css / 1000} KB CSS budget`);
  }
  if (file.endsWith("/site.js") && size > limits.javascript) {
    failures.push(`${relative} exceeds the ${limits.javascript / 1000} KB first-party JS budget`);
  }
}

if (failures.length) {
  console.error(`Performance budget failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Performance budget passed.");
