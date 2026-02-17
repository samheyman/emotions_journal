<script lang="ts">
  import { getMoodColor } from '../lib/data/emotions';

  let {
    energy = $bindable(0),
    onuserinput,
  }: {
    energy: number;
    onuserinput?: () => void;
  } = $props();

  function onInput(e: Event) {
    energy = Number((e.target as HTMLInputElement).value);
    onuserinput?.();
  }

  let thumbColor = $derived(getMoodColor(energy));
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="slider-wrapper" onmousedown={(e) => { (e.target as HTMLElement).closest('.slider-wrapper')?.querySelector('input')?.focus(); }}>
  <input
    type="range"
    min="-3"
    max="3"
    step="1"
    value={energy}
    oninput={onInput}
    inputmode="none"
    class="energy-slider"
    style="--thumb-color: {thumbColor}"
  />
  <div class="labels">
    <span class="label">Low</span>
    <span class="label">Neutral</span>
    <span class="label">High</span>
  </div>
</div>

<style>
  .slider-wrapper {
    width: 100%;
  }

  .energy-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(
      to right,
      hsl(10, 45%, 72%),
      hsl(15, 40%, 78%),
      hsl(20, 35%, 84%),
      hsl(0, 0%, 88%),
      hsl(125, 30%, 84%),
      hsl(135, 40%, 78%),
      hsl(145, 45%, 72%)
    );
    outline: none;
  }

  .mood-slider:focus {
    outline: none;
  }

  .mood-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--thumb-color);
    cursor: pointer;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: background 0.15s ease;
  }

  .mood-slider::-moz-range-thumb {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--thumb-color);
    cursor: pointer;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: background 0.15s ease;
  }

  .mood-slider::-moz-range-track {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(
      to right,
      hsl(10, 45%, 72%),
      hsl(15, 40%, 78%),
      hsl(20, 35%, 84%),
      hsl(0, 0%, 88%),
      hsl(125, 30%, 84%),
      hsl(135, 40%, 78%),
      hsl(145, 45%, 72%)
    );
  }

  .labels {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-sm);
    padding: 0 2px;
  }

  .label {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
</style>
