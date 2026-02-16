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
    "relieved",
    "connected",
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

// Maps common words/phrases to our emotion labels
const synonyms: Record<string, string> = {
  // high/good
  "amazing": "elated",
  "buzzing": "excited",
  "great": "happy",
  "wonderful": "joyful",
  "fantastic": "elated",
  "thrilled": "excited",
  "pumped": "energized",
  "motivated": "inspired",
  "creative": "inspired",
  "funny": "amused",
  "laughing": "amused",
  "laugh": "amused",
  "love": "loving",
  "loved": "loving",
  "thankful": "grateful",
  "blessed": "grateful",
  "chill": "relaxed",
  "chilled": "relaxed",
  "good": "content",
  "fine": "okay",
  "alright": "okay",
  "nice": "pleased",
  "safe": "comfortable",
  "cozy": "comfortable",
  "serene": "peaceful",
  "better": "relieved",
  "relief": "relieved",
  "released": "relieved",
  "lighter": "relieved",
  "free": "relieved",
  "connected": "connected",
  "connection": "connected",
  "close": "connected",
  "closeness": "connected",
  "together": "connected",
  "bonding": "connected",
  "supported": "comfortable",
  "secure": "comfortable",
  "settled": "content",
  "at ease": "relaxed",
  "rested": "relaxed",
  "refreshed": "energized",
  "alive": "energized",
  "strong": "confident",
  "capable": "confident",
  "accomplished": "proud",
  "achieved": "proud",
  "joyful": "joyful",
  "joy": "joyful",
  "delighted": "pleased",
  "enjoyed": "pleased",
  "enjoying": "pleased",
  "fun": "amused",
  // neutral
  "bored": "flat",
  "thinking": "pensive",
  "thoughtful": "reflective",
  "unfocused": "distracted",
  "fidgety": "restless",
  "unsure": "uncertain",
  "confused": "uncertain",
  "meh": "indifferent",
  // low
  "unhappy": "sad",
  "crying": "sad",
  "cry": "sad",
  "cried": "sad",
  "tearful": "sad",
  "tears": "sad",
  "upset": "sad",
  "down": "sad",
  "low": "sad",
  "blue": "sad",
  "weary": "tired",
  "sleepy": "tired",
  "fatigued": "tired",
  "knackered": "tired",
  "worn out": "tired",
  "run down": "tired",
  "shattered": "exhausted",
  "burnt out": "exhausted",
  "burnout": "exhausted",
  "wiped": "drained",
  "depleted": "drained",
  "spent": "drained",
  "alone": "lonely",
  "isolated": "lonely",
  "withdrawn": "lonely",
  "let down": "disappointed",
  "letdown": "disappointed",
  "gutted": "disappointed",
  "annoyed": "irritated",
  "snapping": "irritated",
  "snapped": "irritated",
  "snappy": "irritated",
  "agitated": "irritated",
  "grumpy": "irritated",
  "grouchy": "irritated",
  "moody": "irritated",
  "cranky": "irritated",
  "angry": "angry",
  "anger": "angry",
  "rage": "angry",
  "raging": "angry",
  "furious": "angry",
  "mad": "angry",
  "pissed": "angry",
  "argument": "angry",
  "argued": "angry",
  "arguing": "angry",
  "fight": "angry",
  "fighting": "angry",
  "fought": "angry",
  "yelling": "angry",
  "yelled": "angry",
  "shouting": "angry",
  "shouted": "angry",
  "screaming": "angry",
  "screamed": "angry",
  "hostile": "angry",
  "resentful": "frustrated",
  "resentment": "frustrated",
  "worried": "anxious",
  "nervous": "anxious",
  "worry": "anxious",
  "worrying": "anxious",
  "tense": "stressed",
  "pressure": "stressed",
  "pressured": "stressed",
  "swamped": "overwhelmed",
  "drowning": "overwhelmed",
  "too much": "overwhelmed",
  "envious": "jealous",
  // bad
  "terrible": "miserable",
  "awful": "miserable",
  "horrible": "miserable",
  "wretched": "miserable",
  "scared": "terrified",
  "fear": "terrified",
  "frightened": "terrified",
  "panic": "panicked",
  "panicking": "panicked",
  "shame": "ashamed",
  "guilty": "ashamed",
  "guilt": "ashamed",
  "gross": "disgusted",
  "sick": "disgusted",
  "nothing": "empty",
  "void": "empty",
  "hollow": "empty",
  "hopeless": "hopeless",
  "despair": "despairing",
  "destroyed": "crushed",
  "devastated": "crushed",
  "numb": "numb",
  "shut down": "numb",
  "shutdown": "numb",
  "disconnected": "numb",
  "broken": "broken",
  "lost": "lost",
  "stuck": "lost",
};

// All emotion words from all mood groups
const allEmotions: string[] = Object.values(emotionsByMood).flat();

export function getAllEmotionWords(): string[] {
  return allEmotions;
}

// Map each emotion to its category for filtering
const emotionCategory: Record<string, string> = {};
for (const [category, emotions] of Object.entries(emotionsByMood)) {
  for (const emotion of emotions) {
    emotionCategory[emotion] = category;
  }
}

// Which categories are allowed for each mood range
function getAllowedCategories(mood: number): Set<string> {
  if (mood >= 6) return new Set(['high', 'good']);
  if (mood >= 5) return new Set(['high', 'good', 'neutral']);
  if (mood >= 4) return new Set(['good', 'neutral', 'low']);
  if (mood >= 3) return new Set(['neutral', 'low', 'bad']);
  return new Set(['low', 'bad']);
}

/**
 * Extract emotions from free text by matching against known emotion words
 * and common synonyms. Filters results to match the mood intensity.
 * Falls back to the top emotion for the given mood level.
 */
export function extractEmotions(text: string, mood: number): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  const allowed = getAllowedCategories(mood);

  // Direct matches against our emotion labels
  for (const emotion of allEmotions) {
    const regex = new RegExp(`\\b${emotion}\\b`, 'i');
    if (regex.test(lower)) {
      found.add(emotion);
    }
  }

  // Synonym/phrase matches
  for (const [phrase, emotion] of Object.entries(synonyms)) {
    if (lower.includes(phrase)) {
      found.add(emotion);
    }
  }

  // Filter to only emotions compatible with the mood level
  const filtered = [...found].filter(e => {
    const cat = emotionCategory[e];
    return cat ? allowed.has(cat) : true;
  });

  return filtered.slice(0, 5);
}

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
