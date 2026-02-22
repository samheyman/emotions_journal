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

## Step 1: Free Text + Valence/Energy

The first screen captures three things at once:

- **Free-text note** -- open text field for the user to describe how they feel in their own words
- **Valence select** -- a -3 to +3 scale (unpleasant to pleasant)
- **Energy select** -- a -3 to +3 scale (low energy to high energy)

The two-axis model (valence + energy) captures emotional state as a position in affect space rather than collapsing it to a single score. This is grounded in the circumplex model of affect.

### Why -3 to +3?

- Zero-centered: neutral is the default, not a midpoint on a positive-only scale
- 7 discrete levels per axis (enough granularity, not overwhelming)
- Compact integer range that maps cleanly to visual selectors

---

## Step 2: Emotion Selection

After setting valence/energy, the app presents emotion labels. Emotions are organized into two groups:

- **Primary emotions** -- fundamental, biologically rooted (e.g. Angry, Sad, Joyful)
- **Secondary emotions** -- layered/cognitive (e.g. Frustrated, Jealous, Ashamed)

### Emotion Inference

The app uses a **hybrid three-tier system** to suggest relevant emotions (see Section 5b):

1. Keyword matching against the user's free text (instant)
2. Proximity fill based on the user's valence/energy position (instant)
3. Semantic matching via text embeddings (async, after model loads)

### Behavior

- Up to 7 emotions are suggested automatically
- Users can remove suggested emotions
- Users can manually add any emotion via autocomplete
- The full emotion vocabulary is 70 emotions, each with valence/energy coordinates and a type (primary/secondary)

---

## Step 3: Triggers / Context

User can optionally add contextual tags presented as tappable pills.

- Multi-select
- Editable
- Fully customizable

---

## Step 4: Preview + Save

A preview step shows the full entry card before saving:

- Valence and energy values
- Selected emotions
- Context tags
- Free-text note

The user confirms and saves, or navigates back to edit.

---

# 5b. Emotion Inference System

The app uses a **hybrid three-tier architecture** to suggest emotions from the user's free-text input and valence/energy position. All processing happens on-device -- no data leaves the browser.

## Tier 1: Keyword Matching (instant, synchronous)

- Direct regex matches against the 70 emotion names
- A synonym/phrase lookup table (~160 entries) maps common expressions to emotions (e.g. "pissed off" -> Angry, "on edge" -> Anxious)
- This tier runs immediately on every text change with zero latency

## Tier 2: Proximity Fill (instant, synchronous)

- Computes Euclidean distance from the user's selected (valence, energy) position to each emotion's coordinates
- Fills remaining suggestion slots with the nearest emotions in affect space
- Provides meaningful suggestions even when the user writes very little or nothing

## Tier 3: Semantic Matching (async, after model loads)

- Uses `Xenova/all-MiniLM-L6-v2` (sentence-transformers) with q8 (int8 quantized) precision
- Computes a 384-dimensional embedding of the user's text at runtime
- Compares via cosine similarity against pre-computed embeddings for all 70 emotions
- Pre-computed embeddings were generated using the input format `"Feeling {emotion}"`

### Model Loading

- On check-in view open, `warmup()` begins lazy-loading the quantized ONNX model in the background (~6-12MB)
- Model runs via WebAssembly through the `@huggingface/transformers` library
- After first download, the model is cached in browser IndexedDB (subsequent loads are near-instant)
- A reactive `embeddingReady` state indicates when semantic matching is available

### Result Merging

- Keyword matches are ranked first (highest trust -- the user explicitly mentioned the emotion)
- Semantic matches fill remaining slots
- Total suggestions capped at 7

## Privacy Guarantees

- The ONNX model runs locally via WebAssembly -- no server calls
- No API calls for embedding computation
- Model cached in browser IndexedDB after first download
- Zero data transmission for emotion inference

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

1. Free text + Valence select + Energy select
2. Emotion picker (primary/secondary groups, with AI-powered suggestions)
3. Triggers / Context tag picker
4. Preview entry card + Save

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

See `src/lib/types.ts` for all type definitions. See `docs/DATA_MODEL.md` for storage details.

---

# 9. Explicitly Out of Scope (MVP)

- User accounts
- Cloud sync
- Social sharing
- Cloud-based AI / LLM calls (emotion inference runs entirely on-device)
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
