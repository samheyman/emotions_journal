<script lang="ts">
  import MoodPad from '../components/MoodPad.svelte';
  import EmotionPicker from '../components/EmotionPicker.svelte';
  import TagPicker from '../components/TagPicker.svelte';
  import NoteInput from '../components/NoteInput.svelte';
  import { entries } from '../lib/stores/entries';
  import type { EmotionEntry } from '../lib/types';

  let { onComplete, onCancel }: { onComplete: () => void; onCancel: () => void } = $props();

  let step = $state(1);
  let valence = $state(0);
  let energy = $state(0);
  let selectedEmotions: string[] = $state([]);
  let selectedTags: string[] = $state([]);
  let note = $state('');

  const totalSteps = 4;

  let canProceed = $derived(
    step === 1 ? true :
    step === 2 ? selectedEmotions.length >= 1 :
    true
  );

  function next() {
    if (step < totalSteps) {
      step++;
    } else {
      save();
    }
  }

  function back() {
    if (step > 1) {
      step--;
    } else {
      onCancel();
    }
  }

  function skip() {
    if (step < totalSteps) {
      step++;
    } else {
      save();
    }
  }

  function generateId(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  function save() {
    const entry: EmotionEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      valence,
      energy,
      emotions: selectedEmotions,
      tags: selectedTags,
      note,
    };
    entries.add(entry);
    onComplete();
  }

  let stepTitle = $derived(
    step === 1 ? 'How are you feeling?' :
    step === 2 ? 'Name your emotions' :
    step === 3 ? 'Add context' :
    'Add a note'
  );

  let isOptionalStep = $derived(step === 3 || step === 4);
</script>

<div class="checkin">
  <header class="checkin-header">
    <button class="back-btn" onclick={back}>
      {#if step === 1}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      {:else}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      {/if}
    </button>
    <div class="progress">
      {#each Array(totalSteps) as _, i}
        <div class="dot" class:active={i < step} class:current={i === step - 1}></div>
      {/each}
    </div>
    <div class="header-spacer"></div>
  </header>

  <div class="step-content">
    <h2 class="step-title">{stepTitle}</h2>

    <div class="step-body">
      {#if step === 1}
        <MoodPad bind:valence bind:energy />
      {:else if step === 2}
        <EmotionPicker {valence} {energy} bind:selected={selectedEmotions} />
      {:else if step === 3}
        <TagPicker bind:selected={selectedTags} />
      {:else}
        <NoteInput bind:note />
      {/if}
    </div>
  </div>

  <footer class="checkin-footer">
    {#if isOptionalStep}
      <button class="btn btn-secondary" onclick={skip}>Skip</button>
    {/if}
    <button
      class="btn btn-primary"
      class:full-width={!isOptionalStep}
      disabled={!canProceed}
      onclick={next}
    >
      {step === totalSteps ? 'Save' : 'Next'}
    </button>
  </footer>
</div>

<style>
  .checkin {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    padding: var(--space-md);
    padding-top: calc(var(--space-md) + env(safe-area-inset-top));
    overflow-y: auto;
  }

  .checkin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-btn:active {
    background: var(--bg-subtle);
  }

  .header-spacer {
    width: 40px;
  }

  .progress {
    display: flex;
    gap: var(--space-sm);
  }

  .progress .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: all 0.2s ease;
  }

  .progress .dot.active {
    background: var(--accent-soft);
  }

  .progress .dot.current {
    background: var(--accent);
    width: 24px;
    border-radius: 4px;
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .step-title {
    font-size: var(--text-xl);
    font-weight: 600;
    margin-bottom: var(--space-lg);
    color: var(--text-primary);
  }

  .step-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .checkin-footer {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    background: var(--bg-primary);
  }

  .btn {
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    font-family: var(--font);
    font-size: var(--text-base);
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .btn-primary {
    background: var(--accent);
    color: white;
    flex: 1;
  }

  .btn-primary:hover {
    background: #b8785f;
  }

  .btn-secondary {
    background: var(--bg-subtle);
    color: var(--text-secondary);
    flex: 0;
    white-space: nowrap;
  }

  .btn.full-width {
    width: 100%;
  }
</style>
