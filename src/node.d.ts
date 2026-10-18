/**
 * Minimal ambient typings for the Node.js built-ins used by
 * `src/utils/metadata.ts` and `src/utils/tools.ts`. The project intentionally
 * has no `@types/node` dependency, so only the exact APIs in use are declared here.
 */
declare module 'node:child_process' {
  export function execFileSync(
    file: string,
    args?: readonly string[],
    options?: {
      encoding?: string;
      stdio?: Array<'ignore' | 'pipe'>;
    },
  ): string;
}

declare module 'node:fs' {
  /** A directory entry returned by `readdirSync(path, { withFileTypes: true })`. */
  export interface Dirent {
    name: string;
    isDirectory(): boolean;
  }

  export function statSync(path: string | URL): { mtime: Date };

  export function readdirSync(
    path: string | URL,
    options: { withFileTypes: true },
  ): Dirent[];
}
