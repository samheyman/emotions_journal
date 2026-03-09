import { writable } from "svelte/store";
import type { EmotionEntry } from "../types";

const STORAGE_KEY = "emotions-log-entries";

// Migrate entries from old schemas to new (energy 0..6, nsState 0..6).
function migrateEntry(e: any): EmotionEntry {
  if ("nsState" in e) return e as EmotionEntry;
  if ("activation" in e) {
    // Intermediate schema: had energy 0..6 + activation 0..6
    const { activation, ...rest } = e;
    return { ...rest, nsState: activation } as EmotionEntry;
  }
  // Old schema: valence -3..+3 + energy -3..+3
  const oldEnergy = e.energy ?? 0;
  const { valence, energy: _oldEnergy, ...rest } = e;
  return {
    ...rest,
    energy: typeof valence === "number" ? valence + 3 : 3,
    nsState: typeof oldEnergy === "number" ? oldEnergy + 3 : 2,
  } as EmotionEntry;
}

function loadEntries(): EmotionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as any[]).map(migrateEntry);
  } catch {
    return [];
  }
}

function saveEntries(entries: EmotionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function createEntriesStore() {
  const { subscribe, update, set } = writable<EmotionEntry[]>(loadEntries());

  subscribe((entries) => {
    saveEntries(entries);
  });

  return {
    subscribe,
    add(entry: EmotionEntry) {
      update((entries) => [entry, ...entries]);
    },
    remove(id: string) {
      update((entries) => entries.filter((e) => e.id !== id));
    },
    clear() {
      set([]);
    },
    updateEntry(updated: EmotionEntry) {
      update((entries) =>
        entries.map((e) => (e.id === updated.id ? updated : e)),
      );
    },
    importEntries(newEntries: EmotionEntry[]) {
      update((existing) => {
        const existingIds = new Set(existing.map((e) => e.id));
        const unique = newEntries.filter((e) => !existingIds.has(e.id));
        return [...existing, ...unique];
      });
    },
  };
}

export const entries = createEntriesStore();
