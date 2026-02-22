import type { EmotionEntry, EventType, LoggedEvent } from '../types';

export function validateEntry(obj: unknown): EmotionEntry | null {
  if (obj === null || typeof obj !== 'object') return null;

  const o = obj as Record<string, unknown>;

  if (typeof o.id !== 'string' || o.id === '') return null;

  if (typeof o.experiencedDate !== 'string' || o.experiencedDate === '') return null;
  const experiencedDate = o.experiencedDate.slice(0, 10);

  if (typeof o.valence !== 'number') return null;
  if (typeof o.energy !== 'number') return null;
  if (!Array.isArray(o.emotions) || !o.emotions.every((e: unknown) => typeof e === 'string')) return null;
  const tags: string[] = Array.isArray(o.tags) && o.tags.every((t: unknown) => typeof t === 'string')
    ? o.tags as string[]
    : [];
  if (typeof o.note !== 'string') return null;

  const loggedAt = typeof o.loggedAt === 'string' && o.loggedAt !== '' ? o.loggedAt : new Date().toISOString();

  const entry: EmotionEntry = {
    id: o.id,
    loggedAt,
    experiencedDate,
    valence: o.valence as number,
    energy: o.energy as number,
    emotions: o.emotions as string[],
    tags,
    note: o.note as string,
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

export function validateEvent(obj: unknown): LoggedEvent | null {
  if (obj === null || typeof obj !== 'object') return null;

  const o = obj as Record<string, unknown>;

  if (typeof o.id !== 'string' || o.id === '') return null;
  if (typeof o.typeId !== 'string' || o.typeId === '') return null;
  if (typeof o.eventDate !== 'string' || o.eventDate === '') return null;

  const loggedAt = typeof o.loggedAt === 'string' && o.loggedAt !== '' ? o.loggedAt : new Date().toISOString();

  const event: LoggedEvent = {
    id: o.id,
    loggedAt,
    eventDate: o.eventDate.slice(0, 10),
    typeId: o.typeId,
  };

  if (typeof o.updatedAt === 'string' && o.updatedAt !== '') {
    event.updatedAt = o.updatedAt;
  }
  if (typeof o.eventTime === 'string' && o.eventTime !== '') {
    event.eventTime = o.eventTime;
  }
  if (typeof o.note === 'string' && o.note !== '') {
    event.note = o.note;
  }

  return event;
}

export function validateEventType(obj: unknown): EventType | null {
  if (obj === null || typeof obj !== 'object') return null;

  const o = obj as Record<string, unknown>;

  if (typeof o.id !== 'string' || o.id === '') return null;
  if (typeof o.name !== 'string' || o.name === '') return null;
  if (typeof o.emoji !== 'string') return null;

  return {
    id: o.id,
    name: o.name,
    emoji: o.emoji,
    isCustom: true,
    visible: o.visible !== false,
  };
}

export async function parseImportFile(file: File): Promise<{
  validEntries: EmotionEntry[];
  validEvents: LoggedEvent[];
  validEventTypes: EventType[];
  discardedEntries: number;
  discardedEvents: number;
}> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  // Accept both the export format { metadata, entries, events } and a raw entries array
  const rawEntries: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.entries) ? parsed.entries : [];

  const rawEvents: unknown[] = Array.isArray(parsed?.events) ? parsed.events : [];

  const validEntries: EmotionEntry[] = [];
  let discardedEntries = 0;
  for (const item of rawEntries) {
    const entry = validateEntry(item);
    if (entry) validEntries.push(entry);
    else discardedEntries++;
  }

  const validEvents: LoggedEvent[] = [];
  let discardedEvents = 0;
  for (const item of rawEvents) {
    const event = validateEvent(item);
    if (event) validEvents.push(event);
    else discardedEvents++;
  }

  const rawEventTypes: unknown[] = Array.isArray(parsed?.customEventTypes) ? parsed.customEventTypes : [];
  const validEventTypes: EventType[] = rawEventTypes.flatMap((item) => {
    const t = validateEventType(item);
    return t ? [t] : [];
  });

  return { validEntries, validEvents, validEventTypes, discardedEntries, discardedEvents };
}
