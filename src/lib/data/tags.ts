export const contextTags = [
  "work",
  "exercise",
  "social",
  "family",
  "alone time",
  "outdoors",
  "creative",
  "rest",
  "travel",
  "food",
  "health",
  "learning",
  "leisure",
] as const;

export type ContextTag = (typeof contextTags)[number];
