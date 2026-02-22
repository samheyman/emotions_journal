export type ExperiencedPeriod =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "allday";

export interface EmotionEntry {
  id: string;
  loggedAt: string;        // ISO 8601 - when the entry was created
  updatedAt?: string;      // ISO 8601 - when the entry was last updated
  experiencedDate: string; // YYYY-MM-DD - date the emotion was experienced
  valence: number;         // -3 to +3: Negative (-3) to Positive (+3)
  energy: number;          // -3 to +3: Low (-3) to High (+3)
  emotions: string[];
  tags: string[];
  note: string;
  experiencedPeriod?: ExperiencedPeriod;
}

export type View = "home" | "checkin" | "addevent" | "trends" | "settings";

export interface EventType {
  id: string;
  name: string;
  emoji: string;
  isCustom?: boolean;
  visible?: boolean; // defaults to true when absent
}

export interface LoggedEvent {
  id: string;
  loggedAt: string;    // ISO 8601 - when the event was entered
  updatedAt?: string;  // ISO 8601 - when the event was last updated
  eventDate: string;   // YYYY-MM-DD - when the event occurred
  eventTime?: string;  // HH:MM - absent or empty means all-day
  typeId: string;      // references EventType.id
  note?: string;
}

export type HomeTab = "timeline" | "calendar";

export type TrendRange = "week" | "month" | "3month";

export interface MoodOption {
  value: number;
  label: string;
  color: string;
}

/**
In emotion theory (especially Emotion-Focused Therapy and parts of affective science):

Primary emotions
Immediate, automatic, fundamental,
Biologically rooted
Direct responses to events
e.g. fear, anger, sadness, joy

Secondary emotions
Reactions to primary emotions, derived, blended
More cognitive / socially shaped
Often layered
e.g. shame (anger turned inward), jealousy (fear + anger), frustration (blocked anger)

Somatic emotions
Bodily feelings
e.g. Tired, exhausted

Future coaching prompts like:
“It looks like you selected several secondary emotions. Would you like help identifying what might be underneath?”

Is this emotion fundamental, or layered/cognitive?

Example:
Angry → Primary
Frustrated → Secondary
Jealous → Secondary
Sad → Primary
Miserable → Secondary
This is about structure of the emotion, not its theme.

*/

export type Emotion = {
  name: string;
  valence: number; // -3 to +3
  energy: number; // -3 to +3
  type: "primary" | "secondary" | "somatic";
  embedding: number[]; // 384-dim all-MiniLM-L6-v2
};
