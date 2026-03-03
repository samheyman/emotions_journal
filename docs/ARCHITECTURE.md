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
| Embeddings | @huggingface/transformers      | Runs ONNX models via WebAssembly in-browser, no server needed        |

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
+-- scripts/
|   +-- generate-embeddings.mjs  (Node.js script to regenerate emotion embeddings)
+-- src/
    +-- main.ts                  (app entry point, PWA service worker registration)
    +-- App.svelte               (root: view routing, bottom nav bar)
    +-- styles/
    |   +-- global.css           (design tokens: colors, spacing, typography, mood CSS vars)
    +-- lib/
    |   +-- types.ts             (all TypeScript interfaces: EmotionEntry, LoggedEvent, EventType, etc.)
    |   +-- data/
    |   |   +-- emotions.ts      (extractEmotions sync, extractEmotionsSemantic async, moodOptions, synonyms)
    |   |   +-- emotionsWithValenceAndEnergy.ts  (70 emotions with valence/energy coords + 384-dim embeddings)
    |   |   +-- eventTypes.ts    (default event type definitions)
    |   |   +-- icons.ts         (Lucide icon name mappings)
    |   |   +-- tags.ts          (predefined context tag list)
    |   +-- stores/
    |   |   +-- entries.ts       (EmotionEntry CRUD, localStorage-backed Svelte store)
    |   |   +-- events.ts        (LoggedEvent CRUD, localStorage-backed Svelte store)
    |   |   +-- eventTypes.ts    (EventType CRUD + visibility, localStorage-backed Svelte store)
    |   |   +-- moodColors.ts    (mood color customization, persists to localStorage, applies CSS vars)
    |   +-- services/
    |   |   +-- embeddingService.ts  (ONNX model loading, warmup, embedText, findSimilarEmotions)
    |   +-- utils/
    |       +-- dates.ts         (date parsing, formatting, dateKey, localDate helpers)
    |       +-- export.ts        (JSON export to file)
    |       +-- import.ts        (JSON import + validation)
    +-- components/              (reusable UI components)
    |   +-- Calendar.svelte      (monthly calendar grid with mood-colored day cells)
    |   +-- EnergySelect.svelte  (energy level selector, -3 to +3)
    |   +-- EntryCard.svelte     (displays a single emotion entry)
    |   +-- EventCard.svelte     (displays a single logged event)
    |   +-- EventIcon.svelte     (renders a Lucide icon or emoji by name)
    |   +-- MoodChart.svelte     (Chart.js mood trend line chart)
    |   +-- NoteInput.svelte     (textarea with char count)
    |   +-- TagPicker.svelte     (context tag multi-select)
    |   +-- Timeline.svelte      (day-level entry/event list with day navigation)
    |   +-- ValenceSelect.svelte (valence selector, -3 to +3)
    +-- views/                   (page-level components, one per screen)
        +-- HomeView.svelte           (monthly journal feed, grouped by day, FAB)
        +-- CheckInView.svelte        (4-step emotion check-in form)
        +-- AddEventView.svelte       (log a life event)
        +-- TrendsView.svelte         (mood chart + event frequency stats)
        +-- SettingsView.svelte       (settings hub, navigates to sub-pages)
        +-- SettingsDataView.svelte   (export / import JSON)
        +-- SettingsMoodColorsView.svelte  (customize positive/neutral/negative colors)
        +-- SettingsEventTypesView.svelte  (create and manage custom event types)
```

## Component Architecture

```
App.svelte  (root -- manages currentView state, renders bottom nav inline)
|
+-- Views (mutually exclusive, driven by currentView)
|   +-- HomeView.svelte          (default -- "Journal" tab)
|   |   +-- EntryCard.svelte
|   |   +-- EventCard.svelte
|   |       +-- EventIcon.svelte
|   |
|   +-- Calendar.svelte          ("Calendar" tab)
|   |   +-- EntryCard.svelte
|   |   +-- EventCard.svelte
|   |
|   +-- TrendsView.svelte        ("Trends" tab)
|   |   +-- MoodChart.svelte
|   |
|   +-- SettingsView.svelte      ("Settings" tab, internal page state: hub | data | moodColors | eventTypes)
|   |   +-- SettingsDataView.svelte
|   |   +-- SettingsMoodColorsView.svelte
|   |   +-- SettingsEventTypesView.svelte
|   |
|   +-- CheckInView.svelte       (full-screen form, no nav bar)
|   |   +-- ValenceSelect.svelte
|   |   +-- EnergySelect.svelte
|   |   +-- TagPicker.svelte
|   |   +-- EntryCard.svelte     (step 4 preview)
|   |
|   +-- AddEventView.svelte      (full-screen form, no nav bar)
|       +-- EventIcon.svelte
|
+-- Timeline.svelte              (used standalone in Calendar view for day detail)
    +-- EntryCard.svelte
    +-- EventCard.svelte
```

**Navigation note:** `CheckInView` and `AddEventView` hide the bottom nav bar while active. All other views show it. The browser back button is intercepted to return to `home` rather than exit the app.

**Settings note:** `SettingsView` manages its own internal `page` state (`'hub' | 'data' | 'moodColors' | 'eventTypes'`) rather than adding sub-routes to the top-level `View` type. Sub-pages are rendered in-place with a back button.

## Stores

Each store is a Svelte 4 `writable` with a custom interface. All stores auto-persist to localStorage on every update.

| Store | localStorage key | Interface |
|-------|-----------------|-----------|
| `entries` | `emotions-log-entries` | `add`, `remove`, `updateEntry`, `importEntries`, `clear` |
| `events` | `emotions-log-events` | `add`, `remove`, `updateEvent`, `importEvents`, `clear` |
| `eventTypes` | `emotions-log-event-types` | `addEventType`, `removeEventType`, `setVisibility`, `setEmoji` |
| `moodColors` | `emotions-log-mood-colors` | `setPositive`, `setNeutral`, `setNegative` |

**Important:** `moodColors` has a side effect on import -- it reads the persisted colors and sets `--mood-positive`, `--mood-neutral`, `--mood-negative` CSS variables on `document.documentElement`. This is why `App.svelte` imports it explicitly (`import './lib/stores/moodColors'`) even though no store value is used directly there. Do not remove that import.

## Mood Color System

Mood colors are applied via CSS classes on entry cards (`mood-0` through `mood-6`, where 0 = valence -3 and 6 = valence +3). The classes are defined in `tokens.css` and reference the three base CSS variables:

```css
--mood-negative  (valence -3, default #fd7369)
--mood-neutral   (valence  0, default #ffffff)
--mood-positive  (valence +3, default #4caf50)
```

Intermediate steps use `color-mix(in oklch, var(--mood-X) N%, white)` to produce tints. The `moodColors` store overrides the base variables at runtime when the user changes their color preferences in Settings.

## Embedding / Semantic Matching Architecture

### Model

- **Model:** `Xenova/all-MiniLM-L6-v2` (sentence-transformers, ONNX format)
- **Precision:** q8 (int8 quantized) for both pre-computed emotion embeddings and runtime inference
- **Dimensions:** 384, normalized
- **Runtime:** `@huggingface/transformers` executes the ONNX model via WebAssembly in-browser
- **Size:** ~6-12MB on first download, cached in IndexedDB thereafter

### Pre-computed Embeddings

Each of the 70 emotions has a pre-computed embedding stored in `src/lib/data/emotionsWithValenceAndEnergy.ts`. These were generated using the `scripts/generate-embeddings.mjs` Node.js script with the input format `"Feeling {emotion}"` (e.g. `"Feeling angry"`).

To regenerate embeddings (e.g. after adding new emotions), run:

```bash
node scripts/generate-embeddings.mjs
```

### Hybrid Suggestion Pipeline

```
User types text + selects valence/energy
           |
           v
  +------------------+     +---------------------+     +----------------------+
  | Tier 1: Keyword  |     | Tier 2: Proximity   |     | Tier 3: Semantic     |
  | (sync, instant)  |     | (sync, instant)     |     | (async, after load)  |
  +------------------+     +---------------------+     +----------------------+
  | Regex match on   |     | Euclidean distance  |     | Cosine similarity    |
  | emotion names +  |     | from user's (v, e)  |     | between user text    |
  | ~160 synonyms    |     | to emotion coords   |     | embedding and pre-   |
  +------------------+     +---------------------+     | computed emotion     |
           |                        |                   | embeddings (384-dim) |
           v                        v                   +----------------------+
      keyword matches         proximity matches                  |
           |                        |                            v
           +------------------------+------- semantic matches ---+
                                    |
                                    v
                        Merged results (up to 7)
                   keyword matches first (trusted),
                   then semantic, then proximity fill
```

### Key Service: `embeddingService.ts`

- `warmup()` -- begins lazy-loading the quantized model in background when check-in view opens
- `embedText(text)` -- computes a 384-dim embedding for arbitrary text
- `findSimilarEmotions(text, topK)` -- returns the top-K emotions by cosine similarity to the input text
- `cosineSimilarity(a, b)` -- dot product of two normalized vectors
- `isReady()` -- returns true if the model is loaded and semantic matching is available
- `onReady(cb)` -- registers a callback to run when the model finishes loading

### Key Data Module: `lib/data/emotions.ts`

- `extractEmotions(text, valence, energy)` -- synchronous keyword + proximity matching (Tier 1 + 2)
- `extractEmotionsSemantic(text, valence, energy)` -- async wrapper that includes semantic matching (Tier 3) when the model is ready
- `getMoodColor(value)` -- returns the HSL color for a valence value -3..+3 (used by ValenceSelect, EnergySelect)
- `getMoodOption(value)` -- returns the full `MoodOption` object for a valence value

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
