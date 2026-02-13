<script lang="ts">
  import { getMoodDescription } from '../lib/data/emotions';

  let {
    valence = $bindable(0),
    energy = $bindable(0),
  }: {
    valence: number;
    energy: number;
  } = $props();

  let padEl: HTMLDivElement | undefined = $state();
  let isDragging = $state(false);
  let hasInteracted = $state(false);

  function updateFromPointer(e: PointerEvent) {
    if (!padEl) return;
    const rect = padEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    valence = Math.round((x * 10 - 5) * 10) / 10;
    energy = Math.round(((1 - y) * 10 - 5) * 10) / 10;
    hasInteracted = true;
  }

  function onPointerDown(e: PointerEvent) {
    isDragging = true;
    padEl?.setPointerCapture(e.pointerId);
    updateFromPointer(e);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    e.preventDefault();
    updateFromPointer(e);
  }

  function onPointerUp() {
    isDragging = false;
  }

  let dotX = $derived(((valence + 5) / 10) * 100);
  let dotY = $derived(((5 - energy) / 10) * 100);
  let description = $derived(getMoodDescription(valence, energy));

  // Gradient colors based on position
  let bgGradient = $derived(() => {
    const r = Math.round(155 + valence * 10);
    const g = Math.round(170 + energy * 5);
    const b = Math.round(194 - valence * 8);
    return `radial-gradient(circle at ${dotX}% ${dotY}%, rgba(${r}, ${g}, ${b}, 0.3), transparent 60%)`;
  });
</script>

<div class="mood-pad-container">
  <div class="pad-labels">
    <span class="label top-left">Anxious</span>
    <span class="label top-right">Excited</span>
    <span class="label bottom-left">Sad</span>
    <span class="label bottom-right">Calm</span>
  </div>

  <div class="axis-labels">
    <span class="axis y-top">High Energy</span>
    <span class="axis y-bottom">Low Energy</span>
    <span class="axis x-left">Unpleasant</span>
    <span class="axis x-right">Pleasant</span>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="mood-pad"
    class:dragging={isDragging}
    bind:this={padEl}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    style="background-image: {bgGradient()}"
  >
    <div class="grid-lines">
      <div class="line horizontal"></div>
      <div class="line vertical"></div>
    </div>

    {#if hasInteracted}
      <div
        class="dot"
        class:active={isDragging}
        style="left: {dotX}%; top: {dotY}%"
      ></div>
    {:else}
      <div class="tap-hint">Tap or drag to set your mood</div>
    {/if}
  </div>

  <p class="mood-description" class:visible={hasInteracted}>
    {description}
  </p>
</div>

<style>
  .mood-pad-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
  }

  .mood-pad {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    max-width: 320px;
    background-color: var(--bg-subtle);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    touch-action: none;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition: background-image 0.1s ease;
    overflow: hidden;
  }

  .mood-pad.dragging {
    cursor: grabbing;
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .line {
    position: absolute;
    background: var(--border);
  }

  .line.horizontal {
    top: 50%;
    left: 10%;
    right: 10%;
    height: 1px;
  }

  .line.vertical {
    left: 50%;
    top: 10%;
    bottom: 10%;
    width: 1px;
  }

  .dot {
    position: absolute;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent);
    border: 3px solid var(--bg-card);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translate(-50%, -50%);
    transition: width 0.15s ease, height 0.15s ease, box-shadow 0.15s ease;
    pointer-events: none;
    z-index: 2;
  }

  .dot.active {
    width: 34px;
    height: 34px;
    box-shadow: 0 4px 16px rgba(196, 132, 108, 0.3);
  }

  .tap-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: var(--text-sm);
    pointer-events: none;
  }

  .pad-labels {
    position: relative;
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  .label {
    position: absolute;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .label.top-left { top: 8px; left: 12px; }
  .label.top-right { top: 8px; right: 12px; }
  .label.bottom-left { bottom: 8px; left: 12px; }
  .label.bottom-right { bottom: 8px; right: 12px; }

  .axis-labels {
    display: none;
  }

  .mood-description {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-align: center;
    min-height: 1.5em;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .mood-description.visible {
    opacity: 1;
  }

  .mood-pad-container {
    position: relative;
  }

  .pad-labels {
    position: absolute;
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1;
    z-index: 3;
    pointer-events: none;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
