import { categories, type CategoryIconName } from './categories';

/**
 * Valid Category IDs derived from the canonical categories registry.
 */
const VALID_CATEGORY_IDS = new Set(categories.map((c) => c.id));

/**
 * Canonical technology identifiers.
 * Defined as a const tuple to provide exact literal typing and zero-assertion Zod validation.
 */
export const TECHNOLOGY_IDS = [
  'kubernetes',
  'linux',
  'docker',
  'git',
  'github',
  'terraform',
] as const;

export type TechnologyId = (typeof TECHNOLOGY_IDS)[number];

export interface Technology {
  /** Stable canonical technology identifier matching TECHNOLOGY_IDS */
  id: TechnologyId;
  /** Human-readable display name */
  name: string;
  /** Canonical category ID from src/data/categories.ts */
  category: string;
  /** Concise description for cards, headers, and metadata */
  description: string;
  /** Icon name rendered by CategoryIcon component */
  icon: CategoryIconName;
  /** Display sorting order */
  order: number;
}

const rawTechnologies = [
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'container-orchestration',
    description: 'Automated container deployment, scaling, and operational management.',
    icon: 'wheel',
    order: 1,
  },
  {
    id: 'linux',
    name: 'Linux',
    category: 'operating-systems',
    description: 'Operating system kernel, systems administration, filesystem, processes, and core CLI utilities.',
    icon: 'terminal',
    order: 2,
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'containers',
    description: 'Container packaging, image building, runtime isolation, and multi-container orchestration.',
    icon: 'cube',
    order: 3,
  },
  {
    id: 'git',
    name: 'Git',
    category: 'version-control',
    description: 'Distributed version control, branching strategies, commit history, and conflict resolution.',
    icon: 'branch',
    order: 4,
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'version-control',
    description: 'Code collaboration, pull requests, code reviews, Actions CI/CD, and repository administration.',
    icon: 'branch',
    order: 5,
  },
  {
    id: 'terraform',
    name: 'Terraform',
    category: 'infrastructure-as-code',
    description: 'Declarative infrastructure as code, cloud provisioning, state management, and reusable modules.',
    icon: 'modules',
    order: 6,
  },
] as const satisfies readonly {
  id: TechnologyId;
  name: string;
  category: string;
  description: string;
  icon: CategoryIconName;
  order: number;
}[];

// Runtime / build-time integrity validation
const idSet = new Set<string>();
for (const tech of rawTechnologies) {
  if (idSet.has(tech.id)) {
    throw new Error(`[taxonomy] Duplicate technology ID detected: "${tech.id}"`);
  }
  idSet.add(tech.id);

  if (!VALID_CATEGORY_IDS.has(tech.category)) {
    throw new Error(
      `[taxonomy] Technology "${tech.id}" references unknown category "${tech.category}". Must be one of: ${[...VALID_CATEGORY_IDS].join(', ')}`,
    );
  }
}

/**
 * Registry of canonical technologies.
 */
export const technologies: readonly Technology[] = rawTechnologies;

const techById = new Map<string, Technology>(
  technologies.map((t) => [t.id, t]),
);

/**
 * Retrieves a technology by its ID.
 */
export function getTechnology(id: string): Technology | undefined {
  return techById.get(id);
}

/**
 * Type guard for technology IDs.
 */
export function isValidTechnologyId(id: string): id is TechnologyId {
  return techById.has(id);
}

/**
 * Returns all technologies belonging to a specific category.
 */
export function getTechnologiesByCategory(categoryId: string): Technology[] {
  return technologies.filter((t) => t.category === categoryId);
}
