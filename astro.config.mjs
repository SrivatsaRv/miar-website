import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://miar.reachdefence.com",
  output: "static",
  trailingSlash: "always",
  adapter: cloudflare(),
  integrations: [sitemap()],
});
