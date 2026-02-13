# Masterplan

## Vision

A mobile-first emotion journaling app that uses the **circumplex model of affect** (valence x energy) to let users capture how they feel quickly and with more nuance than typical mood trackers. The core interaction is a 2D "Mood Pad" where a single tap or drag plots your emotional state on two axes: pleasant/unpleasant and high/low energy.

## Strategy

### Phase 1 -- Web Prototype (current)

Build a fully functional browser-based PWA to validate the UX before investing in native development.

- **Storage:** localStorage (no backend)
- **Installable:** PWA with manifest + service worker
- **Goal:** Prove the core check-in flow works in under 30 seconds and feels good on mobile

### Phase 2 -- Native App + Backend

Once the UX is validated, port to a native framework (Flutter or Swift) and add server-side features.

- Cloud sync and user accounts
- Push notification reminders
- Cross-device data sync
- AI-powered insights and pattern detection
- Social/sharing features

## Target Audience

People who want to understand their emotional patterns over time -- not just "good day / bad day" but the texture of how they feel. This includes:

- People managing anxiety, stress, or mood disorders
- Therapy clients who want to bring data to sessions
- Anyone curious about self-awareness and emotional literacy

## Core Innovation

Most mood trackers use a 1D scale (1-5 stars, happy to sad). This misses a huge dimension: **energy**. You can feel pleasant but drained (calm, serene) or pleasant and energized (excited, joyful). The 2D Mood Pad captures both axes in a single gesture, making check-ins fast and expressive.

## Principles

- **Speed over completeness.** A check-in should take under 30 seconds.
- **Show, don't tell.** Use color, position, and visual patterns instead of long forms.
- **Your data, your device.** Phase 1 keeps everything in localStorage. No accounts, no tracking.
- **Progressive depth.** Quick check-in is the default. Notes, tags, and labels are optional layers.
