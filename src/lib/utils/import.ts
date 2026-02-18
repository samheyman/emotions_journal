import type { EmotionEntry } from '../types';

export function validateEntry(obj: unknown): EmotionEntry | null {
  if (obj === null || typeof obj !== 'object') return null;

  const o = obj as Record<string, unknown>;

  if (typeof o.id !== 'string' || o.id === '') return null;
  if (typeof o.timestamp !== 'string' || o.timestamp === '') return null;
  if (typeof o.valence !== 'number') return null;
  if (typeof o.energy !== 'number') return null;
  if (!Array.isArray(o.emotions) || !o.emotions.every((e: unknown) => typeof e === 'string')) return null;
  if (!Array.isArray(o.tags) || !o.tags.every((t: unknown) => typeof t === 'string')) return null;
  if (typeof o.note !== 'string') return null;

  const entry: EmotionEntry = {
    id: o.id,
    timestamp: o.timestamp,
    valence: o.valence,
    energy: o.energy,
    emotions: o.emotions,
    tags: o.tags,
    note: o.note,
  };

  if (o.timeOfDay !== undefined) {
    const validTimes = ['morning', 'afternoon', 'evening', 'night', 'allday'];
    if (typeof o.timeOfDay === 'string' && validTimes.includes(o.timeOfDay)) {
      entry.timeOfDay = o.timeOfDay as EmotionEntry['timeOfDay'];
    }
  }

  return entry;
}

export async function parseImportFile(file: File): Promise<{ valid: EmotionEntry[]; discarded: number }> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array');
  }

  const valid: EmotionEntry[] = [];
  let discarded = 0;

  for (const item of parsed) {
    const entry = validateEntry(item);
    if (entry) {
      valid.push(entry);
    } else {
      discarded++;
    }
  }

  return { valid, discarded };
}
