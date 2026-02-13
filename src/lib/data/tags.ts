export const contextTags = [
  'work',
  'exercise',
  'social',
  'family',
  'alone time',
  'outdoors',
  'creative',
  'rest',
  'travel',
  'food',
  'health',
  'learning',
  'morning',
  'evening',
  'weekend',
] as const;

export type ContextTag = typeof contextTags[number];
