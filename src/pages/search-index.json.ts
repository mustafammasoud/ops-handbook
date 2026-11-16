import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { categoryLabel } from '../data/categories';
import { getTechnology } from '../data/technologies';
import { toolLabel } from '../utils/tools';
import { docCategory, docPath, docTool, sortedDocs } from '../utils/docs';
import { difficultyLabel, type DifficultyLevel } from '../utils/interview';

/**
 * Strips Markdown/MDX syntax down to searchable plain text.
 * Code content is kept so commands and identifiers remain searchable.
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
 * Derives a stable, readable anchor ID for a cheat sheet command row.
 */
function toRowId(cmd: string, index: number): string {
  const base = cmd
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || `cmd-${index + 1}`;
}

interface ParsedCheatRow {
  command: string;
  does: string;
  when: string;
  example: string;
}

function parseCheatRows(content: string): ParsedCheatRow[] {
  const rows: ParsedCheatRow[] = [];
  const rowRegex =
    /{\s*command:\s*([`'"])([\s\S]*?)\1\s*,\s*does:\s*([`'"])([\s\S]*?)\3(?:\s*,\s*when:\s*([`'"])([\s\S]*?)\5)?(?:\s*,\s*example:\s*([`'"])([\s\S]*?)\7)?/g;
  let match;
  while ((match = rowRegex.exec(content)) !== null) {
    rows.push({
      command: match[2].trim(),
      does: match[4].trim(),
      when: (match[6] || '').trim(),
      example: (match[8] || '').trim(),
    });
  }
  return rows;
}

interface ParsedQuestion {
  id: string;
  question: string;
  difficulty: DifficultyLevel;
  directAnswer: string;
  tags: string[];
  body: string;
}

function parseQuestions(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const regex = /<InterviewQuestion\b([\s\S]*?)\n>([\s\S]*?)<\/InterviewQuestion>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const attrs = match[1];
    const body = match[2];
    const idMatch = attrs.match(/id=["']([^"']+)["']/);
    const qMatch = attrs.match(/question=["']([^"']+)["']/);
    const diffMatch = attrs.match(/difficulty=["']([^"']+)["']/);
    const ansMatch = attrs.match(/directAnswer=["']([^"']+)["']/);
    const tagsMatch = attrs.match(/tags={\s*\[([\s\S]*?)\]\s*}/);
    const tags = tagsMatch
      ? tagsMatch[1]
          .split(',')
          .map((t) => t.replace(/["'\s]/g, ''))
          .filter(Boolean)
      : [];

    if (idMatch && qMatch) {
      questions.push({
        id: idMatch[1],
        question: qMatch[1],
        difficulty: (diffMatch ? diffMatch[1] : 'intermediate') as DifficultyLevel,
        directAnswer: ansMatch ? ansMatch[1] : '',
        tags,
        body,
      });
    }
  }
  return questions;
}

export interface SearchItem {
  /** Target deep link URL */
  u: string;
  /** Title / Question / Command */
  t: string;
  /** Description / Direct Answer */
  d: string;
  /** Category or technology context label */
  cl: string;
  /** Headings or tags */
  h: string[];
  /** Searchable body text */
  b: string;
  /** Source pillar identifier */
  type: 'docs' | 'cheat' | 'interview';
  /** Display badge label */
  badge: string;
}

/**
 * Unified search index covering Docs, Cheat Sheets, and Interview Questions.
 * Generated at build time and fetched lazily on dialog open.
 */
export const GET: APIRoute = async () => {
  const [docsEntries, cheatEntries, interviewEntries] = await Promise.all([
    getCollection('docs', ({ data }) => !data.draft),
    getCollection('cheatSheets', ({ data }) => !data.draft),
    getCollection('interviewQuestions', ({ data }) => !data.draft),
  ]);

  const items: SearchItem[] = [];

  // 1. Index Documentation Articles
  const sortedDocsList = sortedDocs(docsEntries);
  for (const entry of sortedDocsList) {
    const { headings } = await render(entry);
    const cat = docCategory(entry);
    const tool = docTool(entry);
    const cl = tool
      ? `${categoryLabel(cat)} · ${toolLabel(tool, cat)}`
      : categoryLabel(cat);

    items.push({
      u: docPath(entry.id),
      t: entry.data.title,
      d: entry.data.description,
      cl,
      h: headings
        .filter((heading) => heading.depth >= 2 && heading.depth <= 3)
        .map((heading) => heading.text),
      b: plainText(entry.body ?? '').slice(0, 1200),
      type: 'docs',
      badge: 'Docs',
    });
  }

  // 2. Index Cheat Sheets (Topics and Individual Commands)
  for (const entry of cheatEntries) {
    const tech = getTechnology(entry.data.technology);
    const techName = tech ? tech.name : entry.data.technology;
    const rows = parseCheatRows(entry.body ?? '');
    const { headings } = await render(entry);

    // Topic page entry
    const topicTitle = entry.data.title.toLowerCase().includes('cheat sheet')
      ? entry.data.title
      : `${entry.data.title} Cheat Sheet`;

    items.push({
      u: `/cheat-sheets/${entry.data.technology}/${entry.data.topic}`,
      t: topicTitle,
      d: entry.data.description,
      cl: `${techName} · Reference`,
      h: [
        entry.data.title,
        ...headings.map((h) => h.text),
        ...rows.map((r) => r.command),
      ],
      b: `${entry.data.description} ${rows.map((r) => `${r.command} ${r.does} ${r.when}`).join(' ')}`.slice(0, 1200),
      type: 'cheat',
      badge: 'Cheat Sheet',
    });

    // Individual Command entries with deep links
    rows.forEach((row, index) => {
      const rowId = toRowId(row.command, index);
      items.push({
        u: `/cheat-sheets/${entry.data.technology}/${entry.data.topic}#${rowId}`,
        t: row.command,
        d: row.does,
        cl: `${techName} · ${entry.data.title}`,
        h: [techName, entry.data.topic, row.when, row.example].filter(Boolean),
        b: `${row.command} ${row.does} ${row.when} ${row.example}`.slice(0, 600),
        type: 'cheat',
        badge: 'Command',
      });
    });
  }

  // 3. Index Interview Questions (Individual Questions with Anchors)
  for (const entry of interviewEntries) {
    const tech = getTechnology(entry.data.technology);
    const techName = tech ? tech.name : entry.data.technology;
    const questions = parseQuestions(entry.body ?? '');

    for (const q of questions) {
      items.push({
        u: `/interview-questions/${entry.data.technology}/${entry.data.topic}#${q.id}`,
        t: q.question,
        d: q.directAnswer,
        cl: `${techName} · ${difficultyLabel(q.difficulty)}`,
        h: [techName, ...q.tags],
        b: `${q.question} ${q.directAnswer} ${q.tags.join(' ')} ${plainText(q.body)}`.slice(0, 1200),
        type: 'interview',
        badge: 'Interview Q',
      });
    }
  }

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
