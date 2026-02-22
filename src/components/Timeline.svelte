<script lang="ts">
  import type { EmotionEntry, LoggedEvent } from '../lib/types';
  import { isSameDay, formatDate, dateKey } from '../lib/utils/dates';
  import { eventTypes } from '../lib/stores/eventTypes';
  import EntryCard from './EntryCard.svelte';
  import EventCard from './EventCard.svelte';

  let { entries, events, onDelete, onDeleteEvent, onEdit, onEditEvent }: {
    entries: EmotionEntry[];
    events: LoggedEvent[];
    onDelete: (id: string) => void;
    onDeleteEvent: (id: string) => void;
    onEdit?: (id: string) => void;
    onEditEvent?: (id: string) => void;
  } = $props();

  let selectedDate = $state(new Date());

  type TimelineItem =
    | { kind: 'entry'; data: EmotionEntry }
    | { kind: 'event'; data: LoggedEvent };

  let filteredItems = $derived((): TimelineItem[] => {
    const dayKey = dateKey(selectedDate);
    const filteredEntries: TimelineItem[] = entries
      .filter((e) => e.experiencedDate === dayKey)
      .map((e) => ({ kind: 'entry', data: e }));
    const filteredEvents: TimelineItem[] = events
      .filter((e) => e.eventDate === dayKey)
      .map((e) => ({ kind: 'event', data: e }));
    return [...filteredEntries, ...filteredEvents].sort((a, b) => {
      const ta = a.kind === 'entry'
        ? new Date(a.data.experiencedDate + 'T12:00:00').getTime()
        : new Date(a.data.eventDate + 'T' + (a.data.eventTime || '12:00')).getTime();
      const tb = b.kind === 'entry'
        ? new Date(b.data.experiencedDate + 'T12:00:00').getTime()
        : new Date(b.data.eventDate + 'T' + (b.data.eventTime || '12:00')).getTime();
      return tb - ta;
    });
  });

  let displayDate = $derived(formatDate(selectedDate.toISOString()));

  let isToday = $derived(() => {
    const now = new Date();
    return selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();
  });

  function prevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    selectedDate = d;
  }

  function nextDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    selectedDate = d;
  }

  function goToToday() {
    selectedDate = new Date();
  }
</script>

<div class="timeline">
  <div class="date-nav">
    <button class="nav-btn" onclick={prevDay} aria-label="Previous day">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <button class="date-label" onclick={goToToday}>
      {isToday() ? 'Today' : displayDate}
    </button>
    <button class="nav-btn" onclick={nextDay} aria-label="Next day">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </div>

  {#if filteredItems().length === 0}
    <div class="empty">
      <p class="empty-icon">~</p>
      <p class="empty-text">No entries {isToday() ? 'yet today' : 'this day'}</p>
      {#if isToday()}
        <p class="empty-hint">Tap + to check in</p>
      {/if}
    </div>
  {:else}
    <div class="entries">
      {#each filteredItems() as item (item.data.id)}
        {#if item.kind === 'entry'}
          <EntryCard entry={item.data} onDelete={onDelete} {onEdit} />
        {:else}
          <EventCard
            event={item.data}
            eventType={$eventTypes.find(t => t.id === item.data.typeId)}
            onDelete={onDeleteEvent}
            onEdit={onEditEvent}
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .timeline {
    padding: var(--space-md);
  }

  .date-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .nav-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-btn:active {
    background: var(--bg-subtle);
  }

  .date-label {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-primary);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
  }

  .date-label:active {
    background: var(--bg-subtle);
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl) var(--space-md);
    text-align: center;
  }

  .empty-icon {
    font-size: 2rem;
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
  }

  .empty-text {
    color: var(--text-secondary);
    font-size: var(--text-base);
  }

  .empty-hint {
    color: var(--text-muted);
    font-size: var(--text-sm);
    margin-top: var(--space-xs);
  }
</style>
