import {
  Activity, AlertCircle, Apple, Beer, Bike, Book, Brain, Cigarette,
  Clock, CloudRain, Coffee, Droplets, Dumbbell, Eye, Flame, Footprints,
  Frown, Heart, HeartPulse, Leaf, Moon, Music, Pill, Smile,
  Star, Sun, Thermometer, Users, Utensils, Wine, Zap,
} from 'lucide-svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICON_MAP: Record<string, any> = {
  Activity, AlertCircle, Apple, Beer, Bike, Book, Brain, Cigarette,
  Clock, CloudRain, Coffee, Droplets, Dumbbell, Eye, Flame, Footprints,
  Frown, Heart, HeartPulse, Leaf, Moon, Music, Pill, Smile,
  Star, Sun, Thermometer, Users, Utensils, Wine, Zap,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

/** Old abstract symbol → Lucide icon name, for migrating stored data. */
export const LEGACY_ICON_MAP: Record<string, string> = {
  '◆': 'Droplets',
  '✚': 'Pill',
  '◇': 'Wine',
  '▲': 'Dumbbell',
  '○': 'Moon',
  '♥': 'Heart',
  '↯': 'AlertCircle',
  '≈': 'Brain',
  '‼': 'HeartPulse',
  '●': 'Coffee',
};
