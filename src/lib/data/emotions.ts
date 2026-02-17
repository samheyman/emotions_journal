import type { MoodOption } from "../types";
import { EMOTIONS } from "./emotionsWithValenceAndEnergy";
import { findSimilarEmotions, isReady } from "../services/embeddingService";

export const moodOptions: MoodOption[] = [
  {
    value: 3,
    label: "Amazing / Buzzing",
    color: "hsl(145, 45%, 72%)",
  },
  {
    value: 2,
    label: "Happy Energetic",
    color: "hsl(135, 40%, 78%)",
  },
  {
    value: 1,
    label: "Calm / Pleasant",
    color: "hsl(125, 30%, 84%)",
  },
  {
    value: 0,
    label: "So-so / Neutral",
    color: "hsl(0, 0%, 95%)",
  },
  {
    value: -1,
    label: "Down / Unsettled",
    color: "hsl(20, 35%, 84%)",
  },
  {
    value: -2,
    label: "Bad / Low",
    color: "hsl(15, 40%, 78%)",
  },
  {
    value: -3,
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

// All emotion names from the EMOTIONS list (for autocomplete)
const allEmotionNames: string[] = EMOTIONS.map((e) => e.name);

export function getAllEmotionWords(): string[] {
  return allEmotionNames;
}

// Maps common words/phrases to emotion names in EMOTIONS list
const synonyms: Record<string, string> = {
  // positive high energy
  amazing: "Elated",
  buzzing: "Excited",
  great: "Happy",
  wonderful: "Joyful",
  fantastic: "Elated",
  thrilled: "Excited",
  pumped: "Energized",
  creative: "Inspired",
  funny: "Amused",
  laughing: "Amused",
  laugh: "Amused",
  love: "Warm",
  loved: "Warm",
  thankful: "Grateful",
  blessed: "Grateful",
  joy: "Joyful",
  delighted: "Pleased",
  enjoyed: "Pleased",
  enjoying: "Pleased",
  fun: "Amused",
  accomplished: "Proud",
  achieved: "Proud",
  strong: "Confident",
  capable: "Confident",
  refreshed: "Energized",
  alive: "Energized",

  // positive low energy
  chill: "Relaxed",
  chilled: "Relaxed",
  good: "Content",
  fine: "Okay",
  alright: "Okay",
  nice: "Pleased",
  safe: "Warm",
  cozy: "Warm",
  better: "Relieved",
  relief: "Relieved",
  released: "Relieved",
  lighter: "Relieved",
  free: "Relieved",
  connection: "Connected",
  close: "Connected",
  closeness: "Connected",
  together: "Connected",
  bonding: "Connected",
  supported: "Warm",
  secure: "Warm",
  settled: "Content",
  "at ease": "Relaxed",
  rested: "Relaxed",

  // neutral
  bored: "Mellow",
  thinking: "Reflective",
  thoughtful: "Reflective",
  unfocused: "Distracted",
  fidgety: "Restless",
  unsure: "Uncertain",
  confused: "Uncertain",
  meh: "Okay",

  // negative low energy
  unhappy: "Upset",
  crying: "Tearful",
  cry: "Tearful",
  cried: "Tearful",
  tears: "Tearful",
  down: "Upset",
  low: "Upset",
  blue: "Upset",
  weary: "Tired",
  sleepy: "Tired",
  fatigued: "Tired",
  knackered: "Tired",
  "worn out": "Tired",
  "run down": "Tired",
  shattered: "Exhausted",
  "burnt out": "Exhausted",
  burnout: "Exhausted",
  wiped: "Drained",
  depleted: "Drained",
  spent: "Drained",
  alone: "Lonely",
  isolated: "Lonely",
  withdrawn: "Lonely",
  "let down": "Disappointed",
  letdown: "Disappointed",
  gutted: "Disappointed",
  despair: "Hopeless",
  destroyed: "Crushed",
  devastated: "Crushed",
  "shut down": "Numb",
  shutdown: "Numb",
  disconnected: "Numb",
  stuck: "Lost",

  // negative high energy
  annoyed: "Irritated",
  snapping: "Irritated",
  snapped: "Irritated",
  snappy: "Irritated",
  agitated: "Irritated",
  grumpy: "Irritated",
  grouchy: "Irritated",
  moody: "Irritated",
  cranky: "Irritated",
  anger: "Angry",
  rage: "Furious",
  raging: "Furious",
  mad: "Angry",
  pissed: "Angry",
  argument: "Angry",
  argued: "Angry",
  arguing: "Angry",
  fight: "Angry",
  fighting: "Angry",
  fought: "Angry",
  yelling: "Angry",
  yelled: "Angry",
  shouting: "Angry",
  shouted: "Angry",
  screaming: "Angry",
  screamed: "Angry",
  hostile: "Angry",
  resentful: "Frustrated",
  resentment: "Frustrated",
  worried: "Anxious",
  nervous: "Anxious",
  worry: "Anxious",
  worrying: "Anxious",
  tense: "Stressed",
  pressure: "Stressed",
  pressured: "Stressed",
  behind: "Stressed",
  late: "Stressed",
  deadline: "Stressed",
  overdue: "Stressed",
  "catching up": "Stressed",
  procrastinat: "Stressed",
  envious: "Jealous",
  terrible: "Depressed",
  awful: "Depressed",
  horrible: "Depressed",
  scared: "Terrified",
  fear: "Terrified",
  frightened: "Terrified",
  panic: "Panicked",
  panicking: "Panicked",
  shame: "Ashamed",
  guilty: "Ashamed",
  guilt: "Ashamed",
  gross: "Disgusted",
  sick: "Disgusted",
  nothing: "Empty",
  void: "Empty",
  hollow: "Empty",
};

// Build a lookup from lowercase name to EMOTIONS entry for fast matching
const emotionByName = new Map(
  EMOTIONS.map((e) => [e.name.toLowerCase(), e])
);

/**
 * Calculate Euclidean distance between two points
 */
function distance(
  v1: number,
  e1: number,
  v2: number,
  e2: number,
): number {
  return Math.sqrt((v1 - v2) ** 2 + (e1 - e2) ** 2);
}

/**
 * Extract emotions from free text + valence/energy position (sync, instant).
 *
 * 1. Text match: scan for emotion names and synonyms
 * 2. Proximity fill: suggest closest emotions to (valence, energy) that weren't text-matched
 */
export function extractEmotions(
  text: string,
  valence: number,
  energy: number = 0,
): string[] {
  const lower = text.toLowerCase();
  const textMatched = new Set<string>();

  // Step 1a: Direct matches against EMOTIONS names
  for (const emotion of EMOTIONS) {
    const regex = new RegExp(`\\b${emotion.name}\\b`, "i");
    if (regex.test(lower)) {
      textMatched.add(emotion.name);
    }
  }

  // Step 1b: Synonym/phrase matches
  for (const [phrase, emotionName] of Object.entries(synonyms)) {
    if (lower.includes(phrase)) {
      textMatched.add(emotionName);
    }
  }

  // Step 2: Proximity suggestions — fill remaining slots with closest emotions
  const maxTotal = 5;
  const results = [...textMatched].slice(0, maxTotal);

  if (results.length < maxTotal && (valence !== 0 || energy !== 0)) {
    const ranked = EMOTIONS
      .filter((e) => !textMatched.has(e.name))
      .map((e) => ({
        name: e.name,
        dist: distance(valence, energy, e.valence, e.energy),
      }))
      .sort((a, b) => a.dist - b.dist);

    for (const r of ranked) {
      if (results.length >= maxTotal) break;
      results.push(r.name);
    }
  }

  return results;
}

/**
 * Extract emotions using semantic similarity (async).
 * Uses the embedding model if loaded, falls back to keyword + proximity.
 */
export async function extractEmotionsSemantic(
  text: string,
  valence: number,
  energy: number = 0,
): Promise<string[]> {
  // Always start with keyword matches
  const keywordResults = extractEmotions(text, valence, energy);

  // If model isn't ready or text is too short, return keyword results
  if (!isReady() || text.trim().length < 3) {
    return keywordResults;
  }

  // Get semantic matches
  const semanticResults = await findSimilarEmotions(text, 5);

  // Merge: keyword matches first (trusted), then semantic matches that aren't duplicates
  const merged = [...keywordResults];
  for (const emotion of semanticResults) {
    if (!merged.includes(emotion)) {
      merged.push(emotion);
    }
  }

  return merged.slice(0, 7);
}
