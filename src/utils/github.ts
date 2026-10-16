/**
 * GitHub links for article pages.
 *
 * The header, the `origin` remote, and `package.json`'s `repository`
 * field all use `ops-handbook`. Edit and issue links use that name
 * directly.
 */
export const GITHUB_REPO_URL = 'https://github.com/mustafammasoud/ops-handbook';

const GITHUB_BRANCH = 'main';

/**
 * "Edit this file" URL for a content-collection source path.
 * `filePath` comes from the glob loader (repo-relative, e.g.
 * `content/devops-fundamentals/what-is-devops.md`). Returns null when the
 * path isn't a real content file, so callers omit the link instead of
 * pointing at the wrong place.
 */
export function githubEditUrl(filePath: string | undefined): string | null {
  if (!filePath) return null;

  const normalized = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  const contentAt = normalized.lastIndexOf('content/');
  if (contentAt < 0) return null;

  const relative = normalized.slice(contentAt);
  if (!relative.startsWith('content/') || relative.endsWith('/')) return null;

  const encoded = relative
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${GITHUB_REPO_URL}/edit/${GITHUB_BRANCH}/${encoded}`;
}

/**
 * Prefilled "new issue" URL. No GitHub API or authentication — the browser
 * just opens GitHub's issue form with the article title and canonical URL.
 */
export function githubFeedbackIssueUrl(title: string, canonicalUrl: string): string {
  const params = new URLSearchParams({
    title: `Feedback: ${title}`,
    body: [
      `**Page:** ${title}`,
      `**URL:** ${canonicalUrl}`,
      '',
      '---',
      '',
      'Please describe what could be improved:',
      '',
    ].join('\n'),
  });

  return `${GITHUB_REPO_URL}/issues/new?${params.toString()}`;
}
