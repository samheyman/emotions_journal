<script lang="ts">
  import { moodColors, MOOD_COLOR_DEFAULTS } from '../lib/stores/moodColors';

  let { onBack }: { onBack: () => void } = $props();
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
    <div class="color-row">
      <span class="color-label">Positive</span>
      <div class="color-swatch" style="background: {$moodColors.positive}">
        <input type="color" value={$moodColors.positive} oninput={(e) => moodColors.setPositive(e.currentTarget.value)} aria-label="Positive mood color" />
      </div>
    </div>

    <div class="color-row">
      <span class="color-label">Neutral</span>
      <div class="color-swatch" style="background: {$moodColors.neutral}">
        <input type="color" value={$moodColors.neutral} oninput={(e) => moodColors.setNeutral(e.currentTarget.value)} aria-label="Neutral mood color" />
      </div>
    </div>

    <div class="color-row">
      <span class="color-label">Negative</span>
      <div class="color-swatch" style="background: {$moodColors.negative}">
        <input type="color" value={$moodColors.negative} oninput={(e) => moodColors.setNegative(e.currentTarget.value)} aria-label="Negative mood color" />
      </div>
    </div>

    {#if $moodColors.positive !== MOOD_COLOR_DEFAULTS.positive || $moodColors.neutral !== MOOD_COLOR_DEFAULTS.neutral || $moodColors.negative !== MOOD_COLOR_DEFAULTS.negative}
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--border);
  }

  .color-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .color-swatch {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  .color-swatch input[type="color"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
    padding: 0;
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
