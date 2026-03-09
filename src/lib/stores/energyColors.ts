import { writable } from 'svelte/store';

const STORAGE_KEY = 'emotions-log-mood-colors'; // keep old key for backward compat

export const ENERGY_COLOR_DEFAULTS = {
  positive: '#4caf50',
  neutral: '#ffffff',
  negative: '#fd7369',
};

type EnergyColors = typeof ENERGY_COLOR_DEFAULTS;

function load(): EnergyColors {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...ENERGY_COLOR_DEFAULTS };
    return { ...ENERGY_COLOR_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...ENERGY_COLOR_DEFAULTS };
  }
}

function apply(colors: EnergyColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--energy-positive', colors.positive);
  root.style.setProperty('--energy-neutral', colors.neutral);
  root.style.setProperty('--energy-negative', colors.negative);
}

function createEnergyColorsStore() {
  const { subscribe, update } = writable<EnergyColors>(load());

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
      update(() => ({ ...ENERGY_COLOR_DEFAULTS }));
    },
  };
}

export const energyColors = createEnergyColorsStore();
