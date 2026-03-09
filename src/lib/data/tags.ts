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
  "watching triggering content",
  "out and about",
] as const;

export type ContextTag = (typeof contextTags)[number];
