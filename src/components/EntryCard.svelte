<script lang="ts">
  import type { EmotionEntry } from '../lib/types';
  import { formatTime } from '../lib/utils/dates';

  let { entry }: { entry: EmotionEntry } = $props();

  let expanded = $state(false);

  let moodColor = $derived(() => {
    const t = (entry.valence + 5) / 10; // 0 to 1
    const r = Math.round(155 + t * 77);
    const g = Math.round(174 - t * 13);
    const b = Math.round(194 - t * 34);
    return `rgb(${r}, ${g}, ${b})`;
  });

  let valenceLabel = $derived(
    entry.valence > 2 ? 'Pleasant' :
    entry.valence < -2 ? 'Unpleasant' :
    'Neutral'
  );

  let energyLabel = $derived(
    entry.energy > 2 ? 'High energy' :
    entry.energy < -2 ? 'Low energy' :
    'Moderate'
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="entry-card" onclick={() => expanded = !expanded}>
  <div class="card-header">
    <div class="mood-indicator" style="background: {moodColor()}"></div>
    <div class="card-info">
      <div class="emotions-row">
        {#each entry.emotions as emotion}
          <span class="emotion-label">{emotion}</span>
        {/each}
      </div>
      <span class="time">{formatTime(entry.timestamp)}</span>
    </div>
    <div class="mood-values">
      <span class="value-badge" title="Valence">{valenceLabel}</span>
      <span class="value-badge alt" title="Energy">{energyLabel}</span>
    </div>
  </div>

  {#if entry.tags.length > 0}
    <div class="tags-row">
      {#each entry.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}

  {#if expanded && entry.note}
    <div class="note">
      <p>{entry.note}</p>
    </div>
  {/if}

  {#if entry.note && !expanded}
    <div class="note-preview">
      <p>{entry.note.slice(0, 60)}{entry.note.length > 60 ? '...' : ''}</p>
    </div>
  {/if}
</div>

<style>
  .entry-card {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .entry-card:active {
    transform: scale(0.99);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .mood-indicator {
    width: 12px;
    height: 40px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .card-info {
    flex: 1;
    min-width: 0;
  }

  .emotions-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-bottom: 2px;
  }

  .emotion-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .emotion-label:not(:last-child)::after {
    content: ' · ';
    color: var(--text-muted);
  }

  .time {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .mood-values {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }

  .value-badge {
    font-size: 0.625rem;
    padding: 2px 6px;
    border-radius: var(--radius-full);
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: 500;
    white-space: nowrap;
    text-align: center;
  }

  .value-badge.alt {
    background: rgba(124, 165, 160, 0.15);
    color: var(--accent-alt);
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-top: var(--space-sm);
    padding-left: calc(12px + var(--space-md));
  }

  .tag {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: var(--bg-subtle);
    color: var(--text-secondary);
  }

  .note, .note-preview {
    margin-top: var(--space-sm);
    padding-left: calc(12px + var(--space-md));
  }

  .note p, .note-preview p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .note-preview p {
    color: var(--text-muted);
  }
</style>
