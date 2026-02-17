export const contextTags = [
  "exercise",
  "poor sleep",
  "alcohol",
  "conflict",
  "period",
  "sex/intimacy",
  "social",
  "work",
  "family",
  "alone time",
  "outdoors",
  "rest",
  "fainting",
  "IBS",
] as const;

export type ContextTag = (typeof contextTags)[number];
