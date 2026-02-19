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
