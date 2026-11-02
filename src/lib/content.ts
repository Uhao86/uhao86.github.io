import { getCollection, type CollectionEntry } from "astro:content";

export type Locale = "zh" | "en";
export type ContentKind = "projects" | "writing" | "videos" | "music";
export type SiteEntry = CollectionEntry<ContentKind>;

export const routeSegment: Record<ContentKind, string> = {
  projects: "code",
  writing: "writing",
  videos: "video",
  music: "music",
};

export async function getPublishedContent() {
  const [projects, writing, videos, music] = await Promise.all([
    getCollection("projects", ({ data }) => !data.draft),
    getCollection("writing", ({ data }) => !data.draft),
    getCollection("videos", ({ data }) => !data.draft),
    getCollection("music", ({ data }) => !data.draft),
  ]);

  const byDate = <T extends SiteEntry>(entries: T[]) =>
    [...entries].sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return {
    projects: byDate(projects),
    writing: byDate(writing),
    videos: byDate(videos),
    music: byDate(music),
  };
}

export function entryPath(collection: ContentKind, entry: SiteEntry) {
  return `/${entry.data.lang}/${routeSegment[collection]}/${entry.data.slug}/`;
}

export function groupTranslations<T extends SiteEntry>(entries: T[]) {
  const groups = new Map<string, T[]>();
  for (const entry of entries) {
    const current = groups.get(entry.data.translationKey) ?? [];
    current.push(entry);
    groups.set(entry.data.translationKey, current);
  }
  return [...groups.values()];
}

export function localizedPair<T extends SiteEntry>(group: T[]) {
  const first = group[0];
  const zh = group.find((entry) => entry.data.lang === "zh") ?? first;
  const en = group.find((entry) => entry.data.lang === "en") ?? first;
  return { zh, en };
}

export function dateLabel(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

// Keep collection and translation identity together across the shared index.
export const homeLimit = 6;
export const kindLabels: Record<ContentKind, Record<Locale, string>> = {
  projects: { zh: "实验与作品", en: "Experiment / project" },
  writing: { zh: "思考", en: "Reflection" },
  videos: { zh: "影像", en: "Video" },
  music: { zh: "音乐", en: "Music" },
};

export function contentIndex(content: Awaited<ReturnType<typeof getPublishedContent>>, featuredOnly = false) {
  return (Object.keys(content) as ContentKind[]).flatMap((kind) =>
    groupTranslations<SiteEntry>(content[kind])
      .filter((group) => !featuredOnly || group.some((entry) => entry.data.featured))
      .map((group) => ({ kind, pair: localizedPair(group), date: Math.max(...group.map((entry) => entry.data.publishedAt.getTime())) }))
  ).sort((a, b) => b.date - a.date);
}
