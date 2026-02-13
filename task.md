# Task Breakdown

## Step 0: Documentation
**Status: done**

Create masterplan.md, PRD.md, DESIGN.md, task.md, PROGRESS.md.

## Step 1: Project Scaffolding
**Status: pending**

- [ ] Initialize Svelte 5 + Vite + TypeScript project
- [ ] Set up `app.css` with design tokens and global resets
- [ ] Create `public/manifest.json`
- [ ] Create placeholder `public/sw.js`
- [ ] Create `App.svelte` with view switching logic and NavBar
- [ ] Create `NavBar.svelte` with Home / Check-in / Trends tabs
- [ ] Verify dev server runs and app renders

## Step 2: Data Layer
**Status: pending**

- [ ] Define `EmotionEntry` interface in `src/lib/types.ts`
- [ ] Build `src/lib/store.ts` -- localStorage CRUD (load, save, add, delete) with Svelte 5 reactive state
- [ ] Create `src/lib/emotions.ts` -- emotion labels organized by quadrant
- [ ] Create `src/lib/tags.ts` -- predefined context tag list
- [ ] Create `src/lib/export.ts` -- JSON export utility (triggers file download)

## Step 3: MoodPad Component
**Status: pending**

- [ ] Build `MoodPad.svelte` with pointer event handling
- [ ] Implement coordinate-to-valence/energy mapping
- [ ] Add quadrant-based gradient background
- [ ] Add selection dot/crosshair
- [ ] Add axis labels
- [ ] Test on both mouse and touch

## Step 4: Check-in Flow
**Status: pending**

- [ ] Build `CheckInView.svelte` with step navigation (0-3)
- [ ] Build `EmotionPicker.svelte` -- quadrant-filtered label selection (1-3)
- [ ] Build `TagPicker.svelte` -- multi-select tag chips
- [ ] Build `NoteInput.svelte` -- optional textarea
- [ ] Wire Save button to store
- [ ] Navigate back to Home after save

## Step 5: Home View -- Timeline
**Status: pending**

- [ ] Build `HomeView.svelte` with toggle between Timeline and Calendar
- [ ] Build `EntryCard.svelte` -- displays one entry with mood dot, labels, tags, note preview
- [ ] Build `Timeline.svelte` -- reverse-chronological scrollable list
- [ ] Handle empty state (no entries yet)

## Step 6: Home View -- Calendar
**Status: pending**

- [ ] Build `Calendar.svelte` -- month grid
- [ ] Color-code days by average valence/energy
- [ ] Support month navigation (prev/next)
- [ ] Tap day to filter timeline to that day

## Step 7: Trends View
**Status: pending**

- [ ] Build `TrendsView.svelte` with time range selector (7d / 30d / all)
- [ ] Build `MoodChart.svelte` -- Chart.js line chart for valence + energy over time
- [ ] Add JSON export button
- [ ] Handle empty/insufficient data state

## Step 8: Polish and PWA
**Status: pending**

- [ ] Finalize service worker with cache-first strategy
- [ ] Generate app icons (192px, 512px)
- [ ] Test PWA install flow on mobile
- [ ] Add transitions between views and check-in steps
- [ ] Responsive layout tweaks
- [ ] Accessibility pass (focus management, ARIA labels, contrast)
- [ ] Manual end-to-end testing
