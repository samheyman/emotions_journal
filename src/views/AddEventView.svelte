<script lang="ts">
  import type { LoggedEvent } from '../lib/types';
  import { dateKey } from '../lib/utils/dates';
  import { eventTypes } from '../lib/stores/eventTypes';
  import { events } from '../lib/stores/events';
  import EventIcon from '../components/EventIcon.svelte';

  let { onComplete, onCancel, editingEvent = undefined }: {
    onComplete: () => void;
    onCancel: () => void;
    editingEvent?: LoggedEvent;
  } = $props();

  let isEditing = editingEvent !== undefined;

  let selectedTypeId: string | null = $state(editingEvent?.typeId ?? null);
  let note = $state(editingEvent?.note ?? '');
  let selectedDate = $state(editingEvent ? (() => {
    const [y, m, d] = editingEvent.eventDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  })() : new Date());
  let dateInputEl: HTMLInputElement | undefined = $state();
  // hour as '' (all day) or '0'–'23'
  let hourValue = $state(
    editingEvent?.eventTime ? String(parseInt(editingEvent.eventTime)) : ''
  );

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: `${String(i).padStart(2, '0')}:00`,
  }));

  let todayStr = new Date().toISOString().slice(0, 10);

  let isToday = $derived(
    selectedDate.toISOString().slice(0, 10) === todayStr
  );

  let dateLabel = $derived(
    isToday ? 'Today' : selectedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  );

  function openDatePicker() {
    dateInputEl?.showPicker();
  }

  function onDateChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (val) {
      const [y, m, d] = val.split('-').map(Number);
      selectedDate = new Date(y, m - 1, d);
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
    if (!selectedTypeId) return;
    const eventDate = dateKey(selectedDate);
    const eventTime = hourValue !== '' ? `${String(parseInt(hourValue)).padStart(2, '0')}:00` : undefined;
    if (isEditing && editingEvent) {
      events.updateEvent({ ...editingEvent, typeId: selectedTypeId, eventDate, eventTime, note: note.trim() || undefined, updatedAt: new Date().toISOString() });
    } else {
      events.add({ id: generateId(), loggedAt: new Date().toISOString(), typeId: selectedTypeId, eventDate, eventTime, note: note.trim() || undefined });
    }
    onComplete();
  }

  let canSave = $derived(selectedTypeId !== null);
</script>

<div class="add-event">
  <header class="header">
    <button class="close-btn" aria-label="Close" onclick={onCancel}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <h2 class="header-title">{isEditing ? 'Edit event' : 'Log event'}</h2>
    <div class="header-spacer"></div>
  </header>

  <div class="content">
    <div class="date-row">
      <button class="date-chip" class:past={!isToday} onclick={openDatePicker}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {dateLabel}
      </button>
      <input
        bind:this={dateInputEl}
        type="date"
        class="date-input-hidden"
        max={todayStr}
        value={selectedDate.toISOString().slice(0, 10)}
        onchange={onDateChange}
      />
      <select class="hour-select" bind:value={hourValue}>
        <option value="">All day</option>
        {#each hours as h}
          <option value={h.value}>{h.label}</option>
        {/each}
      </select>
    </div>

    <div class="types-grid">
      {#each $eventTypes.filter(t => t.visible !== false) as type (type.id)}
        <button
          class="type-btn"
          class:selected={selectedTypeId === type.id}
          onclick={() => selectedTypeId = type.id}
        >
          <EventIcon name={type.emoji || 'Star'} size={20} />
          <span class="type-name">{type.name}</span>
        </button>
      {/each}
    </div>

    <div class="note-section">
      <textarea
        bind:value={note}
        placeholder="Add a note (optional)..."
        rows="3"
        maxlength="300"
      ></textarea>
      <span class="char-count" class:visible={note.length > 0}>{note.length}/300</span>
    </div>
  </div>

  <footer class="footer">
    <button
      class="btn btn-primary full-width"
      disabled={!canSave}
      onclick={save}
    >
      {isEditing ? 'Update event' : 'Log event'}
    </button>
  </footer>
</div>

<style>
  .add-event {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    padding: var(--space-md);
    padding-top: calc(var(--space-md) + env(safe-area-inset-top));
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  .close-btn {
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

  .close-btn:active {
    background: var(--bg-subtle);
  }

  .header-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .header-spacer {
    width: 40px;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .date-row {
    position: relative;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-sm);
  }

  .date-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
  }

  .date-chip:active {
    background: var(--bg-subtle);
  }

  .date-chip.past {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(196, 132, 108, 0.08);
  }

  .date-input-hidden {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .hour-select {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    appearance: none;
    -webkit-appearance: none;
  }

  .hour-select:focus {
    outline: none;
    border-color: var(--accent);
  }

  .types-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }

  .type-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: var(--text-sm);
    cursor: pointer;
    text-align: left;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
  }

  .type-btn:active {
    transform: scale(0.97);
  }

  .type-btn.selected {
    border-color: var(--accent);
    background: rgba(196, 132, 108, 0.08);
    color: var(--accent);
  }

  .type-name {
    font-size: 0.8rem;
    line-height: 1.3;
  }

  .note-section {
    position: relative;
  }

  .note-section textarea {
    width: 100%;
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: var(--text-base);
    line-height: 1.5;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }

  .note-section textarea:focus {
    outline: none;
    border-color: var(--accent);
  }

  .note-section textarea::placeholder {
    color: var(--text-muted);
  }

  .char-count {
    display: block;
    text-align: right;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
    visibility: hidden;
  }

  .char-count.visible {
    visibility: visible;
  }

  .footer {
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
  }

  .btn-primary:hover {
    background: #b8785f;
  }

  .full-width {
    width: 100%;
  }
</style>
