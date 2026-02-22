export const contextTags = [
  "exercise",
  "poor sleep",
  "good sleep",
  "alcohol",
  "conflict",
  "mess",
  "jealous",
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
