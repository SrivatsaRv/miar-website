# Site Search

MIAR generates a compact static JSON index after Astro builds the public site. Search runs entirely
in the browser and does not send queries to a hosted search service.

## Build contract

- `npm run build` renders Astro and then extracts searchable text into `dist/client/search-index.json`.
- `make ci-local` verifies that the generated JSON index exists before browser tests run.
- Only rendered public routes enter the index. Draft blog entries are excluded because Astro does not
  generate routes for them.
- The indexer reads only the shared layout's `data-pagefind-body` pages and extracts each page's main
  content, canonical URL, title, and description. Shared navigation and footer copy are outside `main`.

## Interface

The custom search dialog opens from the header, `/`, or `Command/Ctrl + K`. It returns up to eight
ranked results with a page-type label, title, and highlighted excerpt. The small index is warmed after
the page becomes idle, keeping it off the render path while avoiding first-use latency.

The generated index does not exist during `astro dev`, so local development displays an explicit
preview message after a query. Use `npm run build` followed by the Cloudflare preview command to test
live results against the production index.
