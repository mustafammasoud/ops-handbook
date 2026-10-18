import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { categoryLabel, levelLabel } from '../data/categories';
import { toolLabel } from '../utils/tools';
import { docCategory, docTool } from '../utils/docs';
import { docUrl, mdText, publishedDocs } from '../utils/llms';

type Doc = CollectionEntry<'docs'>;

/**
 * Full-text companion to `/llms.txt` (`/llms-full.txt`): every published
 * article's body, in canonical order, so a language model can consume the
 * handbook without issuing one HTTP request per page.
 *
 * MDX `import` / `export` lines and HTML comments are stripped — they are
 * build-time wiring, not content. Everything else is emitted verbatim.
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('[llms-full.txt] astro.config.mjs must set `site` for absolute URLs.');
  }

  const docs = await publishedDocs();

  const out: string[] = [
    '# Ops Handbook — Full Text',
    '',
    '> The complete published contents of a structured DevOps knowledge base:',
    '> documentation, labs, diagrams, and command references.',
    '',
    `${docs.length} articles in canonical documentation order, separated by a rule.`,
  ];

  let currentArea = '';
  for (const doc of docs) {
    const area = categoryLabel(docCategory(doc));
    if (area !== currentArea) {
      currentArea = area;
      out.push('', '---', '', `# ${mdText(currentArea)}`, '');
    }
    out.push(articleBlock(doc, site));
  }

  return new Response(`${out.join('\n').trimEnd()}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

function articleBlock(doc: Doc, site: URL): string {
  const tool = docTool(doc);
  const meta = [
    `Title: ${doc.data.title}`,
    `URL: ${docUrl(doc, site)}`,
    `Area: ${categoryLabel(docCategory(doc))}`,
    ...(tool ? [`Tool: ${toolLabel(tool, docCategory(doc))}`] : []),
    `Level: ${levelLabel(doc.data.level)}`,
    ...(doc.data.tags.length ? [`Tags: ${doc.data.tags.join(', ')}`] : []),
  ];

  const body = (doc.body ?? '')
    .replace(/^\s*(import|export)\s.*$/gm, '')
    .replace(/^\s*<!--[\s\S]*?-->\s*$/gm, '')
    .trim();

  return [`## ${mdText(doc.data.title)}`, '', ...meta, '', body, ''].join('\n');
}
