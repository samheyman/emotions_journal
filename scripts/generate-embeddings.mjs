import { pipeline } from "@huggingface/transformers";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const emotionsFile = resolve(
  __dirname,
  "../src/lib/data/emotionsWithValenceAndEnergy.ts"
);

// Parse emotion names from the TS file
const src = readFileSync(emotionsFile, "utf-8");
const nameRegex = /name:\s*"([^"]+)"/g;
const names = [];
let match;
while ((match = nameRegex.exec(src)) !== null) {
  names.push(match[1]);
}

console.log(`Found ${names.length} emotions. Loading model...`);

const extractor = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2",
  { dtype: "q8" }
);

console.log("Model loaded. Generating embeddings...");

const embeddings = new Map();
for (const name of names) {
  const result = await extractor(`Feeling ${name.toLowerCase()}`, {
    pooling: "mean",
    normalize: true,
  });
  // Round to 6 decimal places to keep file size manageable
  const vec = Array.from(result.data).map((v) => Math.round(v * 1e6) / 1e6);
  embeddings.set(name, vec);
  console.log(`  ${name}: done (${vec.length} dims)`);
}

// Rebuild the TS file
let output = `import { Emotion } from "../types";\n\nexport const EMOTIONS: Emotion[] = [\n`;

for (const name of names) {
  // Extract the original line's properties
  const lineRegex = new RegExp(
    `\\{\\s*name:\\s*"${name}"\\s*,\\s*valence:\\s*(-?\\d+)\\s*,\\s*energy:\\s*(-?\\d+)\\s*,\\s*type:\\s*"(\\w+)"`
  );
  const m = src.match(lineRegex);
  if (!m) {
    console.error(`Could not parse line for ${name}`);
    continue;
  }
  const [, valence, energy, type] = m;
  const vec = embeddings.get(name);
  output += `  { name: "${name}", valence: ${valence}, energy: ${energy}, type: "${type}", embedding: [${vec.join(",")}] },\n`;
}

output += `];\n`;

writeFileSync(emotionsFile, output, "utf-8");
console.log(`\nWrote embeddings to ${emotionsFile}`);
