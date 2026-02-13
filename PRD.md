# Product Requirements Document

## Problem

Current mood tracking apps fall into two camps:

1. **Too simplistic.** A 1-5 scale or emoji picker collapses all emotional nuance into a single dimension. "How are you feeling?" with 5 options cannot distinguish calm from bored, or excited from anxious.
2. **Too tedious.** Apps that capture nuance require long questionnaires, making daily use unsustainable.

## Target User

Anyone who wants to understand their emotional patterns over time. Primary personas:

- A person managing stress who wants to spot triggers
- A therapy client who wants to bring concrete data to sessions
- A self-improvement enthusiast building emotional awareness

## Emotion Model

We use **Russell's circumplex model of affect**, which maps emotions onto two axes:

- **Valence** (x-axis): Unpleasant (-5) to Pleasant (+5)
- **Energy / Arousal** (y-axis): Low energy (-5) to High energy (+5)

This gives four quadrants:

| Quadrant              | Valence | Energy | Example emotions          |
| --------------------- | ------- | ------ | ------------------------- |
| High energy, pleasant | +       | +      | Excited, joyful, elated   |
| High energy, unpleasant | -     | +      | Anxious, angry, stressed  |
| Low energy, pleasant  | +       | -      | Calm, serene, content     |
| Low energy, unpleasant | -      | -      | Sad, tired, bored         |

## User Stories

1. **Quick check-in (<30s).** As a user, I can open the app, tap the Mood Pad, optionally pick labels/tags/notes, and save -- all in under 30 seconds.
2. **Review timeline.** As a user, I can scroll through past entries in chronological order and see how I felt at a glance.
3. **See trends.** As a user, I can view a chart of my valence and energy over time to spot patterns.
4. **Calendar view.** As a user, I can see a month view with color-coded dots showing my emotional state each day.
5. **Export data.** As a user, I can export all my entries as JSON so my data is never locked in.

## Feature Specs

### MoodPad (2D input)

- A square touch/click area representing the valence x energy space
- Pointer events (touch + mouse) for tap or drag positioning
- Background gradient shifts to reflect the selected quadrant
- Outputs valence (-5 to +5) and energy (-5 to +5) as floating point numbers
- Shows crosshair or dot at selected position

### Emotion Label Picker

- Predefined list of emotion words organized by quadrant
- User selects 1-3 labels that best describe their feeling
- Labels are contextual -- shown based on the quadrant selected on the MoodPad

### Context Tags

- Predefined tags: work, social, health, family, exercise, sleep, food, weather, travel, creative
- Multi-select, optional

### Free-text Note

- Optional text field for additional context
- No character limit enforced in MVP

### Timeline View (Home)

- Reverse-chronological list of entries
- Each entry card shows: timestamp, mood dot colored by quadrant, emotion labels, tags, truncated note

### Calendar View (Home)

- Month grid with colored dots per day
- Dot color derived from average valence/energy for that day
- Tap a day to see entries for that day

### Trends Chart

- Line chart showing valence and energy over time (7d / 30d / all)
- Built with Chart.js

### JSON Export

- Button in settings or trends view
- Downloads all entries as a `.json` file

## Data Model

```typescript
interface EmotionEntry {
  id: string;              // crypto.randomUUID()
  timestamp: string;       // ISO 8601
  valence: number;         // -5 to +5
  energy: number;          // -5 to +5
  emotions: string[];      // 1-3 labels
  tags: string[];          // context tags
  note: string;            // optional free text
}
```

## MVP Scope

Everything listed above ships in the web prototype. The following are explicitly **out of scope** for MVP:

- User accounts and authentication
- Backend / cloud sync
- Push notification reminders
- Sharing or social features
- AI-powered insights

## Success Metrics

| Metric                              | Target       |
| ----------------------------------- | ------------ |
| Complete check-in time              | < 30 seconds |
| Data persists across browser sessions | 100%       |
| PWA installable on mobile           | Yes          |
| Works offline after first load      | Yes          |
