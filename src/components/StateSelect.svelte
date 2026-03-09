<script lang="ts">
  import { getEnergyColor } from '../lib/data/emotions';

  let {
    nsState = $bindable(0),
    onuserinput,
  }: {
    nsState: number;
    onuserinput?: () => void;
  } = $props();

  let trackColor = $derived(getEnergyColor(nsState));

  function oninput(e: Event) {
    nsState = Number((e.target as HTMLInputElement).value);
    onuserinput?.();
  }
</script>

<div class="slider-select">
  <input
    type="range"
    min="0"
    max="6"
    step="1"
    value={nsState}
    {oninput}
    style="--thumb-color: {trackColor}"
  />
  <div class="labels">
    <span class="label">Shutdown</span>
    <span class="label">Calm</span>
    <span class="label">Tense</span>
    <span class="label">Agitated</span>
    <span class="label">Explosive</span>
  </div>
</div>

<style>
  .slider-select {
    width: 100%;
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--border);
    outline: none;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--thumb-color);
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
  }

  input[type="range"]::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: var(--thumb-color);
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
  }

  input[type="range"]:active::-webkit-slider-thumb {
    transform: scale(0.9);
  }

  input[type="range"]:active::-moz-range-thumb {
    transform: scale(0.9);
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
