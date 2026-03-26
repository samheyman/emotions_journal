<script lang="ts">
  import { getEnergyColor } from '../lib/data/emotions';

  let {
    nsState = $bindable(0),
    onuserinput,
  }: {
    nsState: number;
    onuserinput?: () => void;
  } = $props();

  let thumbColor = $derived(getEnergyColor(nsState));
  let fillPct = $derived((nsState / 6 * 100) + '%');

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
    style="--thumb-color: {thumbColor}; --fill-pct: {fillPct}"
  />
  <div class="labels">
    <span class="label">Shutdown</span>
    <span class="label"></span>
    <span class="label"></span>
    <span class="label">Calm</span>
    <span class="label"></span>
    <span class="label"></span>
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
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(
      to right,
      var(--thumb-color) 0%,
      var(--thumb-color) var(--fill-pct),
      color-mix(in srgb, var(--thumb-color) 25%, white) var(--fill-pct),
      color-mix(in srgb, var(--thumb-color) 25%, white) 100%
    );
    outline: none;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  input[type="range"]::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    cursor: pointer;
    transition: transform 0.1s ease;
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
