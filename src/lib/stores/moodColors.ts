import { writable } from 'svelte/store';

const STORAGE_KEY = 'emotions-log-mood-colors';

export const MOOD_COLOR_DEFAULTS = {
  positive: '#4caf50',
  neutral: '#ffffff',
  negative: '#fd7369',
};

type MoodColors = typeof MOOD_COLOR_DEFAULTS;

function load(): MoodColors {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...MOOD_COLOR_DEFAULTS };
    return { ...MOOD_COLOR_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...MOOD_COLOR_DEFAULTS };
  }
}

function apply(colors: MoodColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--mood-positive', colors.positive);
  root.style.setProperty('--mood-neutral', colors.neutral);
  root.style.setProperty('--mood-negative', colors.negative);
}

function createMoodColorsStore() {
  const { subscribe, update } = writable<MoodColors>(load());

  subscribe((colors) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    apply(colors);
  });

  return {
    subscribe,
    setPositive(color: string) {
      update((c) => ({ ...c, positive: color }));
    },
    setNeutral(color: string) {
      update((c) => ({ ...c, neutral: color }));
    },
    setNegative(color: string) {
      update((c) => ({ ...c, negative: color }));
    },
    reset() {
      update(() => ({ ...MOOD_COLOR_DEFAULTS }));
    },
  };
}

export const moodColors = createMoodColorsStore();
