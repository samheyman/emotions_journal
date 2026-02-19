# UX Rules

- All destructive actions require confirmation modal
- Time should be in 24h format

## UI/UX Specs

### Check-in Flow

Four steps, navigated with Next/Back buttons:

1. **Free text + Valence + Energy** -- write how you feel, select valence (-3 to +3) and energy (-3 to +3) via discrete selectors
2. **Emotions** -- view AI-suggested emotions split into Primary and Secondary groups; remove suggestions or manually add via autocomplete (up to 7 total)
3. **Triggers / Context** -- pick 0+ context tags
4. **Preview** -- see full entry card, then Save

Each step is a section within `CheckInView.svelte`. The view manages a `step` variable (0-3) and renders the appropriate component.
