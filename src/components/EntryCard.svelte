<script lang="ts">
  import type { EmotionEntry } from '../lib/types';
  import { formatTime } from '../lib/utils/dates';
  import { getMoodLabel, getMoodColor } from '../lib/data/emotions';

  let { entry, onDelete }: { entry: EmotionEntry; onDelete: (id: string) => void } = $props();

  let expanded = $state(false);
  let confirmingDelete = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="entry-card" onclick={() => expanded = !expanded}>
  <div class="card-header">
    <div class="mood-indicator" style="background: {getMoodColor(entry.mood)}"></div>
    <div class="card-info">
      <div class="emotions-row">
        {#if entry.emotions.length > 0}
          {#each entry.emotions as emotion}
            <span class="emotion-label">{emotion}</span>
          {/each}
        {:else}
          <span class="emotion-label">{getMoodLabel(entry.mood)}</span>
        {/if}
      </div>
    </div>
    <span class="mood-badge" style="background: {getMoodColor(entry.mood)}">{getMoodLabel(entry.mood)}</span>
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

  {#if expanded}
    <div class="actions">
      <span class="time">{formatTime(entry.timestamp)}{#if entry.timeOfDay && entry.timeOfDay !== 'allday'}{' · '}{entry.timeOfDay === 'morning' ? 'Morning' : entry.timeOfDay === 'afternoon' ? 'Afternoon' : entry.timeOfDay === 'evening' ? 'Evening' : 'Night'}{/if}</span>
      {#if confirmingDelete}
        <span class="confirm-text">Delete this entry?</span>
        <button class="cancel-btn" onclick={(e) => { e.stopPropagation(); confirmingDelete = false; }}>Cancel</button>
        <button class="confirm-delete-btn" onclick={(e) => { e.stopPropagation(); onDelete(entry.id); }}>Delete</button>
      {:else}
        <button class="delete-btn" onclick={(e) => { e.stopPropagation(); confirmingDelete = true; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
          Delete
        </button>
      {/if}
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

  .mood-badge {
    font-size: 0.625rem;
    padding: 3px 8px;
    border-radius: var(--radius-full);
    color: white;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
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

  .actions {
    margin-top: var(--space-sm);
    padding-top: var(--space-sm);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .time {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-right: auto;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    background: none;
    border: none;
    color: var(--text-muted);
    font-family: var(--font);
    font-size: 0.75rem;
    cursor: pointer;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
  }

  .delete-btn:active {
    background: rgba(200, 50, 50, 0.1);
    color: #c44;
  }

  .confirm-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-right: auto;
  }

  .cancel-btn, .confirm-delete-btn {
    border: none;
    font-family: var(--font);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
  }

  .cancel-btn {
    background: var(--bg-subtle);
    color: var(--text-secondary);
  }

  .confirm-delete-btn {
    background: #c44;
    color: white;
  }

  .confirm-delete-btn:active {
    background: #a33;
  }
</style>
