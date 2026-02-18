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
  "kids's demands",
  "overwhelmed",
] as const;

export type ContextTag = (typeof contextTags)[number];
