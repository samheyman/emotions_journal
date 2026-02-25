import type { EventType } from '../types';
export { ICON_NAMES as ICON_OPTIONS } from './icons';

export const DEFAULT_EVENT_TYPES: EventType[] = [
  { id: 'period',     name: 'Period started',     emoji: 'Droplets'    },
  { id: 'medication', name: 'Took medication',     emoji: 'Pill'        },
  { id: 'alcohol',    name: 'Drank alcohol',       emoji: 'Wine'        },
  { id: 'exercise',   name: 'Exercised',           emoji: 'Dumbbell'    },
  { id: 'poor-sleep', name: 'Poor sleep',          emoji: 'Moon'        },
  { id: 'sex',        name: 'Had sex',             emoji: 'Heart'       },
  { id: 'fainted',    name: 'Fainted',             emoji: 'AlertCircle' },
  { id: 'headache',   name: 'Headache/Migraine',   emoji: 'Brain'       },
  { id: 'panic',      name: 'Panic attack',        emoji: 'HeartPulse'  },
  { id: 'caffeine',   name: 'Had caffeine',        emoji: 'Coffee'      },
];
