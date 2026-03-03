<script lang="ts">
  import type { EmotionEntry, LoggedEvent } from '../lib/types';
  import { entries } from '../lib/stores/entries';
  import { events } from '../lib/stores/events';
  import { eventTypes } from '../lib/stores/eventTypes';
  import EntryCard from '../components/EntryCard.svelte';
  import EventCard from '../components/EventCard.svelte';

  let { onStartCheckIn, onStartEvent, onEdit, onEditEvent }: {
    onStartCheckIn: () => void;
    onStartEvent: () => void;
    onEdit: (id: string) => void;
    onEditEvent: (id: string) => void;
  } = $props();

  const now = new Date();
  let year = $state(now.getFullYear());
  let month = $state(now.getMonth()); // 0-indexed

  let isCurrentMonth = $derived(
    year === now.getFullYear() && month === now.getMonth()
  );

  let monthLabel = $derived(
    new Date(year, month, 1).toLocaleDateString([], { month: 'long', year: 'numeric' })
  );

  function prevMonth() {
    if (month === 0) { month = 11; year--; }
    else month--;
  }

  function nextMonth() {
    if (isCurrentMonth) return;
    if (month === 11) { month = 0; year++; }
    else month++;
  }

  type Item =
    | { kind: 'entry'; data: EmotionEntry }
    | { kind: 'event'; data: LoggedEvent };

  const periodMinutes: Record<string, number> = {
    morning: 480,
    afternoon: 780,
    evening: 1080,
    night: 1320,
  };

  function sortKey(item: Item): number {
    if (item.kind === 'entry') {
      return periodMinutes[item.data.experiencedPeriod ?? 'allday'] ?? Infinity;
    } else {
      if (!item.data.eventTime) return Infinity;
      const [h, m] = item.data.eventTime.split(':').map(Number);
      return h * 60 + m;
    }
  }

  let dayGroups = $derived((() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    const byDate = new Map<string, Item[]>();

    for (const entry of $entries) {
      if (!entry.experiencedDate.startsWith(prefix)) continue;
      if (!byDate.has(entry.experiencedDate)) byDate.set(entry.experiencedDate, []);
      byDate.get(entry.experiencedDate)!.push({ kind: 'entry', data: entry });
    }
    for (const event of $events) {
      if (!event.eventDate.startsWith(prefix)) continue;
      if (!byDate.has(event.eventDate)) byDate.set(event.eventDate, []);
      byDate.get(event.eventDate)!.push({ kind: 'event', data: event });
    }

    const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
    return dates.map(date => ({
      date,
      label: formatDayLabel(date),
      items: byDate.get(date)!.sort((a, b) => sortKey(b) - sortKey(a)),
    }));
  })());

  function formatDayLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString([], {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  let fabOpen = $state(false);

  function handleCheckIn() { fabOpen = false; onStartCheckIn(); }
  function handleEvent() { fabOpen = false; onStartEvent(); }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="home">
  <div class="month-nav">
    <button class="nav-btn" onclick={prevMonth} aria-label="Previous month">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <span class="month-label">{monthLabel}</span>
    <button class="nav-btn" onclick={nextMonth} aria-label="Next month" disabled={isCurrentMonth}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </div>

  <div class="feed">
    {#if dayGroups.length === 0}
      <div class="empty">
        <p class="empty-icon">~</p>
        <p class="empty-text">No entries this month</p>
      </div>
    {:else}
      {#each dayGroups as group (group.date)}
        <div class="day-section">
          <h3 class="day-label">{group.label}</h3>
          <div class="day-items">
            {#each group.items as item (item.data.id)}
              {#if item.kind === 'entry'}
                <EntryCard entry={item.data} onDelete={(id) => entries.remove(id)} {onEdit} />
              {:else}
                <EventCard
                  event={item.data}
                  eventType={$eventTypes.find(t => t.id === item.data.typeId)}
                  onDelete={(id) => events.remove(id)}
                  onEdit={onEditEvent}
                />
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  {#if fabOpen}
    <div class="fab-backdrop" onclick={() => fabOpen = false}></div>
  {/if}

  <div class="fab-container">
    {#if fabOpen}
      <div class="mini-fabs">
        <button class="mini-fab-btn" onclick={handleCheckIn}>Check-in</button>
        <button class="mini-fab-btn" onclick={handleEvent}>Log event</button>
      </div>
    {/if}
    <button class="fab" class:open={fabOpen} onclick={() => fabOpen = !fabOpen} title={fabOpen ? 'Close' : 'Add'}>
      {#if fabOpen}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      {:else}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding-bottom: var(--space-2xl);
  }

  .month-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-md);
    padding-top: calc(var(--space-lg) + env(safe-area-inset-top));
  }

  .month-label {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
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

  .nav-btn:disabled {
    opacity: 0.25;
    pointer-events: none;
  }

  .feed {
    flex: 1;
    padding: 0 var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .day-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .day-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-muted);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid var(--border);
  }

  .day-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
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

  .fab-backdrop {
    position: fixed;
    inset: 0;
    z-index: 4;
  }

  .fab-container {
    position: fixed;
    bottom: calc(80px + env(safe-area-inset-bottom));
    right: var(--space-lg);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-sm);
    z-index: 5;
  }

  .mini-fabs {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    align-items: flex-end;
    margin-bottom: var(--space-xs);
  }

  .mini-fab-btn {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    font-family: var(--font);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    box-shadow: var(--shadow);
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s ease;
    white-space: nowrap;
  }

  .mini-fab-btn:active { background: var(--bg-subtle); }

  .fab {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(196, 132, 108, 0.3);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .fab:active { transform: scale(0.92); }
</style>
