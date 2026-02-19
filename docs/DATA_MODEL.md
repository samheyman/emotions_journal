# Data Model

```typescript
interface EmotionEntry {
  id: string; // crypto.randomUUID()
  timestamp: string; // ISO 8601
  valence: number; // -3 to +3
  energy: number; // -3 to +3
  emotions: string[]; // selected emotion labels
  tags: string[]; // context tags
  note: string; // free text
  timeOfDay?: TimeOfDay;
}

type Emotion = {
  name: string;
  valence: number; // -3 to +3
  energy: number; // -3 to +3
  type: "primary" | "secondary";
  embedding: number[]; // 384-dim all-MiniLM-L6-v2 q8
};
```

Storage key: `"emotion-entries"`. Serialized as a JSON array in localStorage.

The `Emotion` type represents the 70-emotion vocabulary. Each emotion has pre-computed q8 embeddings (384 dimensions) generated from the sentence `"Feeling {emotion}"` using `Xenova/all-MiniLM-L6-v2`.
