export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'allday';

export interface EmotionEntry {
  id: string;
  timestamp: string;
  mood: number;          // 1-7: Dreadful(1) to Buzzing(7)
  emotions: string[];
  tags: string[];
  note: string;
  timeOfDay?: TimeOfDay;
}

export type View = 'home' | 'checkin' | 'trends';

export type HomeTab = 'timeline' | 'calendar';

export type TrendRange = 'week' | 'month' | '3month';

export interface MoodOption {
  value: number;
  label: string;
  color: string;
}
