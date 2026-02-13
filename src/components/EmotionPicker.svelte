<script lang="ts">
  import { getEmotionsForPosition } from '../lib/data/emotions';

  let {
    valence,
    energy,
    selected = $bindable([]),
  }: {
    valence: number;
    energy: number;
    selected: string[];
  } = $props();

  let availableEmotions = $derived(getEmotionsForPosition(valence, energy));

  function toggle(emotion: string) {
    if (selected.includes(emotion)) {
      selected = selected.filter((e) => e !== emotion);
    } else if (selected.length < 3) {
      selected = [...selected, emotion];
    }
  }
</script>

<div class="emotion-picker">
  <p class="hint">
    Pick 1–3 emotions that fit
    {#if selected.length > 0}
      <span class="count">({selected.length}/3)</span>
    {/if}
  </p>

  <div class="chips">
    {#each availableEmotions as emotion}
      <button
        class="chip"
        class:selected={selected.includes(emotion)}
        class:disabled={selected.length >= 3 && !selected.includes(emotion)}
        onclick={() => toggle(emotion)}
      >
        {emotion}
      </button>
    {/each}
  </div>
</div>

<style>
  .emotion-picker {
    width: 100%;
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
  }

  .count {
    color: var(--accent);
    font-weight: 500;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .chip {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .chip:active {
    transform: scale(0.95);
  }

  .chip.selected {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .chip.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
</style>
