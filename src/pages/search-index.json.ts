import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import {
  categoryLabel,
} from '../data/categories';
import { toolLabel } from '../utils/tools';
import { docCategory, docPath, docTool, sortedDocs } from '../utils/docs';

/**
 * Strips Markdown/MDX syntax down to searchable plain text.
 * Code content is intentionally kept — commands should be searchable.
 */
function plainText(raw: string): string {
  return raw
    .replace(/```[^\n]*\n([\s\S]*?)```/g, '$1')
    .replace(/```[^\n]*/g, ' ')
    .replace(/^import\s.*$/gm, ' ')
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, ' ')
    .replace(/^>\s?/gm, ' ')
    .replace(/[*_~`|]+/g, ' ')
    .replace(/[#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search index, generated at build time and fetched lazily by the client
 * only when the search dialog is first opened.
 *
 * Short keys keep the payload small. Fields:
 * u=url, t=title, d=description, cl=category/tool label, h=headings, b=body text
 */
export const GET: APIRoute = async () => {
  const docs = sortedDocs(await getCollection('docs', ({ data }) => !data.draft));

  const items = await Promise.all(
    docs.map(async (entry) => {
      const { headings } = await render(entry);
      const cat = docCategory(entry);
      const tool = docTool(entry);
      const cl = tool
        ? `${categoryLabel(cat)} · ${toolLabel(tool, cat)}`
        : categoryLabel(cat);

      return {
        u: docPath(entry.id),
        t: entry.data.title,
        d: entry.data.description,
        cl,
        h: headings
          .filter((heading) => heading.depth >= 2 && heading.depth <= 3)
          .map((heading) => heading.text),
        b: plainText(entry.body ?? ''),
      };
    }),
  );

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
