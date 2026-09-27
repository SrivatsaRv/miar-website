import { defineConfig } from "astro/config";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const siteJsVersion = createHash("sha256").update(readFileSync(new URL("./public/site.js", import.meta.url))).digest("hex").slice(0, 10);

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://miar.reachdefence.com",
  output: "static",
  trailingSlash: "always",
  adapter: cloudflare(),
  integrations: [sitemap()],
  vite: {
    define: { __SITE_JS_VERSION__: JSON.stringify(siteJsVersion) },
    // Worktrees share node_modules; give each checkout (and its test server) its own dep cache.
    cacheDir: `node_modules/.vite/${basename(dirname(fileURLToPath(import.meta.url)))}${process.argv.includes("4327") ? "-test" : ""}`,
  },
});
