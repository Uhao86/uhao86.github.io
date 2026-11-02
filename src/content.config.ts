import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const base = {
  title: z.string().min(1),
  summary: z.string().min(1),
  lang: z.enum(["zh", "en"]),
  translationKey: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(true),
};

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    ...base,
    repo: z.url(),
    demo: z.url().optional(),
    status: z.enum(["active", "complete", "archived"]),
    stack: z.array(z.string()).default([]),
    role: z.string().optional(),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    ...base,
    kind: z.enum(["article", "note", "log"]),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/videos" }),
  schema: z.object({
    ...base,
    bilibiliUrl: z.url(),
    cover: z.string().optional(),
    duration: z.string().optional(),
  }),
});

const music = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/music" }),
  schema: z.object({
    ...base,
    artist: z.string().min(1),
    sourceUrl: z.url(),
    audio: z.string().regex(/^(https:\/\/|\/(?!\/))/, "Use an HTTPS URL or a local /media/ path").optional(),
  }),
});

export const collections = { projects, writing, videos, music };
