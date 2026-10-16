import type { APIRoute } from 'astro';
import { docUrl, groupByArea, mdText, publishedDocs } from '../utils/llms';

/**
 * Machine-readable site index for language models (`/llms.txt`), following
 * the llmstxt.org convention: an H1 site title, a blockquote summary, then
 * one H2 per documentation area with H3 tool subsections and a bullet per
 * published article.
 *
 * Companion to `/llms-full.txt`, which carries the full article text. Both
 * are generated at build time from the same data layer, so they can never
 * drift from the content collection.
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('[llms.txt] astro.config.mjs must set `site` for absolute URLs.');
  }

  const groups = groupByArea(await publishedDocs());

  const lines: string[] = [
    '# Ops Handbook',
    '',
    '> A structured DevOps knowledge base: documentation, labs, diagrams, and command references.',
    '',
    'Each entry links to a published article. Planned or empty topics are omitted.',
    '',
  ];

  for (const group of groups) {
    lines.push(`## ${mdText(group.areaLabel)}`, '');

    const areaLevel = group.tools.get('');
    if (areaLevel?.length) {
      for (const doc of areaLevel) {
        lines.push(articleBullet(doc, site));
      }
      lines.push('');
    }

    for (const [tool, docs] of group.tools) {
      if (!tool) continue;
      lines.push(`### ${mdText(tool)}`, '');
      for (const doc of docs) {
        lines.push(articleBullet(doc, site));
      }
      lines.push('');
    }
  }

  return new Response(`${lines.join('\n').trimEnd()}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

function articleBullet(
  doc: Parameters<typeof docUrl>[0],
  site: URL,
): string {
  const title = mdText(doc.data.title);
  const description = doc.data.description
    ? `: ${mdText(doc.data.description)}`
    : '';
  return `- [${title}](${docUrl(doc, site)})${description}`;
}
