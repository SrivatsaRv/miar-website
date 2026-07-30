# MIAR blog publishing

MIAR articles are stored as Markdown in `src/content/blog/`. Astro validates every article
against `src/content.config.ts` during local development and production builds.

## Publish an article

1. Create `src/content/blog/<permanent-slug>.md`.
2. Copy the frontmatter template below and complete every required field.
3. Write the article body in Markdown.
4. Set `status: "draft"` while editing.
5. Run `make ci-local`.
6. Set `status: "published"` when the article is approved.
7. Run `make ci-local` again and review the generated route.

The Markdown file is the article source. Astro applies the publication layout, typography,
metadata, imagery, related links, and sharing controls during rendering. Do not add another page
title inside the Markdown body: frontmatter `title` becomes the single `h1`. Begin body sections
with `##`; use `###` and `####` only for nested sections.

The filename becomes the permanent URL:

```text
src/content/blog/my-article.md
https://miar.reachdefence.com/blogs/posts/my-article/
```

Do not rename a published Markdown file without adding a permanent redirect from the old URL.

## Frontmatter template

```yaml
---
title: "Clear article title"
description: "Search-result description explaining the article in approximately 120 to 160 characters."
summary: "Short index-page summary written for a human reader."
status: "draft" # draft | published | archived
category: "Analysis" # Analysis | Tradecraft | Case Notes | Product Notes
tags:
  - "imagery intelligence"
  - "GEOINT"
keywords:
  - "primary search phrase"
  - "supporting search phrase"
author:
  name: "ReachDefence"
  organization: "ReachDefence"
publishedAt: 2026-07-30
updatedAt: 2026-07-30 # optional
readingMinutes: 6
featured: false
noindex: false
canonicalUrl: "https://example.com/original-article/" # optional; omit for MIAR originals
heroImage: "/imagery/example.png"
heroImageAlt: "Literal description of the important content in the image"
heroImageWidth: 1600
heroImageHeight: 900
socialImage: "/imagery/example-social.png" # optional; defaults to heroImage
socialImageAlt: "Literal description of the social image" # optional
socialTitle: "Short social title" # optional
socialDescription: "Short social description" # optional
related:
  - "another-article-slug"
gallery:
  - src: "/imagery/example-before.png"
    alt: "Description of the earlier satellite scene"
    caption: "Baseline / 2025"
    width: 1600
    height: 900
---
```

## Field contract

| Field | Purpose |
| --- | --- |
| `title` | On-page H1, browser title, and default social headline. |
| `description` | HTML meta description, default social description, and structured-data description. |
| `summary` | Human-facing introduction on the journal index and article hero. |
| `status` | Controls publication. Only `published` entries receive public routes or index listings. |
| `category` | Primary editorial section. Use one category only. |
| `tags` | Reader-facing and article metadata topics. |
| `keywords` | Search concepts emitted in `BlogPosting` structured data. Do not keyword-stuff. |
| `author` | Article byline and structured-data author/publisher. |
| `publishedAt` | Original publication date. Do not change this when editing. |
| `updatedAt` | Date of a material revision. Omit for untouched articles. |
| `readingMinutes` | Editorially reviewed reading-time estimate. |
| `featured` | Reserved for index promotion rules. |
| `noindex` | Emits `noindex, nofollow` when a published page must stay out of search. |
| `canonicalUrl` | Use only when another URL is the authoritative original. |
| `heroImage` | Index and default social image from `public/`. |
| `heroImageAlt` | Accessible, literal description. Never use keyword lists. |
| `socialImage` | Optional Open Graph/Twitter override. |
| `related` | Markdown filenames without `.md`; drives related-article navigation. |
| `gallery` | Optional article imagery rendered before the Markdown body. |

## SEO emitted automatically

The shared article template emits:

- canonical URL
- HTML title and meta description
- `robots` directives when `noindex` is enabled
- Open Graph article type, title, description, image, and image alt
- Twitter summary-large-image metadata
- article publication time, modification time, author, section, and tags
- `BlogPosting` JSON-LD
- gallery `ImageObject` entries with visible captions and descriptions
- XML sitemap entries through `@astrojs/sitemap`
- `robots.txt` with the sitemap location
- semantic `<article>`, `<header>`, `<time>`, headings, figures, and captions

## Listing and sharing

The blog index supports list and grid views. The visitor's selection is stored locally and does
not change article URLs, crawlability, or the Markdown source.

Every article exposes LinkedIn, X, email, and copy-link actions. Shared URLs retain the canonical
article path and append:

- `utm_source`: `linkedin`, `x`, `email`, or `copy_link`
- `utm_medium`: `social`, `email`, or `referral`
- `utm_campaign`: `blog_share`
- `utm_content`: the article slug

Keep these values stable so attribution remains comparable. A future analytics platform or
consent manager can use the same parameters without changing the content files.

SEO fields do not compensate for weak content. Each article still needs a clear question, original
analysis, accurate claims, descriptive headings, useful internal links, and properly licensed
imagery.

## Editorial categories

- `Analysis`: evaluation frameworks, market structure, and technical claims.
- `Tradecraft`: practical imagery-analysis methods and review discipline.
- `Case Notes`: a specific scene, AOI, event, or comparison with stated evidence limits.
- `Product Notes`: capabilities that have actually shipped in MIAR.

Do not publish roadmap claims as Product Notes. Planned work should be identified explicitly as
planned or omitted.

## Image rules

- Store public images under `public/imagery/`.
- Record the true pixel width and height.
- Supply alt text that describes the visible scene or graphic.
- Include source, licence, collection date, and sensor attribution in the article when required.
- Do not publish classified, restricted, or improperly licensed imagery.
- Prepare a dedicated social image when the hero crop does not work at approximately 1.91:1.

## Agency or CMS handoff

The page layer reads articles only through Astro's `blog` content collection. A future CMS
integration should replace the `glob()` loader in `src/content.config.ts` with a CMS loader that
returns the same field contract. The index and article template should not need to change.

Before migration:

1. Map CMS fields one-to-one to this schema.
2. Preserve every published entry ID as its URL slug.
3. Import original publication and modification dates.
4. Preserve canonical URLs and redirect any changed paths.
5. Export and verify all image alt text and social images.
6. Compare sitemap, canonical, Open Graph, and JSON-LD output before launch.
