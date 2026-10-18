/**
 * Data-driven tool registry — the single source of truth for documentation
 * tools (the folders directly inside an area, e.g. `content/containers/docker/`).
 *
 * A tool folder is discovered automatically from the content hierarchy: its id
 * is the folder name, so a new folder works the moment its first article lands
 * and nothing has to be registered anywhere. This module only answers two
 * questions about that id:
 *
 *   1. What is it called?  (`_meta.json` → `label`, else a generated label)
 *   2. Where does it sit?  (`_meta.json` → `order`, else alphabetically last)
 *
 * Both answers are pure functions of `(area, tool)`, so no second registry —
 * and no hand-written list of tools — exists anywhere in the codebase.
 *
 * ## Identifiers
 *
 * The content collection does not expose folder names as ids: the loader
 * slugifies every path segment with `github-slugger`, the same package and the
 * same stateless `slug()` call Astro uses, so `IP Addressing & Subnetting`
 * becomes `ip-addressing--subnetting` everywhere in the app (URLs, `docTool()`).
 * Lookups are therefore keyed by that slug, derived — never hand-written — from
 * the folder name. Nothing here changes an id, a slug, or a URL.
 *
 * The *display* name is never derived from the slug: a slug drops case, spaces
 * and punctuation, so the folder name is recovered from the folder listing (or
 * from the `_meta.json` path) and only then turned into a label.
 *
 * ## Per-tool metadata
 *
 * Optional, in `_meta.json` inside the tool folder:
 *
 *     { "label": "IP Addressing & Subnetting", "order": 20 }
 *
 * Every field is optional and a missing file is a normal state, not an error.
 * The file must be valid JSON — a syntax error fails the build on purpose so
 * the mistake is caught where it was made.
 */

import { readdirSync } from 'node:fs';
import { slug as slugSegment } from 'github-slugger';

/** Optional per-tool metadata read from `<content>/<area>/<tool>/_meta.json`. */
export interface ToolMeta {
  /** Display name. Overrides the label generated from the folder name. */
  label?: string;
  /**
   * Visual ordering inside the area. Tools with an `order` come first,
   * ascending; tools without one follow, alphabetically by label. Use spaced
   * values (10, 20, 30 …) so new tool can be inserted between existing ones.
   */
  order?: number;
}

/** Repository content root, relative to the project root (build cwd). */
const CONTENT_ROOT = 'content';

/**
 * Every `_meta.json` in the repository. Astro's content glob loader only ever
 * matches `*.md` / `*.mdx`, so this file can never leak into the docs
 * collection or affect routing — it is plain build-time data.
 */
const META_FILES = import.meta.glob<ToolMeta>(
  '../../content/*/*/_meta.json',
  { eager: true, import: 'default' },
);

/** `<area>\0<slug>` → metadata. Built once at module load. */
const metaBySlug = new Map<string, ToolMeta>();

/** `<area>\0<slug>` → raw folder name, for display purposes. */
const folderBySlug = new Map<string, string>();

const registryKey = (areaId: string, toolId: string) => `${areaId}\0${toolId}`;

/**
 * Every area and its tool folders: `area id → (slug → folder name)`.
 * A folder is a tool simply by existing; `_`-prefixed folders are reserved.
 */
discoverToolFolders();

/** Splits `<anything>/content/<area>/<folder>/_meta.json` into `[area, folder]`. */
function parseMetaPath(path: string): [string, string] | null {
  const marker = '/content/';
  const start = path.lastIndexOf(marker);
  if (start === -1) return null;
  const parts = path.slice(start + marker.length).split('/');
  if (parts.length !== 3 || parts[2] !== '_meta.json') return null;
  return [parts[0], parts[1]];
}

/** Records every tool folder as `area\0slug → folder name`. */
function discoverToolFolders(): void {
  for (const area of listDirectories(CONTENT_ROOT)) {
    for (const folder of listDirectories(`${CONTENT_ROOT}/${area}`)) {
      folderBySlug.set(registryKey(area, slugSegment(folder)), folder);
    }
  }
}

function listDirectories(path: string): string[] {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
      .map((entry) => entry.name);
  } catch {
    // Not readable (unexpected cwd, missing folder): discovery is empty rather
    // than fatal — every tool then falls back to slug-derived values.
    return [];
  }
}

for (const [path, meta] of Object.entries(META_FILES)) {
  const parsed = parseMetaPath(path);
  if (!parsed) continue;
  const [area, folder] = parsed;
  const slug = slugSegment(folder);
  metaBySlug.set(registryKey(area, slug), normalizeMeta(meta));
  // The glob path is an independent source of the raw folder name.
  folderBySlug.set(registryKey(area, slug), folder);
}

/** Drops anything that is not a usable field so a stray value cannot break the sort. */
function normalizeMeta(meta: ToolMeta | undefined): ToolMeta {
  if (!meta || typeof meta !== 'object') return {};
  const label =
    typeof meta.label === 'string' && meta.label.trim()
      ? meta.label.trim()
      : undefined;
  const order =
    typeof meta.order === 'number' && Number.isFinite(meta.order)
      ? meta.order
      : undefined;
  return { label, order };
}

/** Metadata for one tool — `{}` when the folder has no (or no usable) `_meta.json`. */
export function toolMeta(areaId: string | undefined, toolId: string): ToolMeta {
  if (areaId) return metaBySlug.get(registryKey(areaId, toolId)) ?? {};
  for (const [key, meta] of metaBySlug) {
    if (key.endsWith(`\0${toolId}`)) return meta;
  }
  return {};
}

/**
 * Raw folder name behind a tool id, so display text never has to be rebuilt
 * from a slug. Falls back to the id itself when the folder cannot be found
 * (unknown area, unreadable content root).
 */
export function toolFolder(areaId: string | undefined, toolId: string): string {
  if (areaId) return folderBySlug.get(registryKey(areaId, toolId)) ?? toolId;
  for (const [key, folder] of folderBySlug) {
    if (key.endsWith(`\0${toolId}`)) return folder;
  }
  return toolId;
}

/** Acronyms kept uppercase in generated labels. */
const ACRONYMS = new Set([
  'ci',
  'cd',
  'ip',
  'dns',
  'tcp',
  'os',
  'api',
  'yaml',
  'http',
  'https',
  'ssh',
  'json',
  'sql',
]);

/**
 * Label generated from a folder name when `_meta.json` gives none.
 *
 * A name that already contains spaces or an `&` ("Git and GitHub",
 * "IP Addressing & Subnetting") is already human-readable and is returned
 * as-is. Only a kebab/snake-case name ("ip-addressing") is converted to
 * Title Case, with known acronyms uppercase.
 */
export function generatedToolLabel(folder: string): string {
  if (/[\s&]/.test(folder)) return folder;

  const words = folder
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((token) => {
      const lower = token.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return token.charAt(0).toUpperCase() + token.slice(1);
    });

  return words.join(' ') || folder;
}

/**
 * Display name for a tool id: the `_meta.json` label when present, otherwise
 * the label generated from the raw folder name.
 *
 * The area is optional; without it the first tool with that id in any area is
 * used, which only matters for callers that genuinely lack the area.
 */
export function toolLabel(toolId: string, areaId?: string): string {
  const meta = toolMeta(areaId, toolId);
  return meta.label ?? generatedToolLabel(toolFolder(areaId, toolId));
}

interface ToolRank {
  order: number;
  label: string;
}

function rank(areaId: string, toolId: string): ToolRank {
  const meta = toolMeta(areaId, toolId);
  return {
    // Never ordered → `Infinity`; compare with `<`, never subtract (NaN).
    order: meta.order ?? Number.POSITIVE_INFINITY,
    label: meta.label ?? generatedToolLabel(toolFolder(areaId, toolId)),
  };
}

/**
 * Orders two tool ids inside one area.
 *
 * An empty id means the article sits directly in the area (no tool folder) and
 * therefore sorts before every tool, matching the historical behaviour. Among
 * tools: explicit `order` ascending first, then unordered tools alphabetically
 * by label, with the id as a final tie-break so the order is always stable.
 *
 * Missing metadata is never an error — it means "no preference", which the
 * sort turns into alphabetical placement.
 */
export function compareTools(
  areaId: string,
  a: string | undefined,
  b: string | undefined,
): number {
  const idA = a ?? '';
  const idB = b ?? '';

  if (!idA && !idB) return 0;
  if (!idA) return -1;
  if (!idB) return 1;

  const rankA = rank(areaId, idA);
  const rankB = rank(areaId, idB);

  if (rankA.order !== rankB.order) return rankA.order < rankB.order ? -1 : 1;

  return (
    rankA.label.localeCompare(rankB.label) ||
    idA.localeCompare(idB)
  );
}
