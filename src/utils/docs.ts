import type { CollectionEntry } from 'astro:content';
import { categoryOrder, canonicalCategoryId } from '../data/categories';

type Doc = CollectionEntry<'docs'>;

/**
 * Documentation area for a doc entry.
 * Priority:
 * 1. Explicit `category` in frontmatter (legacy aliases resolved).
 * 2. First segment of the path: `content/<area>/...`
 *
 * Authors normally never need `category:` — it is derived from the folder.
 */
export function docCategory(doc: Doc): string {
  return canonicalCategoryId(doc.data.category ?? doc.id.split('/')[0]);
}

/**
 * Extracts the technology / tool from a doc entry.
 * Priority:
 * 1. Explicit `tool` in frontmatter.
 * 2. Second segment in nested path: `content/<category>/<tool>/...`
 */
export function docTool(entry: Doc): string | undefined {
  if (entry.data.tool) return entry.data.tool;
  const parts = entry.id.split('/');
  if (parts.length >= 3) {
    return parts[1];
  }
  return undefined;
}

/**
 * Canonical documentation order:
 * 1. Category (documentation area) canonical order
 * 2. Technology / tool
 * 3. Frontmatter `order`
 * 4. Title
 *
 * Used by the sidebar, prev/next navigation, and search index.
 */
export function compareDocs(a: Doc, b: Doc): number {
  const catA = docCategory(a);
  const catB = docCategory(b);
  const toolA = docTool(a) ?? '';
  const toolB = docTool(b) ?? '';

  return (
    categoryOrder(catA) - categoryOrder(catB) ||
    catA.localeCompare(catB) ||
    toolA.localeCompare(toolB) ||
    a.data.order - b.data.order ||
    a.data.title.localeCompare(b.data.title)
  );
}

/** All non-draft docs in canonical order. */
export function sortedDocs(docs: Doc[]): Doc[] {
  return [...docs].sort(compareDocs);
}

/**
 * URL path for a docs collection entry.
 *
 * An entry stored at `content/<category>/<topic>/index.md` has the id
 * `<category>/<topic>/index` and is served from `/docs/<category>/<topic>/`.
 */
export function docPath(id: string): string {
  return `/docs/${docSlug(id)}`;
}

/** Collection entry id -> URL slug (drops the trailing `index`). */
export function docSlug(id: string): string {
  return id.replace(/\/index$/, '');
}

/**
 * Article-count copy for a number of documents.
 */
export function articleCount(count: number): string {
  return count === 1 ? '1 article' : `${count} articles`;
}

/** Backward-compatible alias for articleCount. */
export const topicCount = articleCount;

/**
 * Generic placeholder copy ("Content coming soon." and close variants) —
 * it signals a planned topic, not published content.
 */
export function isPlaceholderText(text: string | null | undefined): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return normalized === 'contentcomingsoon' || normalized === 'comingsoon';
}

/**
 * Whether a topic entry carries actual published content. Drafts are
 * excluded by callers upstream; a non-draft file still counts as planned
 * when its body is empty or only the generic placeholder copy. The shared
 * documentation layer uses this to render the Planned / Coming Soon state
 * automatically — no per-article flags, text, or configuration.
 */
export function hasPublishedContent(entry: Doc): boolean {
  const body = entry.body?.trim();
  return Boolean(body) && !isPlaceholderText(body);
}

/**
 * Comparator for sorting articles by recency.
 * Priority:
 * 1. Explicit frontmatter `date` (descending: newest first).
 * 2. Reverse canonical order so newly added documentation areas, tools,
 *    and articles appear first.
 */
export function compareLatestDocs(a: Doc, b: Doc): number {
  const dateA = a.data.date ? new Date(a.data.date).getTime() : undefined;
  const dateB = b.data.date ? new Date(b.data.date).getTime() : undefined;

  if (dateA !== undefined && dateB !== undefined) {
    if (dateA !== dateB) return dateB - dateA;
  } else if (dateA !== undefined) {
    return -1;
  } else if (dateB !== undefined) {
    return 1;
  }

  return compareDocs(b, a);
}

/**
 * Returns the latest published articles from the docs collection.
 */
export function latestDocs(docs: Doc[], limit = 4): Doc[] {
  return [...docs].sort(compareLatestDocs).slice(0, limit);
}

