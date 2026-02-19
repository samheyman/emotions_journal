<script lang="ts">
  import type { LoggedEvent, EventType } from '../lib/types';

  let { event, eventType, onDelete, onEdit }: {
    event: LoggedEvent;
    eventType: EventType | undefined;
    onDelete: (id: string) => void;
    onEdit?: (id: string) => void;
  } = $props();

  let expanded = $state(false);
  let confirmingDelete = $state(false);

  function formatHour(timestamp: string): string {
    const h = new Date(timestamp).getHours();
    return `${String(h).padStart(2, '0')}:00`;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="event-card" onclick={() => expanded = !expanded}>
  <div class="card-main">
    <div class="emoji-circle">{eventType?.emoji || '★'}</div>
    <div class="card-body">
      <span class="event-name">{eventType?.name ?? 'Unknown event'}</span>
      {#if event.note}
        <p class="note-text">
          {#if expanded}
            {event.note}
          {:else}
            {event.note.slice(0, 80)}{event.note.length > 80 ? '...' : ''}
          {/if}
        </p>
      {/if}
    </div>
    <span class="time">{event.allDay ? 'All day' : formatHour(event.timestamp)}</span>
  </div>

  {#if expanded}
    <div class="actions">
      {#if confirmingDelete}
        <span class="confirm-text">Delete?</span>
        <button class="cancel-btn" onclick={(e) => { e.stopPropagation(); confirmingDelete = false; }}>Cancel</button>
        <button class="confirm-delete-btn" onclick={(e) => { e.stopPropagation(); onDelete(event.id); }}>Delete</button>
      {:else}
        {#if onEdit}
          <button class="edit-btn" aria-label="Edit event" onclick={(e) => { e.stopPropagation(); onEdit(event.id); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        {/if}
        <button class="delete-btn" aria-label="Delete event" onclick={(e) => { e.stopPropagation(); confirmingDelete = true; }}>
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
  .event-card {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--border);
    padding: var(--space-md);
    cursor: pointer;
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .event-card:active {
    transform: scale(0.99);
  }

  .card-main {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .emoji-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .card-body {
    flex: 1;
    min-width: 0;
  }

  .event-name {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
    display: block;
  }

  .note-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 2px;
    line-height: 1.4;
    word-break: break-word;
  }

  .time {
    font-size: 0.75rem;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .actions {
    margin-top: var(--space-sm);
    padding-top: var(--space-sm);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-sm);
  }

  .edit-btn, .delete-btn {
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

  .edit-btn:active {
    color: rgba(0, 0, 0, 0.6);
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
    background: var(--bg-subtle);
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
