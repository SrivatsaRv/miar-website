# Website release checks

Run `make ci-local` before every commit and push. It builds the Astro/Cloudflare production
bundle and then runs the Playwright browser suite against an isolated local server.

The browser checks cover:

- header anchors across the homepage and internal routes
- footer ordering and short-page viewport placement
- mobile menu open, close, Escape, and breakpoint reset behavior
- horizontal overflow and broken imagery at mobile, tablet, and desktop widths
- desktop and mobile request-access form validation and submission states
- blog category filters, empty categories, grid/list persistence, and unique index thumbnails
- compact Sovereign Delivery workflow rendering and access CTA reachability

Playwright uses `http://127.0.0.1:4327` to avoid colliding with MIAR Workbench or the normal
website preview. Failure screenshots, traces, and video are written to ignored local artifact
directories.
