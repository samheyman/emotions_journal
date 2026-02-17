export type TimeOfDay =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "allday";

export interface EmotionEntry {
  id: string;
  timestamp: string;
  valence: number; // -3 to +3: Negative (-3) to Positive (+3)
  energy: number; // -3 to +3: Low (-3) to High (+3)
  emotions: string[];
  tags: string[];
  note: string;
  timeOfDay?: TimeOfDay;
}

export type View = "home" | "checkin" | "trends";

export type HomeTab = "timeline" | "calendar";

export type TrendRange = "week" | "month" | "3month";

export interface MoodOption {
  value: number;
  label: string;
  color: string;
}
