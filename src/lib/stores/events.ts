import { writable } from 'svelte/store';
import type { LoggedEvent } from '../types';

const STORAGE_KEY = 'emotions-log-events';

function loadEvents(): LoggedEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: LoggedEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function createEventsStore() {
  const { subscribe, update, set } = writable<LoggedEvent[]>(loadEvents());

  subscribe((events) => {
    saveEvents(events);
  });

  return {
    subscribe,
    add(event: LoggedEvent) {
      update((events) => [event, ...events]);
    },
    remove(id: string) {
      update((events) => events.filter((e) => e.id !== id));
    },
    updateEvent(updated: LoggedEvent) {
      update((events) => events.map((e) => e.id === updated.id ? updated : e));
    },
    clear() {
      set([]);
    },
  };
}

export const events = createEventsStore();
