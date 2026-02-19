import type { EventType } from '../types';

export const DEFAULT_EVENT_TYPES: EventType[] = [
  { id: 'period', name: 'Period started', emoji: '◆' },
  { id: 'medication', name: 'Took medication', emoji: '✚' },
  { id: 'alcohol', name: 'Drank alcohol', emoji: '◇' },
  { id: 'exercise', name: 'Exercised', emoji: '▲' },
  { id: 'poor-sleep', name: 'Poor sleep', emoji: '○' },
  { id: 'sex', name: 'Had sex', emoji: '♥' },
  { id: 'fainted', name: 'Fainted', emoji: '↯' },
  { id: 'headache', name: 'Headache/Migraine', emoji: '≈' },
  { id: 'panic', name: 'Panic attack', emoji: '‼' },
  { id: 'caffeine', name: 'Had caffeine', emoji: '●' },
];

export const ICON_OPTIONS = ['◆', '◇', '●', '○', '▲', '△', '■', '□', '★', '☆', '✚', '✕', '♥', '♦', '≈', '‼', '→', '↑', '◉', '✓'];
