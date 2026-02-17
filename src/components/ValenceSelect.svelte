<script lang="ts">
  import { getMoodColor } from '../lib/data/emotions';

  let {
    valence = $bindable(0),
    onuserinput,
  }: {
    valence: number;
    onuserinput?: () => void;
  } = $props();

  const options = [-3, -2, -1, 0, 1, 2, 3];

  function select(value: number) {
    valence = value;
    onuserinput?.();
  }
</script>

<div class="radio-select">
  <div class="options">
    {#each options as value}
      <button
        class="option"
        class:selected={valence === value}
        style="--option-color: {getMoodColor(value)}"
        onclick={() => select(value)}
      >
        <span class="dot"></span>
      </button>
    {/each}
  </div>
  <div class="labels">
    <span class="label">Negative</span>
    <span class="label">Neutral</span>
    <span class="label">Positive</span>
  </div>
</div>

<style>
  .radio-select {
    width: 100%;
  }

  .options {
    display: flex;
    justify-content: space-between;
    gap: 4px;
  }

  .option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
    border: none;
    background: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: var(--bg-card);
    transition: all 0.15s ease;
  }

  .option:active .dot {
    transform: scale(0.9);
  }

  .option.selected .dot {
    background: var(--option-color);
    border-color: var(--option-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .labels {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-xs);
    padding: 0 2px;
  }

  .label {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
</style>
