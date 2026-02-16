import type { MoodOption } from "../types";

export const moodOptions: MoodOption[] = [
  {
    value: 7,
    label: "Amazing / Buzzing",
    color: "hsl(145, 45%, 72%)",
  },
  {
    value: 6,
    label: "Happy Energetic",
    color: "hsl(135, 40%, 78%)",
  },
  {
    value: 5,
    label: "Calm / Pleasant",
    color: "hsl(125, 30%, 84%)",
  },
  {
    value: 4,
    label: "So-so / Neutral",
    color: "hsl(0, 0%, 95w%)",
  },
  {
    value: 3,
    label: "Down / Unsettled",
    color: "hsl(20, 35%, 84%)",
  },
  {
    value: 2,
    label: "Bad / Low",
    color: "hsl(15, 40%, 78%)",
  },
  {
    value: 1,
    label: "Very low / Depressed",
    color: "hsl(10, 45%, 72%)",
  },
];

export function getMoodOption(value: number): MoodOption {
  return moodOptions.find((m) => m.value === value) ?? moodOptions[3];
}

export function getMoodLabel(value: number): string {
  return getMoodOption(value).label;
}

export function getMoodColor(value: number): string {
  return getMoodOption(value).color;
}

// Emotions grouped by mood range
const emotionsByMood: Record<string, string[]> = {
  high: [
    "excited",
    "joyful",
    "enthusiastic",
    "energized",
    "inspired",
    "amused",
    "proud",
    "confident",
    "playful",
    "passionate",
    "grateful",
    "elated",
  ],
  good: [
    "happy",
    "hopeful",
    "content",
    "cheerful",
    "optimistic",
    "relaxed",
    "peaceful",
    "pleased",
    "comfortable",
    "warm",
    "friendly",
    "loving",
  ],
  neutral: [
    "calm",
    "okay",
    "steady",
    "indifferent",
    "mellow",
    "quiet",
    "pensive",
    "reflective",
    "distracted",
    "restless",
    "uncertain",
    "flat",
  ],
  low: [
    "sad",
    "tired",
    "drained",
    "lonely",
    "disappointed",
    "frustrated",
    "anxious",
    "stressed",
    "irritated",
    "overwhelmed",
    "hopeless",
    "numb",
    "jealous",
  ],
  bad: [
    "angry",
    "miserable",
    "exhausted",
    "panicked",
    "despairing",
    "empty",
    "ashamed",
    "disgusted",
    "terrified",
    "crushed",
    "broken",
    "lost",
  ],
};

export function getEmotionsForMood(mood: number): string[] {
  if (mood >= 7)
    return [...emotionsByMood.high, ...emotionsByMood.good.slice(0, 4)];
  if (mood >= 6)
    return [...emotionsByMood.good, ...emotionsByMood.high.slice(0, 4)];
  if (mood >= 5)
    return [...emotionsByMood.good, ...emotionsByMood.neutral.slice(0, 4)];
  if (mood >= 4)
    return [...emotionsByMood.neutral, ...emotionsByMood.low.slice(0, 4)];
  if (mood >= 3)
    return [...emotionsByMood.low, ...emotionsByMood.neutral.slice(0, 4)];
  if (mood >= 2)
    return [...emotionsByMood.low, ...emotionsByMood.bad.slice(0, 4)];
  return [...emotionsByMood.bad, ...emotionsByMood.low.slice(0, 4)];
}
