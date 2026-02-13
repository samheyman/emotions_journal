import type { MoodOption } from '../types';

export const moodOptions: MoodOption[] = [
  { value: 7, label: 'Buzzing', color: '#D4A853' },
  { value: 6, label: 'Happy',   color: '#C4846C' },
  { value: 5, label: 'Fine',    color: '#B8A088' },
  { value: 4, label: 'So-so',   color: '#A8A4A0' },
  { value: 3, label: 'Down',    color: '#8E9EAA' },
  { value: 2, label: 'Bad',     color: '#7A90A4' },
  { value: 1, label: 'Dreadful', color: '#6B819A' },
];

export function getMoodOption(value: number): MoodOption {
  return moodOptions.find((m) => m.value === value) ?? moodOptions[3];
}

export function getMoodLabel(value: number): string {
  return getMoodOption(value).label;
}

export function getMoodColor(value: number): string {
  return getMoodOption(value).color;
}

// Emotions grouped by mood range
const emotionsByMood: Record<string, string[]> = {
  high: [
    'excited', 'joyful', 'enthusiastic', 'energized',
    'inspired', 'amused', 'proud', 'confident',
    'playful', 'passionate', 'grateful', 'elated',
  ],
  good: [
    'happy', 'hopeful', 'content', 'cheerful',
    'optimistic', 'relaxed', 'peaceful', 'pleased',
    'comfortable', 'warm', 'friendly', 'loving',
  ],
  neutral: [
    'calm', 'okay', 'steady', 'indifferent',
    'mellow', 'quiet', 'pensive', 'reflective',
    'distracted', 'restless', 'uncertain', 'flat',
  ],
  low: [
    'sad', 'tired', 'drained', 'lonely',
    'disappointed', 'frustrated', 'anxious', 'stressed',
    'irritated', 'overwhelmed', 'hopeless', 'numb',
  ],
  bad: [
    'angry', 'miserable', 'exhausted', 'panicked',
    'despairing', 'empty', 'ashamed', 'disgusted',
    'terrified', 'crushed', 'broken', 'lost',
  ],
};

export function getEmotionsForMood(mood: number): string[] {
  if (mood >= 7) return [...emotionsByMood.high, ...emotionsByMood.good.slice(0, 4)];
  if (mood >= 6) return [...emotionsByMood.good, ...emotionsByMood.high.slice(0, 4)];
  if (mood >= 5) return [...emotionsByMood.good, ...emotionsByMood.neutral.slice(0, 4)];
  if (mood >= 4) return [...emotionsByMood.neutral, ...emotionsByMood.low.slice(0, 4)];
  if (mood >= 3) return [...emotionsByMood.low, ...emotionsByMood.neutral.slice(0, 4)];
  if (mood >= 2) return [...emotionsByMood.low, ...emotionsByMood.bad.slice(0, 4)];
  return [...emotionsByMood.bad, ...emotionsByMood.low.slice(0, 4)];
}
