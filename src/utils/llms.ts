import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { categoryLabel } from '../data/categories';
import { toolLabel } from './tools';
import {
  docCategory,
  docPath,
  docTool,
  hasPublishedContent,
  sortedDocs,
} from './docs';

type Doc = CollectionEntry<'docs'>;

/**
 * Shared data layer for the llmstxt.org endpoints (`/llms.txt` and
 * `/llms-full.txt`).
 *
 * Both files describe the same set of pages, so the selection rules live
 * here once: drafts are dropped by the caller, and articles whose body is
 * empty or only the generic "Content coming soon" placeholder are excluded
 * so language models are never pointed at a planned, empty topic.
 */

/** All published, non-placeholder articles in canonical documentation order. */
export async function publishedDocs(): Promise<Doc[]> {
  const docs = await getCollection('docs', ({ data }) => !data.draft);
  return sortedDocs(docs.filter(hasPublishedContent));
}

export interface DocGroup {
  areaId: string;
  areaLabel: string;
  /** tool display label -> articles. The empty key holds area-level articles. */
  tools: Map<string, Doc[]>;
}

/**
 * Groups articles by documentation area, then by technology/tool, preserving
 * the canonical order produced by `sortedDocs` (insertion order of the maps).
 */
export function groupByArea(docs: Doc[]): DocGroup[] {
  const areas = new Map<string, DocGroup>();

  for (const doc of docs) {
    const areaId = docCategory(doc);
    let group = areas.get(areaId);
    if (!group) {
      group = { areaId, areaLabel: categoryLabel(areaId), tools: new Map() };
      areas.set(areaId, group);
    }

    const tool = docTool(doc);
    const key = tool ? toolLabel(tool, areaId) : '';
    const bucket = group.tools.get(key);
    if (bucket) bucket.push(doc);
    else group.tools.set(key, [doc]);
  }

  return [...areas.values()];
}

/** Absolute canonical URL for an article. */
export function docUrl(doc: Doc, site: URL): string {
  return new URL(docPath(doc.id), site).href;
}

/** Escapes text for use inside a Markdown link label or description. */
export function mdText(value: string): string {
  return value.replace(/([\\[\]])/g, '\\$1').trim();
}
