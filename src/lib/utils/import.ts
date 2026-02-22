import type { EmotionEntry } from '../types';

export function validateEntry(obj: unknown): EmotionEntry | null {
  if (obj === null || typeof obj !== 'object') return null;

  const o = obj as Record<string, unknown>;

  if (typeof o.id !== 'string' || o.id === '') return null;

  if (typeof o.experiencedDate !== 'string' || o.experiencedDate === '') return null;
  const experiencedDate = o.experiencedDate.slice(0, 10);

  if (typeof o.valence !== 'number') return null;
  if (typeof o.energy !== 'number') return null;
  if (!Array.isArray(o.emotions) || !o.emotions.every((e: unknown) => typeof e === 'string')) return null;
  if (!Array.isArray(o.tags) || !o.tags.every((t: unknown) => typeof t === 'string')) return null;
  if (typeof o.note !== 'string') return null;

  const loggedAt = typeof o.loggedAt === 'string' && o.loggedAt !== '' ? o.loggedAt : new Date().toISOString();

  const entry: EmotionEntry = {
    id: o.id,
    loggedAt,
    experiencedDate,
    valence: o.valence,
    energy: o.energy,
    emotions: o.emotions,
    tags: o.tags,
    note: o.note,
  };

  if (typeof o.updatedAt === 'string' && o.updatedAt !== '') {
    entry.updatedAt = o.updatedAt;
  }

  const validPeriods = ['morning', 'afternoon', 'evening', 'night', 'allday'];
  entry.experiencedPeriod = (typeof o.experiencedPeriod === 'string' && validPeriods.includes(o.experiencedPeriod))
    ? o.experiencedPeriod as EmotionEntry['experiencedPeriod']
    : 'allday';

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
