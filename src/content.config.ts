import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const category = z.enum(["Analysis", "Tradecraft", "Case Notes", "Product Notes"]);

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string().min(20).max(80),
    description: z.string().min(80).max(180),
    summary: z.string().min(60).max(220),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    category,
    tags: z.array(z.string().min(2)).min(1),
    keywords: z.array(z.string().min(2)).min(1),
    author: z.object({
      name: z.string().min(2),
      organization: z.string().min(2),
    }),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    readingMinutes: z.number().int().positive(),
    featured: z.boolean().default(false),
    noindex: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
    heroImage: z.string().startsWith("/"),
    heroImageAlt: z.string().min(20).max(180),
    heroImageWidth: z.number().int().positive(),
    heroImageHeight: z.number().int().positive(),
    socialImage: z.string().startsWith("/").optional(),
    socialImageAlt: z.string().min(20).max(180).optional(),
    socialImageWidth: z.number().int().positive().optional(),
    socialImageHeight: z.number().int().positive().optional(),
    socialTitle: z.string().max(80).optional(),
    socialDescription: z.string().max(200).optional(),
    related: z.array(z.string()).default([]),
    gallery: z
      .array(
        z.object({
          src: z.string().startsWith("/"),
          alt: z.string().min(20).max(180),
          caption: z.string().min(2).max(100),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        })
      )
      .max(4)
      .default([]),
  }),
});

export const collections = { blog };
