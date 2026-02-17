import { EMOTIONS } from "../data/emotionsWithValenceAndEnergy";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelineInstance: any = null;
let loading = false;
let _ready = false;
const readyCallbacks: Array<() => void> = [];

export function isReady(): boolean {
  return _ready;
}

export function onReady(cb: () => void): void {
  if (_ready) {
    cb();
  } else {
    readyCallbacks.push(cb);
  }
}

async function loadPipeline() {
  if (pipelineInstance) return pipelineInstance;
  if (loading) {
    return new Promise((resolve) => {
      onReady(() => resolve(pipelineInstance));
    });
  }

  loading = true;
  const { pipeline } = await import("@huggingface/transformers");
  pipelineInstance = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    { dtype: "q8" } as any
  );

  _ready = true;
  loading = false;
  for (const cb of readyCallbacks) cb();
  readyCallbacks.length = 0;

  return pipelineInstance;
}

/** Start loading the model in the background */
export function warmup(): void {
  loadPipeline().catch((err) =>
    console.warn("Embedding model failed to load:", err)
  );
}

/** Embed a text string, returns a normalized 384-dim vector */
export async function embedText(text: string): Promise<number[]> {
  const extractor = await loadPipeline();
  const result = await extractor(text, {
    pooling: "mean",
    normalize: true,
  } as any);
  return Array.from((result as any).data as Float32Array);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  // Both vectors are already normalized, so dot product = cosine similarity
  return dot;
}

/**
 * Find the closest emotions to the given text using cosine similarity.
 * Returns emotion names sorted by similarity (highest first).
 */
export async function findSimilarEmotions(
  text: string,
  maxResults: number = 5,
  threshold: number = 0.25
): Promise<string[]> {
  const queryEmbedding = await embedText(text);

  const scored = EMOTIONS.map((e) => ({
    name: e.name,
    score: cosineSimilarity(queryEmbedding, e.embedding),
  }))
    .filter((e) => e.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored.map((e) => e.name);
}
