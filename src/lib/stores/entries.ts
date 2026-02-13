import { writable } from 'svelte/store';
import type { EmotionEntry } from '../types';

const STORAGE_KEY = 'emotions-log-entries';

function loadEntries(): EmotionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
  };
}

export const entries = createEntriesStore();
