export const contextTags = [
  "exercise",
  "poor sleep",
  "alcohol",
  "conflict",
  "period",
  "sex/intimicy",
  "social",
  "work",
  "family",
  "alone time",
  "outdoors",
  "rest",
] as const;

export type ContextTag = (typeof contextTags)[number];
