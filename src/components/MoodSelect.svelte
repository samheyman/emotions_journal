<script lang="ts">
  import { getMoodColor } from '../lib/data/emotions';

  let {
    mood = $bindable(4),
  }: {
    mood: number;
  } = $props();

  function onInput(e: Event) {
    mood = Number((e.target as HTMLInputElement).value);
  }

  let trackColor = $derived(getMoodColor(mood));
</script>

<div class="slider-wrapper">
  <input
    type="range"
    min="1"
    max="7"
    step="1"
    value={mood}
    oninput={onInput}
    class="mood-slider"
    style="--track-color: {trackColor}"
  />
  <div class="labels">
    <span class="label">Bad</span>
    <span class="label">Neutral</span>
    <span class="label">Good</span>
  </div>
</div>

<style>
  .slider-wrapper {
    width: 100%;
  }

  .mood-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: var(--bg-subtle);
    outline: none;
  }

  .mood-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--track-color);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: background 0.15s ease;
  }

  .mood-slider::-moz-range-thumb {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--track-color);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: background 0.15s ease;
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
