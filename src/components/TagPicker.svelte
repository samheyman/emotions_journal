<script lang="ts">
  import { contextTags } from '../lib/data/tags';

  let {
    selected = $bindable([]),
  }: {
    selected: string[];
  } = $props();

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      selected = selected.filter((t) => t !== tag);
    } else {
      selected = [...selected, tag];
    }
  }
</script>

<div class="tag-picker">
  <p class="hint">What's the context? <span class="optional">(optional)</span></p>

  <div class="chips">
    {#each contextTags as tag}
      <button
        class="chip"
        class:selected={selected.includes(tag)}
        onclick={() => toggle(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
</div>

<style>
  .tag-picker {
    width: 100%;
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
  }

  .optional {
    color: var(--text-muted);
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
    background: var(--accent-alt);
    color: white;
    border-color: var(--accent-alt);
  }
</style>
