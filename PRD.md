# Product Requirements Document

## Working Name: OpenMood (Local-First Mood Journal)

---

# 1. Vision

Build a **fully user-owned, local-first mood tracking app** where:

- All data lives locally on the user’s device
- No cloud storage by default
- No accounts
- No emotional data monetization
- Full customization of labels and tags
- Open, portable data format (JSON / Markdown)

Inspired by the philosophy of Obsidian (local-first, user sovereignty)

---

# 2. Problem

Current mood tracking apps fall into two camps:

### 1. Too simplistic

A 1–5 scale or emoji picker collapses emotional nuance into a crude summary.

### 2. Too tedious

Long questionnaires reduce daily adherence.

Additionally:

### 3. Users do not own their emotional data

Most apps:

- Store emotional logs in proprietary cloud systems
- Lock export behind paywalls
- Monetize behavioral patterns

Emotional data is deeply personal. Ownership should default to the user.

---

# 3. Product Principles

1. **Local-first by default**
2. **User owns 100% of their data**
3. **Customizable emotional vocabulary**
4. **Fast daily logging (<30 seconds)**
5. **Simple first, depth optional**
6. **No dark patterns**

---

# 4. Target User

Anyone wanting to understand emotional patterns over time.

Primary personas:

- A person managing stress who wants to spot triggers
- A therapy client bringing concrete logs to sessions
- A self-awareness enthusiast
- A privacy-conscious user who refuses emotional surveillance

---

# 5. Core Interaction Model

## Step 1: Mood Score (1–7 Scale)

The first screen shows a **single vertical or horizontal 1–7 scale**.

Default example (fully customizable):

```
7 — Perfect
6 — Excellent
5 — Good
4 — Passable
3 — Bad
2 — Atrocious
1 — Rock bottom
```

### Why 7?

- More granularity at the top (where nuance matters most)
- Better resolution than 1–5
- Avoids over-precision of 1–10
- Psychologically lightweight

Users can:

- Rename labels
- Change wording
- Use emojis instead
- Reverse direction if desired

Only the numeric score (1–7) is structurally fixed.

---

## Step 2: Emotion Selection (Shown After Score)

After selecting a score, the app reveals emotion labels.

### Behavior

- Emotion suggestions can vary depending on selected score range
- Users can select multiple emotions
- Entire list is customizable
- Users can add/remove/edit emotions

Example for low scores (1–3):

- Sad
- Angry
- Anxious
- Overwhelmed
- Tired

Example for high scores (5–7):

- Calm
- Energized
- Excited
- Content
- Grateful

No fixed psychological model is enforced.

---

## Step 3: Context Pills

User can optionally add contextual tags.

Three customizable categories:

### 1. Activities

Examples:

- Work
- Exercise
- Social
- Family
- Travel
- Creative

### 2. Environment

Examples:

- Home
- Office
- Outdoors
- Café
- Commute

### 3. Weather

Examples:

- Sunny
- Rainy
- Snowy
- Cold
- Windy

Each category:

- Multi-select
- Editable
- Fully customizable
- Presented as tappable "pills"

Users can create new categories in future versions.

---

## Step 4: Optional Note

- Free text field
- No character limit
- Markdown support (optional future enhancement)

---

# 6. User Stories

1. **Quick Check-In**  
   I can open the app and log a mood in under 30 seconds.

2. **Custom Vocabulary**  
   I can rename mood levels and emotion labels.

3. **Ownership**
   - I can export all my data as JSON or Markdown.
   - I can access raw files directly.

4. **Review Timeline**  
   I can scroll through past entries chronologically.

5. **See Patterns**  
   I can view mood score trends over time.

6. **No Account**  
   I never need to create a login.

---

# 7. Feature Specifications

## Home Screen (Check-In)

1. 1–7 scale
2. Emotion selection panel (revealed after score)
3. Context pills
4. Optional note
5. Save button

---

## Timeline View

- Reverse chronological
- Entry card shows:
  - Timestamp
  - Mood score
  - Emotion labels
  - Context pills
  - Truncated note

---

## Calendar View

- Month grid
- Each day shows:
  - Color-coded average score
  - Optional number overlay

---

## Trends View

- Line chart showing mood score (1–7)
- Range options:
  - 7 days
  - 30 days
  - All time
- Optional filtering by tag

---

## Settings

- Edit mood labels
- Edit emotion list
- Edit context categories
- Import data
- Export data
- Choose storage format

---

# 8. Data Ownership & Storage Model

## Default: Local-First Storage

Options:

- Browser local storage (MVP web version)
- File-based JSON vault (desktop)
- Future: user-managed folder (Obsidian-style)

No backend required for MVP.

---

## Data Model

```typescript
interface EmotionEntry {
  id: string; // crypto.randomUUID()
  timestamp: string; // ISO 8601
  score: number; // 1–7
  emotions: string[]; // customizable labels
  activities: string[]; // customizable
  environment: string[]; // customizable
  weather: string[]; // customizable
  note: string; // optional
}
```

All configuration (labels, categories) is also stored locally.

---

# 9. Explicitly Out of Scope (MVP)

- User accounts
- Cloud sync
- Social sharing
- AI insights
- Therapy recommendations
- Ads
- Emotional scoring algorithms

---

# 10. Success Metrics

| Metric             | Target       |
| ------------------ | ------------ |
| Check-in time      | < 30 seconds |
| Works offline      | Yes          |
| Installable as PWA | Yes          |
| Data exportable    | 100%         |
| No required login  | Yes          |

---

# 11. Positioning

Unlike typical mood tracking apps:

- No cloud dependency
- No subscription lock-in
- No fixed emotion model
- No emotional data monetization

This is **an emotional journaling tool, not a data platform**.
