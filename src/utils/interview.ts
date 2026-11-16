import type { CollectionEntry } from 'astro:content';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuestionCounts {
  total: number;
  beginner: number;
  intermediate: number;
  advanced: number;
}

/**
 * Parses question count and difficulty distribution from the raw MDX body
 * at build time.
 */
export function extractQuestionCounts(body: string | undefined): QuestionCounts {
  if (!body) {
    return { total: 0, beginner: 0, intermediate: 0, advanced: 0 };
  }

  const beginner = (body.match(/difficulty=["']beginner["']/g) || []).length;
  const intermediate = (body.match(/difficulty=["']intermediate["']/g) || []).length;
  const advanced = (body.match(/difficulty=["']advanced["']/g) || []).length;
  const total = beginner + intermediate + advanced || (body.match(/<InterviewQuestion\b/g) || []).length;

  return { total, beginner, intermediate, advanced };
}

/**
 * Human-readable label for difficulty levels.
 */
export function difficultyLabel(level: DifficultyLevel, lang: 'en' | 'ar' = 'en'): string {
  if (lang === 'ar') {
    switch (level) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
    }
  }
  switch (level) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
  }
}

/**
 * Aggregates question counts across multiple topic entries for a technology.
 */
export function aggregateTechQuestions(entries: CollectionEntry<'interviewQuestions'>[]): QuestionCounts {
  return entries.reduce<QuestionCounts>(
    (acc, entry) => {
      const counts = extractQuestionCounts(entry.body);
      return {
        total: acc.total + counts.total,
        beginner: acc.beginner + counts.beginner,
        intermediate: acc.intermediate + counts.intermediate,
        advanced: acc.advanced + counts.advanced,
      };
    },
    { total: 0, beginner: 0, intermediate: 0, advanced: 0 },
  );
}
