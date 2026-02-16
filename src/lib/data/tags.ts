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
  "pleasure",
  "intimacy",
] as const;

export type ContextTag = (typeof contextTags)[number];
