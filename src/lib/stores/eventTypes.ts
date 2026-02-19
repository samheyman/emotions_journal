import { writable } from 'svelte/store';
import type { EventType } from '../types';
import { DEFAULT_EVENT_TYPES } from '../data/eventTypes';

const STORAGE_KEY = 'emotions-log-event-types';

function loadEventTypes(): EventType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_EVENT_TYPES];
    const saved: EventType[] = JSON.parse(raw);
    const savedById = new Map(saved.map((t) => [t.id, t]));
    const defaultIds = new Set(DEFAULT_EVENT_TYPES.map((t) => t.id));
    // Merge defaults (preserving saved emoji/visibility) then append custom types
    const defaults = DEFAULT_EVENT_TYPES.map((t) => {
      const s = savedById.get(t.id);
      return s ? { ...t, emoji: s.emoji ?? t.emoji, visible: s.visible } : t;
    });
    const custom = saved.filter((t) => !defaultIds.has(t.id));
    return [...defaults, ...custom];
  } catch {
    return [...DEFAULT_EVENT_TYPES];
  }
}

function saveEventTypes(types: EventType[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

function createEventTypesStore() {
  const { subscribe, update } = writable<EventType[]>(loadEventTypes());

  subscribe((types) => {
    saveEventTypes(types);
  });

  return {
    subscribe,
    addEventType(type: EventType) {
      update((types) => [...types, type]);
    },
    removeEventType(id: string) {
      update((types) => types.filter((t) => t.id !== id));
    },
    setVisibility(id: string, visible: boolean) {
      update((types) => types.map((t) => t.id === id ? { ...t, visible } : t));
    },
    setEmoji(id: string, emoji: string) {
      update((types) => types.map((t) => t.id === id ? { ...t, emoji } : t));
    },
  };
}

export const eventTypes = createEventTypesStore();
