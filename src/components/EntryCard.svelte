<script lang="ts">
  import type { EmotionEntry } from '../lib/types';
  import { formatTime } from '../lib/utils/dates';
  import { getMoodColor } from '../lib/data/emotions';

  let { entry, onDelete }: { entry: EmotionEntry; onDelete: (id: string) => void } = $props();

  let expanded = $state(false);
  let confirmingDelete = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="entry-card" style="background: {getMoodColor(entry.valence)}" onclick={() => expanded = !expanded}>
  {#if entry.note}
    {#if expanded}
      <p class="note-text">{entry.note}</p>
    {:else}
      <p class="note-text">{entry.note.slice(0, 80)}{entry.note.length > 80 ? '...' : ''}</p>
    {/if}
  {/if}

  {#if entry.emotions.length > 0}
    <div class="emotions-row">
      {#each entry.emotions as emotion}
        <span class="emotion-tag">{emotion}</span>
      {/each}
    </div>
  {/if}

  {#if entry.tags.length > 0}
    <div class="tags-row">
      {#each entry.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}

  {#if expanded}
    <div class="actions">
      <span class="time">{formatTime(entry.timestamp)}{#if entry.timeOfDay && entry.timeOfDay !== 'allday'}{' · '}{entry.timeOfDay === 'morning' ? 'Morning' : entry.timeOfDay === 'afternoon' ? 'Afternoon' : entry.timeOfDay === 'evening' ? 'Evening' : 'Night'}{/if}</span>
      {#if confirmingDelete}
        <span class="confirm-text">Delete?</span>
        <button class="cancel-btn" onclick={(e) => { e.stopPropagation(); confirmingDelete = false; }}>Cancel</button>
        <button class="confirm-delete-btn" onclick={(e) => { e.stopPropagation(); onDelete(entry.id); }}>Delete</button>
      {:else}
        <button class="delete-btn" onclick={(e) => { e.stopPropagation(); confirmingDelete = true; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .entry-card {
    border-radius: var(--radius-md);
    padding: var(--space-md);
    cursor: pointer;
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .entry-card:active {
    transform: scale(0.99);
  }

  .note-text {
    font-size: var(--text-sm);
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.5;
  }

  .emotions-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-top: var(--space-sm);
  }

  .emotion-tag {
    font-size: 0.75rem;
    padding: 2px 10px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.45);
    color: rgba(0, 0, 0, 0.6);
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-top: var(--space-xs);
  }

  .tag {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: rgba(0, 0, 0, 0.08);
    color: rgba(0, 0, 0, 0.5);
  }

  .actions {
    margin-top: var(--space-sm);
    padding-top: var(--space-sm);
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .time {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.4);
    margin-right: auto;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: rgba(0, 0, 0, 0.35);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
  }

  .delete-btn:active {
    color: rgba(180, 40, 40, 0.7);
  }

  .confirm-text {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.5);
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
    background: rgba(255, 255, 255, 0.5);
    color: rgba(0, 0, 0, 0.5);
  }

  .confirm-delete-btn {
    background: #c44;
    color: white;
  }

  .confirm-delete-btn:active {
    background: #a33;
  }
</style>
