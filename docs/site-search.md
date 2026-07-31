# Site Search

MIAR uses Pagefind to generate a static search index after Astro builds the public site. Search runs
entirely in the browser and does not send queries to a hosted search service.

## Build contract

- `npm run build` runs Astro and then indexes `dist/client` with Pagefind.
- `make ci-local` verifies that `dist/client/pagefind/pagefind.js` exists before browser tests run.
- Only rendered public routes enter the index. Draft blog entries are excluded because Astro does not
  generate routes for them.
- The shared header, footer, and search interface use `data-pagefind-ignore` so repeated shell copy does
  not pollute results.
- Page content is indexed through `data-pagefind-body` on the shared layout.

## Interface

The custom search dialog opens from the header, `/`, or `Command/Ctrl + K`. It returns up to eight
results with a page-type label, title, and highlighted excerpt. The dialog supports native focus
containment and Escape-to-close behaviour.

Pagefind assets do not exist during `astro dev`, so local development displays an explicit preview
message after a query. Use `npm run build` followed by the Cloudflare preview command to test live
results against a generated index.
