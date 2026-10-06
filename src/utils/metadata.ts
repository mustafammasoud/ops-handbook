import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

/**
 * Build-time article metadata for the shared documentation layer.
 *
 * Both helpers are pure and dependency-free: reading time is derived from
 * the article's actual Markdown/MDX body, and the last-updated date from
 * Git/build file metadata. No article ever configures either value — every
 * existing and future document gets them automatically through DocLayout.
 */

/** Standard reading speed used for every article (words per minute). */
const WORDS_PER_MINUTE = 200;

/**
 * Reduce a Markdown/MDX document to the prose a reader actually reads:
 * frontmatter, fenced/inline code, HTML/JSX tags, link targets, markup
 * punctuation and list/table/heading markers are blanked out.
 */
function proseText(markdown: string): string {
  return markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^[ \t]*(?:import|export)\s.+$/gm, ' ')
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    .replace(/!?\[([^\]\n]*)\]\([^)\n]*\)/g, '$1')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]{0,3}>[ \t]?/gm, '')
    .replace(/^[ \t]*(?:[-*+]|\d{1,3}\.)[ \t]+/gm, '')
    .replace(/^[ \t]*\|[^\n]*\|[ \t]*$/gm, (row) => row.replace(/\|/g, ' '))
    .replace(/^[ \t]{0,3}(?:[-*_][ \t]*){3,}$/gm, ' ')
    .replace(/[*_~]{1,3}/g, ' ');
}

/**
 * Estimated reading time in whole minutes (minimum 1), calculated from the
 * article's raw body at build time. Never read from frontmatter, so a new
 * Markdown/MDX file needs zero configuration to get a value.
 */
export function readingMinutes(body: string | undefined): number {
  const words = proseText(body ?? '')
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Per-file cache so each article shells out to Git at most once. */
const gitDateCache = new Map<string, Date | null>();

/**
 * Last Git commit date for a repo-relative file, or null when Git or the
 * history is unavailable (non-Git build, shallow checkout, untracked file).
 */
function gitCommitDate(filePath: string): Date | null {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', filePath.replace(/\\/g, '/')],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    if (!out) return null;
    const date = new Date(out);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Last-updated date for an article, derived centrally — never manually
 * per-article. Sources in order of preference:
 *
 *   1. Git history for the file (actual last modification).
 *   2. Optional frontmatter `date` (fallback when Git isn't available).
 *   3. File mtime (fresh checkout without history).
 *
 * Returns null only when no source yields a date, so the caller omits the
 * label instead of inventing one.
 */
export function lastModified(
  filePath: string | undefined,
  frontmatterDate: Date | undefined,
): Date | null {
  if (filePath) {
    const normalized = filePath.replace(/\\/g, '/');
    if (!gitDateCache.has(normalized)) {
      gitDateCache.set(normalized, gitCommitDate(normalized));
    }
    const fromGit = gitDateCache.get(normalized);
    if (fromGit) return fromGit;

    if (frontmatterDate) return frontmatterDate;

    try {
      return statSync(filePath).mtime;
    } catch {
      /* fall through to null */
    }
  }
  return frontmatterDate ?? null;
}
