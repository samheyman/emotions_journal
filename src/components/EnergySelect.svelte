<script lang="ts">
  import { getMoodColor } from '../lib/data/emotions';

  let {
    energy = $bindable(0),
    onuserinput,
  }: {
    energy: number;
    onuserinput?: () => void;
  } = $props();

  const options = [-3, -2, -1, 0, 1, 2, 3];

  function select(value: number) {
    energy = value;
    onuserinput?.();
  }
</script>

<div class="radio-select">
  <div class="options">
    {#each options as value}
      <button
        class="option"
        class:selected={energy === value}
        style="--option-color: {getMoodColor(value)}"
        onclick={() => select(value)}
      >
        <span class="value-label">{value > 0 ? '+' : '-'}{value}</span>
        <span class="dot"></span>
      </button>
    {/each}
  </div>
  <div class="labels">
    <span class="label">Calm/Relaxed</span>
    <span class="label">Neutral</span>
    <span class="label">Agitated/Tense</span>
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

  .value-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-bottom: 2px;
  }

  .option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 0 10px;
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
    border-color: var(--option-color);
    background: var(--bg-card);
    box-shadow: inset 0 0 0 8px var(--option-color);
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
