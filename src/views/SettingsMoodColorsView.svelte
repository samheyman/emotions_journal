<script lang="ts">
  import { moodColors, MOOD_COLOR_DEFAULTS } from '../lib/stores/moodColors';

  let { onBack }: { onBack: () => void } = $props();

  // Extract the hue (0–359) from a #rrggbb hex color.
  // Returns 0 for achromatic colors (white, grey, black).
  function hexToHue(hex: string): number {
    if (!hex.startsWith('#') || hex.length !== 7) return 0;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === min) return 0;
    const d = max - min;
    let h: number;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return Math.round(h * 360) % 360;
  }

  function hslChannel(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  // Convert a hue (0–359) to a #rrggbb hex color at full saturation and lightness=50%.
  function hueToHex(hue: number): string {
    const h = hue / 360;
    const r = Math.round(hslChannel(0, 1, h + 1 / 3) * 255);
    const g = Math.round(hslChannel(0, 1, h) * 255);
    const b = Math.round(hslChannel(0, 1, h - 1 / 3) * 255);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  let isCustomised = $derived(
    $moodColors.positive !== MOOD_COLOR_DEFAULTS.positive ||
    $moodColors.neutral !== MOOD_COLOR_DEFAULTS.neutral ||
    $moodColors.negative !== MOOD_COLOR_DEFAULTS.negative
  );
</script>

<div class="sub-page">
  <header class="sub-header">
    <button class="back-btn" onclick={onBack} aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <h1 class="title">Mood colors</h1>
  </header>

  <div class="content">
    {#each [
      { label: 'Positive', color: $moodColors.positive, set: (c: string) => moodColors.setPositive(c) },
      { label: 'Neutral',  color: $moodColors.neutral,  set: (c: string) => moodColors.setNeutral(c) },
      { label: 'Negative', color: $moodColors.negative, set: (c: string) => moodColors.setNegative(c) },
    ] as row}
      <div class="color-row">
        <div class="color-row-header">
          <span class="color-label">{row.label}</span>
          <div class="color-swatch" style="background: {row.color}"></div>
        </div>
        <input
          type="range"
          class="hue-slider"
          min="0"
          max="359"
          value={hexToHue(row.color)}
          oninput={(e) => row.set(hueToHex(Number(e.currentTarget.value)))}
          aria-label="{row.label} mood color hue"
        />
      </div>
    {/each}

    {#if isCustomised}
      <button class="reset-btn" onclick={() => moodColors.reset()}>Reset to defaults</button>
    {/if}
  </div>
</div>

<style>
  .sub-page {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .sub-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-md);
    padding-top: calc(var(--space-lg) + env(safe-area-inset-top));
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    margin-left: -4px;
  }

  .back-btn:active { background: var(--bg-subtle); }

  .title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .content {
    padding: 0 var(--space-md);
  }

  .color-row {
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .color-row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .color-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .color-swatch {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    flex-shrink: 0;
  }

  .hue-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 20px;
    border-radius: var(--radius-full);
    background: linear-gradient(to right,
      hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%),
      hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%),
      hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%),
      hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%),
      hsl(360,100%,50%));
    cursor: pointer;
    border: none;
    outline: none;
  }

  .hue-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: white;
    border: 2px solid rgba(0, 0, 0, 0.15);
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }

  .hue-slider::-moz-range-thumb {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: white;
    border: 2px solid rgba(0, 0, 0, 0.15);
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    border: none;
  }

  .reset-btn {
    margin-top: var(--space-md);
    background: none;
    border: none;
    font-family: var(--font);
    font-size: 0.75rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--space-xs) 0;
    -webkit-tap-highlight-color: transparent;
  }
</style>
