# Technical Design

## Tech Stack

| Layer      | Choice                         | Rationale                                                            |
| ---------- | ------------------------------ | -------------------------------------------------------------------- |
| Framework  | Svelte 5                       | Lightweight, fast, great DX with runes                               |
| Build tool | Vite                           | Fast HMR, native TS support                                          |
| Language   | TypeScript                     | Type safety for data model and stores                                |
| Styling    | Scoped CSS + design tokens     | No external CSS framework needed                                     |
| Storage    | localStorage                   | Zero-config, works offline, good for MVP                             |
| Charts     | Chart.js                       | Well-maintained, canvas-based, small enough                          |
| Routing    | Simple component-based         | No router library -- a reactive `currentView` variable toggles views |
| PWA        | manifest.json + service worker | Installable, offline-capable                                         |

## Data Model

```typescript
interface EmotionEntry {
  id: string; // crypto.randomUUID()
  timestamp: string; // ISO 8601
  valence: number; // -5 to +5
  energy: number; // -5 to +5
  emotions: string[]; // 1-3 labels
  tags: string[]; // context tags
  note: string; // optional free text
}
```

Storage key: `"emotion-entries"`. Serialized as a JSON array in localStorage.

## Component Architecture

```
App.svelte (root -- manages current view, renders NavBar)
|
+-- NavBar.svelte
|
+-- Views
|   +-- HomeView.svelte
|   |   +-- Timeline.svelte
|   |   |   +-- EntryCard.svelte
|   |   +-- Calendar.svelte
|   |
|   +-- CheckInView.svelte
|   |   +-- MoodPad.svelte
|   |   +-- EmotionPicker.svelte
|   |   +-- TagPicker.svelte
|   |   +-- NoteInput.svelte
|   |
|   +-- TrendsView.svelte
|       +-- MoodChart.svelte
```

## File Structure

```
emotions-log/
+-- index.html
+-- vite.config.ts
+-- tsconfig.json
+-- package.json
+-- public/
|   +-- manifest.json
|   +-- sw.js
|   +-- icons/
|       +-- icon-192.png
|       +-- icon-512.png
+-- src/
    +-- main.ts
    +-- app.css                  (design tokens + global resets)
    +-- App.svelte
    +-- lib/
    |   +-- types.ts             (EmotionEntry interface)
    |   +-- store.ts             (localStorage CRUD + reactive state)
    |   +-- emotions.ts          (emotion labels by quadrant)
    |   +-- tags.ts              (predefined tag list)
    |   +-- export.ts            (JSON export utility)
    +-- components/
    |   +-- NavBar.svelte
    |   +-- MoodPad.svelte
    |   +-- EmotionPicker.svelte
    |   +-- TagPicker.svelte
    |   +-- NoteInput.svelte
    |   +-- EntryCard.svelte
    |   +-- Timeline.svelte
    |   +-- Calendar.svelte
    |   +-- MoodChart.svelte
    +-- views/
        +-- HomeView.svelte
        +-- CheckInView.svelte
        +-- TrendsView.svelte
```

## UI/UX Specs

### MoodPad Interaction

- Renders as a square `<div>` with `touch-action: none`
- Listens to `pointerdown` and `pointermove` events
- Converts pointer position to valence (x: -5 to +5) and energy (y: -5 to +5, inverted so top = high energy)
- Background uses a CSS gradient that shifts based on the selected quadrant:
  - Top-right (high energy, pleasant): warm yellow/orange
  - Top-left (high energy, unpleasant): red/pink
  - Bottom-right (low energy, pleasant): green/teal
  - Bottom-left (low energy, unpleasant): blue/grey
- A dot/crosshair follows the pointer to show the current selection
- Axis labels at the edges: "Pleasant" / "Unpleasant" / "High Energy" / "Low Energy"

### Check-in Flow

Four steps, navigated with Next/Back buttons:

1. **MoodPad** -- tap or drag to set valence + energy
2. **Emotion labels** -- pick 1-3 words (filtered by quadrant)
3. **Tags** -- pick 0+ context tags
4. **Note** -- optional free text, then Save

Each step is a section within `CheckInView.svelte`. The view manages a `step` variable (0-3) and renders the appropriate component.

### Color System

Warm neutral palette with terracotta and sage accents. See design tokens below.

## Design Tokens

```css
:root {
  /* Warm neutrals */
  --color-bg: #faf7f2;
  --color-surface: #ffffff;
  --color-surface-alt: #f0ece3;
  --color-border: #e0d9cc;
  --color-text: #2c2825;
  --color-text-muted: #8a8078;

  /* Accent colors */
  --color-terracotta: #c17256;
  --color-sage: #7a9e7e;
  --color-gold: #d4a853;
  --color-sky: #6ba3be;

  /* Quadrant colors (mood pad + entry dots) */
  --color-q-hp-he: #e8a838; /* high energy, pleasant -- amber */
  --color-q-hp-le: #7ab87e; /* low energy, pleasant -- sage green */
  --color-q-up-he: #d46a6a; /* high energy, unpleasant -- coral red */
  --color-q-up-le: #7191a6; /* low energy, unpleasant -- steel blue */

  /* Typography */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Borders */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(44, 40, 37, 0.06);
  --shadow-md: 0 2px 8px rgba(44, 40, 37, 0.1);
}
```

## PWA Setup

### manifest.json

```json
{
  "name": "Lumidian",
  "short_name": "Lumidian",
  "start_url": "/",
  "display": "fullscreen",
  "background_color": "#FAF7F2",
  "theme_color": "#C17256",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker (sw.js)

Cache-first strategy for app shell assets. Network-first for nothing (no API calls in MVP). On install, precache `index.html`, CSS, JS bundles, and icons.
