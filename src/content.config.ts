import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TECHNOLOGY_IDS } from './data/technologies';

/**
 * Technical documentation collection.
 *
 * Scans `./content` while explicitly excluding the dedicated collections
 * for cheat sheets (`content/cheat-sheets`) and interview questions (`content/interview-questions`).
 */
const docs = defineCollection({
  loader: glob({
    pattern: [
      '**/*.md',
      '**/*.mdx',
      '!README.md',
      '!**/README.md',
      '!_template/**',
      '!interview-questions/**',
      '!cheat-sheets/**',
    ],
    base: './content',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    /**
     * Documentation area — normally OMITTED: derived from the first folder
     * segment (`content/<area>/...`). Explicit only to override/alias.
     */
    category: z.string().optional(),
    /** Tool — normally OMITTED: derived from the second folder segment. */
    tool: z.string().optional(),
    order: z.number().default(0),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Optional publication / update date for articles. */
    date: z.coerce.date().optional(),
    /**
     * Content language for the article region. English (LTR) is the default;
     * set `language: ar` to render that article's content region as RTL.
     */
    language: z.enum(['en', 'ar']).default('en'),
  }),
});

/**
 * Fast command reference and cheat sheets collection.
 *
 * Each entry represents a technology topic (e.g. `kubernetes/pods`, `git/branching`).
 * The schema validates that `technology` strictly references a canonical ID
 * from `src/data/technologies.ts`.
 */
const cheatSheets = defineCollection({
  loader: glob({
    pattern: ['*/**/*.{md,mdx}'],
    base: './content/cheat-sheets',
  }),
  schema: z.object({
    title: z.string(),
    technology: z.enum(TECHNOLOGY_IDS),
    topic: z.string(),
    description: z.string().default(''),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    language: z.enum(['en', 'ar']).default('en'),
  }),
});

/**
 * Technical interview questions collection.
 *
 * Organizes scenario questions and conceptual assessments by technology and topic.
 * Rich technical answers, diagrams, and code snippets are authored in MDX bodies.
 */
const interviewQuestions = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}'],
    base: './content/interview-questions',
  }),
  schema: z.object({
    title: z.string(),
    technology: z.enum(TECHNOLOGY_IDS),
    topic: z.string(),
    description: z.string().default(''),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    language: z.enum(['en', 'ar']).default('en'),
  }),
});

export const collections = { docs, cheatSheets, interviewQuestions };

