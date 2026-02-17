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

## Data Model

```typescript
interface EmotionEntry {
  id: string;          // crypto.randomUUID()
  timestamp: string;   // ISO 8601
  valence: number;     // -3 to +3
  energy: number;      // -3 to +3
  emotions: string[];  // selected emotion labels
  tags: string[];      // context tags
  note: string;        // free text
  timeOfDay?: TimeOfDay;
}

type Emotion = {
  name: string;
  valence: number;     // -3 to +3
  energy: number;      // -3 to +3
  type: "primary" | "secondary";
  embedding: number[]; // 384-dim all-MiniLM-L6-v2 q8
};
```

Storage key: `"emotion-entries"`. Serialized as a JSON array in localStorage.

The `Emotion` type represents the 70-emotion vocabulary. Each emotion has pre-computed q8 embeddings (384 dimensions) generated from the sentence `"Feeling {emotion}"` using `Xenova/all-MiniLM-L6-v2`.

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
|   |   +-- Step 1: NoteInput + ValenceSelect + EnergySelect
|   |   +-- Step 2: EmotionPicker (primary/secondary groups)
|   |   +-- Step 3: TagPicker
|   |   +-- Step 4: EntryCard (preview) + Save
|   |
|   +-- TrendsView.svelte
|       +-- MoodChart.svelte
|
+-- Services
    +-- embeddingService.ts (model loading, warmup, embedText, findSimilarEmotions)
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
+-- scripts/
|   +-- generate-embeddings.mjs  (Node.js script to regenerate emotion embeddings)
+-- src/
    +-- main.ts
    +-- app.css                  (design tokens + global resets)
    +-- App.svelte
    +-- lib/
    |   +-- types.ts             (EmotionEntry, Emotion interfaces)
    |   +-- store.ts             (localStorage CRUD + reactive state)
    |   +-- data/
    |   |   +-- emotionsWithValenceAndEnergy.ts  (70 emotions with pre-computed q8 embeddings)
    |   +-- emotions.ts          (extractEmotions sync keyword+proximity, extractEmotionsSemantic async)
    |   +-- tags.ts              (predefined tag list)
    |   +-- export.ts            (JSON export utility)
    |   +-- services/
    |       +-- embeddingService.ts  (model loading, warmup, embedText, findSimilarEmotions, cosineSimilarity)
    +-- components/
    |   +-- NavBar.svelte
    |   +-- ValenceSelect.svelte
    |   +-- EnergySelect.svelte
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

### Check-in Flow

Four steps, navigated with Next/Back buttons:

1. **Free text + Valence + Energy** -- write how you feel, select valence (-3 to +3) and energy (-3 to +3) via discrete selectors
2. **Emotions** -- view AI-suggested emotions split into Primary and Secondary groups; remove suggestions or manually add via autocomplete (up to 7 total)
3. **Triggers / Context** -- pick 0+ context tags
4. **Preview** -- see full entry card, then Save

Each step is a section within `CheckInView.svelte`. The view manages a `step` variable (0-3) and renders the appropriate component.

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
- `findSimilarEmotions(text, emotions, topK)` -- returns the top-K emotions by cosine similarity to the input text
- `cosineSimilarity(a, b)` -- dot product of two normalized vectors
- `embeddingReady` -- reactive state that indicates when the model is loaded and semantic matching is available

### Key Data Module: `emotions.ts`

- `extractEmotions(text, valence, energy)` -- synchronous keyword + proximity matching (Tier 1 + 2)
- `extractEmotionsSemantic(text, valence, energy)` -- async wrapper that includes semantic matching (Tier 3) when the model is ready

### Privacy

All inference runs on-device via WebAssembly. No data is transmitted to any server. The model is downloaded once and cached locally in the browser's IndexedDB.

## Color System

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
