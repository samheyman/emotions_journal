# Data Model

Type definitions live in `src/lib/types.ts` — that is the single source of truth.

## Storage

| Key | Contents |
|-----|----------|
| `emotions-log-entries` | `EmotionEntry[]` — check-in records |
| `emotions-log-events` | `LoggedEvent[]` — logged life events |
| `emotions-log-event-types` | `EventType[]` — default + user-created event types |
| `emotions-log-mood-colors` | `MoodColors` — user's chosen positive/neutral/negative colors |

## Notes

- `EmotionEntry.experiencedPeriod` defaults to `"allday"` when absent.
- `Emotion` type represents the 70-emotion vocabulary. Each emotion has pre-computed 384-dimensional embeddings generated from `"Feeling {emotion}"` using `Xenova/all-MiniLM-L6-v2`.
