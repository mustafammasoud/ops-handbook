/**
 * Subfolder group registry for collapsible sidebar groups.
 *
 * A subfolder is any directory directly inside a tool folder
 * (`content/<area>/<tool>/<group>/`). Its readable label and order can
 * come from an optional `_meta.json` inside that folder, or are derived
 * from the folder name automatically.
 */
import { readdirSync } from 'node:fs';
import { slug as slugSegment } from 'github-slugger';

export interface SubfolderMeta {
  label?: string;
  order?: number;
}

const CONTENT_ROOT = 'content';

const META_FILES = import.meta.glob<SubfolderMeta>(
  '../../content/*/*/*/_meta.json',
  { eager: true, import: 'default' },
);

const metaByKey = new Map<string, SubfolderMeta>();
const folderByKey = new Map<string, string>();

const registryKey = (areaId: string, toolId: string, subId: string) =>
  `${areaId}\0${toolId}\0${subId}`;

discoverSubfolders();

function parseMetaPath(path: string): [string, string, string] | null {
  const marker = '/content/';
  const start = path.lastIndexOf(marker);
  if (start === -1) return null;
  const parts = path.slice(start + marker.length).split('/');
  if (parts.length !== 4 || parts[3] !== '_meta.json') return null;
  return [parts[0], parts[1], parts[2]];
}

function discoverSubfolders(): void {
  for (const area of listDirectories(CONTENT_ROOT)) {
    const areaPath = `${CONTENT_ROOT}/${area}`;
    for (const tool of listDirectories(areaPath)) {
      const toolPath = `${areaPath}/${tool}`;
      for (const sub of listDirectories(toolPath)) {
        const key = registryKey(area, slugSegment(tool), slugSegment(sub));
        folderByKey.set(key, sub);
      }
    }
  }
}

function listDirectories(path: string): string[] {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

for (const [path, meta] of Object.entries(META_FILES)) {
  const parsed = parseMetaPath(path);
  if (!parsed) continue;
  const [area, tool, sub] = parsed;
  const key = registryKey(area, slugSegment(tool), slugSegment(sub));
  metaByKey.set(key, normalizeMeta(meta));
  folderByKey.set(key, sub);
}

function normalizeMeta(meta: SubfolderMeta | undefined): SubfolderMeta {
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

export function subfolderMeta(
  areaId: string,
  toolId: string,
  subId: string,
): SubfolderMeta {
  return metaByKey.get(registryKey(areaId, toolId, subId)) ?? {};
}

export function subfolderFolder(
  areaId: string,
  toolId: string,
  subId: string,
): string {
  return folderByKey.get(registryKey(areaId, toolId, subId)) ?? subId;
}

function generatedSubfolderLabel(folder: string): string {
  if (/[\s&]/.test(folder)) return folder;
  const words = folder
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((token) => {
      const lower = token.toLowerCase();
      const ACRONYMS = new Set([
        'ci', 'cd', 'ip', 'dns', 'tcp', 'os', 'api', 'yaml',
        'http', 'https', 'ssh', 'json', 'sql',
      ]);
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return token.charAt(0).toUpperCase() + token.slice(1);
    });
  return words.join(' ') || folder;
}

export function subfolderLabel(
  areaId: string,
  toolId: string,
  subId: string,
): string {
  const meta = subfolderMeta(areaId, toolId, subId);
  return meta.label ?? generatedSubfolderLabel(subfolderFolder(areaId, toolId, subId));
}

interface SubfolderRank {
  order: number;
  label: string;
}

function rank(areaId: string, toolId: string, subId: string): SubfolderRank {
  const meta = subfolderMeta(areaId, toolId, subId);
  return {
    order: meta.order ?? Number.POSITIVE_INFINITY,
    label: meta.label ?? generatedSubfolderLabel(subfolderFolder(areaId, toolId, subId)),
  };
}

export function compareSubfolders(
  areaId: string,
  toolId: string,
  a: string,
  b: string,
): number {
  const rankA = rank(areaId, toolId, a);
  const rankB = rank(areaId, toolId, b);
  if (rankA.order !== rankB.order) {
    return rankA.order < rankB.order ? -1 : 1;
  }
  return rankA.label.localeCompare(rankB.label) || a.localeCompare(b);
}
