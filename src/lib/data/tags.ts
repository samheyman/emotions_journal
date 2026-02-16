export const contextTags = [
  "exercise",
  "poor sleep",
  "alcohol",
  "conflict",
  "period",
  "sex",
  "sex release",
  "social",
  "work",
  "family",
  "alone time",
  "outdoors",
  "rest",
] as const;

export type ContextTag = (typeof contextTags)[number];
