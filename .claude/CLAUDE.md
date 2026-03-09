# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview production build locally

node scripts/generate-embeddings.mjs  # regenerate emotion embeddings after adding new emotions
```

No test framework is set up. Verify changes with `npm run build` — TypeScript errors surface here.

## Architecture

Full docs live in `docs/ARCHITECTURE.md` and `docs/DESIGN_SYSTEM.md`. Key things to know upfront:

### Routing
There is no router library. `App.svelte` holds a `currentView: View` state variable and renders views with `{#if}` blocks. All valid views are in `src/lib/types.ts` as the `View` union type. `CheckInView` and `AddEventView` hide the bottom nav bar while active.

### Mixed Svelte 4 / Svelte 5
The codebase mixes **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$effect`) in components with **Svelte 4 writable stores** (`src/lib/stores/`). The stores use the Svelte 4 pattern and are accessed with the `$` prefix in templates. Do not convert stores to runes — they handle localStorage persistence via their `subscribe` side effect.

### Stores and persistence
All four stores auto-save to localStorage on every update via an unmanaged `subscribe` call inside the store factory. The pattern is:
```ts
subscribe((value) => { localStorage.setItem(KEY, JSON.stringify(value)); });
```
This works because the store is module-level and lives for the app's lifetime.

**Important:** `App.svelte` imports `'./lib/stores/moodColors'` as a side-effect-only import. This triggers the store to load persisted colors and apply them as CSS variables on `document.documentElement`. Do not remove this import even though nothing is destructured from it.

### CSS design tokens
All global styles and CSS variables are in `src/styles/global.css`. Components use scoped `<style>` blocks and reference tokens via `var(--token-name)`. The mood color system uses `color-mix(in oklch, ...)` to generate tints from three user-configurable base variables (`--mood-positive`, `--mood-neutral`, `--mood-negative`). Components apply mood colors via CSS classes: `class="mood-{entry.valence + 3}"` (maps valence -3..+3 to classes mood-0..mood-6).

### Emotion extraction pipeline
`src/lib/data/emotions.ts` implements a three-tier hybrid pipeline:
1. **Keyword** (sync): regex + ~160 synonym mappings
2. **Proximity** (sync): Euclidean distance from user's valence/energy to the 70-emotion vocabulary
3. **Semantic** (async): cosine similarity via `Xenova/all-MiniLM-L6-v2` ONNX model loaded by `embeddingService.ts`

Tiers 1+2 run instantly; tier 3 runs in a `$effect` when the model finishes loading. The model is ~6–12MB, cached in IndexedDB after first download. **Emotion suggestions are disabled when editing an existing entry** — only manual edits are allowed in edit mode.

### Settings sub-pages
`SettingsView.svelte` manages its own internal `page` state (`'hub' | 'data' | 'moodColors' | 'eventTypes'`) rather than adding to the top-level `View` type. Sub-pages are rendered in-place with their own back button.

## localStorage keys
| Key | Contents |
|-----|----------|
| `emotions-log-entries` | `EmotionEntry[]` |
| `emotions-log-events` | `LoggedEvent[]` |
| `emotions-log-event-types` | `EventType[]` |
| `emotions-log-mood-colors` | `{ positive, neutral, negative }` hex strings |
