/** Icon names understood by `CategoryIcon.astro` (inline SVG, no icon library). */
export type CategoryIconName =
  | 'layers'
  | 'terminal'
  | 'network'
  | 'branch'
  | 'code'
  | 'cube'
  | 'cycle'
  | 'wheel'
  | 'cloud'
  | 'modules'
  | 'sliders'
  | 'pulse'
  | 'shield'
  | 'wrench'
  | 'database'
  | 'git-merge'
  | 'git-pull-request'
  | 'flag'
  | 'tag';

/**
 * Optional manual status override for an area. When omitted, the status is
 * derived from the article count at build time (count > 0 → "published",
 * count === 0 → "planned").
 */
export type CategoryStatus = 'published' | 'in-progress' | 'planned';

export interface Category {
  /**
   * Stable id used in document frontmatter (`category:`) and as the
   * `content/<id>/` folder name. Content never depends on anything else in
   * this file — unknown ids still work (they are ordered last and labelled
   * with their raw id until registered here).
   */
  id: string;
  /**
   * Display name. Always the English/technical name (Operating Systems,
   * Containers, CI/CD & Automation …) — technical area names are standard.
   */
  label: string;
  /** Short English description shown on the homepage and category pages. */
  descriptionEn: string;
  /** Icon key rendered by `CategoryIcon`. */
  icon: CategoryIconName;
  /** Visual ordering only. */
  order: number;
  /**
   * Optional status override for the homepage "Coverage & Roadmap" section.
   * Leave undefined to derive the status from the article count.
   */
  status?: CategoryStatus;
}

/**
 * 14 Canonical Documentation Areas matching the knowledge organization model.
 * Each area groups technologies, tools, and technical concepts.
 */
export const categories: Category[] = [
  {
    id: 'devops-fundamentals',
    label: 'DevOps Fundamentals',
    descriptionEn: 'Core principles, software delivery lifecycle, infrastructure, automation, and CI/CD concepts.',
    icon: 'layers',
    order: 1,
  },
  {
    id: 'operating-systems',
    label: 'Operating Systems',
    descriptionEn: 'Linux fundamentals, filesystem, permissions, processes, services, systemd, and bash.',
    icon: 'terminal',
    order: 2,
  },
  {
    id: 'networking',
    label: 'Networking',
    descriptionEn: 'OSI model, TCP/IP, DNS, HTTP/HTTPS, SSH, firewalls, and load balancing.',
    icon: 'network',
    order: 3,
  },
  {
    id: 'version-control',
    label: 'Version Control',
    descriptionEn: 'Git internals, branching workflows, and collaboration on GitHub, GitLab, and Bitbucket.',
    icon: 'branch',
    order: 4,
  },
  {
    id: 'programming-scripting',
    label: 'Programming & Scripting',
    descriptionEn: 'Scripting languages (Bash, Python, Go) and core concepts (APIs, JSON, YAML, regex).',
    icon: 'code',
    order: 5,
  },
  {
    id: 'containers',
    label: 'Containers',
    descriptionEn: 'Container images, Dockerfile, Compose, networking, volumes, registries, and runtimes.',
    icon: 'cube',
    order: 6,
  },
  {
    id: 'ci-cd-automation',
    label: 'CI/CD & Automation',
    descriptionEn: 'Pipelines, automated testing, builds, deployment strategies, GitHub Actions, and Jenkins.',
    icon: 'cycle',
    order: 7,
  },
  {
    id: 'container-orchestration',
    label: 'Container Orchestration',
    descriptionEn: 'Kubernetes architecture, pods, deployments, services, ingress, storage, and Helm.',
    icon: 'wheel',
    order: 8,
  },
  {
    id: 'cloud-platforms',
    label: 'Cloud Platforms',
    descriptionEn: 'Cloud compute, storage, networking, IAM, and architectures on AWS, Azure, and Google Cloud.',
    icon: 'cloud',
    order: 9,
  },
  {
    id: 'infrastructure-as-code',
    label: 'Infrastructure as Code',
    descriptionEn: 'Declarative infrastructure with Terraform and OpenTofu: providers, resources, state, and modules.',
    icon: 'modules',
    order: 10,
  },
  {
    id: 'configuration-management',
    label: 'Configuration Management',
    descriptionEn: 'Automated configuration, state enforcement, and server orchestration with Ansible and Puppet.',
    icon: 'sliders',
    order: 11,
  },
  {
    id: 'observability',
    label: 'Observability',
    descriptionEn: 'Production telemetry: metrics (Prometheus, Grafana), logging (Loki, ELK), and tracing.',
    icon: 'pulse',
    order: 12,
  },
  {
    id: 'security-devsecops',
    label: 'Security / DevSecOps',
    descriptionEn: 'Security fundamentals, IAM, secrets management, container security, and vulnerability scanning.',
    icon: 'shield',
    order: 13,
  },
  {
    id: 'troubleshooting-production',
    label: 'Troubleshooting & Production',
    descriptionEn: 'Production debugging, log analysis, performance issues, network diagnostics, and incident postmortems.',
    icon: 'wrench',
    order: 14,
  },
];

/** Aliases for legacy top-level category IDs to preserve backward compatibility. */
export const CATEGORY_ALIASES: Record<string, string> = {
  foundations: 'devops-fundamentals',
  linux: 'operating-systems',
  git: 'version-control',
  docker: 'containers',
  'ci-cd': 'ci-cd-automation',
  kubernetes: 'container-orchestration',
  cloud: 'cloud-platforms',
  terraform: 'infrastructure-as-code',
  security: 'security-devsecops',
  troubleshooting: 'troubleshooting-production',
};

/** Resolves any legacy or alias category ID to its canonical documentation area ID. */
export function canonicalCategoryId(id: string): string {
  return CATEGORY_ALIASES[id] ?? id;
}

const byId = new Map(categories.map((category) => [category.id, category]));

export function getCategory(id: string): Category | undefined {
  const canonical = canonicalCategoryId(id);
  return byId.get(canonical);
}

/**
 * Sort key for a category id: known categories keep their canonical order,
 * unknown ones (added later without registration) are placed last.
 */
export function categoryOrder(id: string): number {
  const canonical = canonicalCategoryId(id);
  const index = categories.findIndex((category) => category.id === canonical);
  return index === -1 ? categories.length : index;
}

/** Display label for a category id — always the English/technical name. */
export function categoryLabel(id: string): string {
  const canonical = canonicalCategoryId(id);
  const category = byId.get(canonical);
  return category ? category.label : id;
}

/** Known technology / tool display names. */
export const KNOWN_TOOLS: Record<string, string> = {
  docker: 'Docker',
  containerd: 'Containerd',
  podman: 'Podman',
  kubernetes: 'Kubernetes',
  helm: 'Helm',
  linux: 'Linux',
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
  bash: 'Bash',
  python: 'Python',
  go: 'Go',
  'github-actions': 'GitHub Actions',
  'gitlab-ci': 'GitLab CI/CD',
  jenkins: 'Jenkins',
  'azure-devops': 'Azure DevOps',
  aws: 'AWS',
  azure: 'Azure',
  'google-cloud': 'Google Cloud',
  terraform: 'Terraform',
  opentofu: 'OpenTofu',
  ansible: 'Ansible',
  puppet: 'Puppet',
  chef: 'Chef',
  saltstack: 'SaltStack',
  prometheus: 'Prometheus',
  grafana: 'Grafana',
  'elk-stack': 'ELK Stack',
  loki: 'Loki',
  opentelemetry: 'OpenTelemetry',
  jaeger: 'Jaeger',
  vault: 'Vault',
  trivy: 'Trivy',
  snyk: 'Snyk',
};

/** Formats a technology/tool ID into a human-readable display label. */
export function toolLabel(toolId: string): string {
  if (KNOWN_TOOLS[toolId]) return KNOWN_TOOLS[toolId];
  return toolId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Level label (English, locale default). */
export function levelLabel(level: string): string {
  return LEVEL_LABELS[level] ?? level;
}
