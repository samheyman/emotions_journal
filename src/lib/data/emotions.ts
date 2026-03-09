import type { EnergyOption } from "../types";
import { EMOTIONS } from "./emotionsWithValenceAndEnergy";
import { findSimilarEmotions, isReady } from "../services/embeddingService";

export const energyOptions: EnergyOption[] = [
  {
    value: 6,
    label: "Strong / Energetic",
    color: "hsl(145, 45%, 72%)",
  },
  {
    value: 5,
    label: "Good",
    color: "hsl(135, 40%, 78%)",
  },
  {
    value: 4,
    label: "Slightly energised",
    color: "hsl(125, 30%, 84%)",
  },
  {
    value: 3,
    label: "OK / Neutral",
    color: "hsl(0, 0%, 95%)",
  },
  {
    value: 2,
    label: "Sluggish",
    color: "hsl(20, 35%, 84%)",
  },
  {
    value: 1,
    label: "Tired",
    color: "hsl(15, 40%, 78%)",
  },
  {
    value: 0,
    label: "Completely drained",
    color: "hsl(10, 45%, 72%)",
  },
];

export function getEnergyOption(value: number): EnergyOption {
  return energyOptions.find((m) => m.value === value) ?? energyOptions[3];
}

export function getEnergyColor(value: number): string {
  return getEnergyOption(value).color;
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
  pumped: "Energised",
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
  refreshed: "Energised",
  alive: "Energised",
  "in the flow": "Inspired",
  "in flow": "Inspired",
  flow: "Inspired",
  productive: "Motivated",
  "good day": "Happy",
  "great day": "Joyful",
  "nice day": "Happy",
  "lovely day": "Joyful",
  lovely: "Happy",
  "flew past": "Inspired",
  "time flew": "Inspired",
  absorbed: "Inspired",
  focused: "Motivated",
  engaged: "Enthusiastic",
  energetic: "Energised",
  bright: "Cheerful",
  upbeat: "Cheerful",
  cheerful: "Cheerful",
  positive: "Optimistic",
  "looking forward": "Hopeful",
  excited: "Excited",
  smiling: "Happy",
  smiled: "Happy",
  laughed: "Amused",

  // positive low energy
  chill: "Relaxed",
  chilled: "Relaxed",
  good: "Happy",
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
  "cold feet": "Anxious",
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

/**
 * Extract emotions from free text (sync, instant).
 * Scans for emotion names and synonyms.
 */
export function extractEmotions(
  text: string,
): { results: string[]; textMatched: string[] } {
  const lower = text.toLowerCase();
  const textMatchedSet = new Set<string>();

  // Direct matches against EMOTIONS names
  for (const emotion of EMOTIONS) {
    const regex = new RegExp(`\\b${emotion.name}\\b`, "i");
    if (regex.test(lower)) {
      textMatchedSet.add(emotion.name);
    }
  }

  // Synonym/phrase matches
  for (const [phrase, emotionName] of Object.entries(synonyms)) {
    if (lower.includes(phrase)) {
      textMatchedSet.add(emotionName);
    }
  }

  const results = [...textMatchedSet].slice(0, 5);
  const textMatched = [...textMatchedSet];

  return { results, textMatched };
}

/**
 * Extract emotions using semantic similarity (async).
 * Uses the embedding model if loaded, falls back to keyword + proximity.
 */
export async function extractEmotionsSemantic(
  text: string,
): Promise<{ results: string[]; semanticMatched: string[] }> {
  // Always start with keyword matches
  const keywordResults = extractEmotions(text);

  // If model isn't ready or text is too short, return keyword results
  if (!isReady() || text.trim().length < 3) {
    return { results: keywordResults.results, semanticMatched: [] };
  }

  // Get semantic matches
  const semanticResults = await findSimilarEmotions(text, 5);

  // Merge: keyword matches first (trusted), then semantic matches that aren't duplicates
  const merged = [...keywordResults.results];
  for (const emotion of semanticResults) {
    if (!merged.includes(emotion)) {
      merged.push(emotion);
    }
  }

  return { results: merged.slice(0, 7), semanticMatched: semanticResults };
}
