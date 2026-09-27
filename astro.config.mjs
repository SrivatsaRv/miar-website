import { defineConfig } from "astro/config";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://miar.reachdefence.com",
  output: "static",
  trailingSlash: "always",
  adapter: cloudflare(),
  integrations: [sitemap()],
  vite: {
    // Worktrees share node_modules; give each checkout (and its test server) its own dep cache.
    cacheDir: `node_modules/.vite/${basename(dirname(fileURLToPath(import.meta.url)))}${process.argv.includes("4327") ? "-test" : ""}`,
  },
});
