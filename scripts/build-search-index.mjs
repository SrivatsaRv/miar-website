import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const siteDirectory = path.resolve("dist/client");

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

const decode = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

const text = (html) =>
  decode(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

const entries = [];

for (const file of await walk(siteDirectory)) {
  if (!file.endsWith("index.html")) continue;
  const html = await readFile(file, "utf8");
  if (!html.includes("data-pagefind-body") || /<meta name="robots" content="noindex/i.test(html)) continue;

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? "";
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  if (!canonical || !title) continue;

  entries.push({
    url: new URL(canonical).pathname,
    title: decode(title).replace(/\s*\|\s*MIAR(?:\s.*)?$/i, "").trim(),
    description: decode(description),
    content: text(main).slice(0, 12_000),
  });
}

entries.sort((a, b) => a.url.localeCompare(b.url));
await writeFile(path.join(siteDirectory, "search-index.json"), JSON.stringify(entries));
console.log(`Search index generated: ${entries.length} public pages.`);
