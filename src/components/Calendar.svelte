<script lang="ts">
  import type { EmotionEntry, LoggedEvent } from '../lib/types';
  import { getDaysInMonth, getFirstDayOfMonth, formatMonthYear, dateKey, formatDate } from '../lib/utils/dates';
  import { getMoodColor } from '../lib/data/emotions';
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

  let year = $state(new Date().getFullYear());
  let month = $state(new Date().getMonth());
  let selectedDay: string | null = $state(null);

  let entriesByDate = $derived((() => {
    const map = new Map<string, EmotionEntry[]>();
    for (const entry of entries) {
      const key = entry.experiencedDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  })());

  let eventsByDate = $derived((() => {
    const map = new Map<string, LoggedEvent[]>();
    for (const event of events) {
      const key = event.eventDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  })());

  let daysInMonth = $derived(getDaysInMonth(year, month));
  let firstDay = $derived(getFirstDayOfMonth(year, month));
  let monthLabel = $derived(formatMonthYear(year, month));
  let dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun'];
/*
  let days = $derived(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= daysInMonth; i++) result.push(i);
    return result;
  });
*/

let days = $derived((() => {
  const result: (number | null)[] = [];
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < adjustedFirstDay; i++) result.push(null);
  for (let i = 1; i <= daysInMonth; i++) result.push(i);
  return result;
})());

  type DayItem =
    | { kind: 'entry'; data: EmotionEntry }
    | { kind: 'event'; data: LoggedEvent };

  let selectedItems = $derived((() => {
    if (!selectedDay) return [];
    const dayEntries: DayItem[] = (entriesByDate.get(selectedDay) || []).map(e => ({ kind: 'entry', data: e }));
    const dayEvents: DayItem[] = (eventsByDate.get(selectedDay) || []).map(e => ({ kind: 'event', data: e }));
    return [...dayEntries, ...dayEvents].sort((a, b) => {
      const ta = a.kind === 'entry'
        ? new Date(a.data.experiencedDate + 'T12:00:00').getTime()
        : new Date(a.data.eventDate + 'T' + (a.data.eventTime || '12:00')).getTime();
      const tb = b.kind === 'entry'
        ? new Date(b.data.experiencedDate + 'T12:00:00').getTime()
        : new Date(b.data.eventDate + 'T' + (b.data.eventTime || '12:00')).getTime();
      return tb - ta;
    });
  })());

  function prevMonth() {
    if (month === 0) { month = 11; year--; }
    else month--;
    selectedDay = null;
  }

  function nextMonth() {
    if (month === 11) { month = 0; year++; }
    else month++;
    selectedDay = null;
  }

  function getDayColors(day: number): string[] {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entriesByDate.get(key);
    if (!dayEntries || dayEntries.length === 0) return [];

    const sorted = [...dayEntries];
    const limited = sorted.slice(0, 4);
    return limited.map(e => getMoodColor((e as any).valence ?? ((e as any).mood !== undefined ? (e as any).mood - 4 : 0)));
  }

  function getDayKey(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getEntryCount(day: number): number {
    return (entriesByDate.get(getDayKey(day))?.length || 0) +
           (eventsByDate.get(getDayKey(day))?.length || 0);
  }

  function getDayEventEmojis(day: number): { emojis: string[]; extra: number } {
    const key = getDayKey(day);
    const dayEvents = eventsByDate.get(key) || [];
    const emojis = dayEvents.map(e => {
      const type = $eventTypes.find(t => t.id === e.typeId);
      return type?.emoji ?? '⚡';
    });
    const maxShow = 3;
    return {
      emojis: emojis.slice(0, maxShow),
      extra: Math.max(0, emojis.length - maxShow),
    };
  }

  function selectDay(day: number) {
    const key = getDayKey(day);
    selectedDay = selectedDay === key ? null : key;
  }

  function isToday(day: number): boolean {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
  }
</script>

<div class="calendar">
  <div class="month-nav">
    <button class="nav-btn" onclick={prevMonth} aria-label="Previous month">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <span class="month-label">{monthLabel}</span>
    <button class="nav-btn" onclick={nextMonth} aria-label="Next month">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </div>

  <div class="day-names">
    {#each dayNames as name}
      <span class="day-name">{name}</span>
    {/each}
  </div>

  <div class="grid">
    {#each days as day}
      {#if day === null}
        <div class="cell empty-cell"></div>
      {:else}
        {@const colors = getDayColors(day)}
        {@const { emojis, extra } = getDayEventEmojis(day)}
        <button
          class="cell day-cell"
          class:today={isToday(day)}
          class:has-entries={getEntryCount(day) > 0}
          class:selected={selectedDay === getDayKey(day)}
          onclick={() => selectDay(day)}
        >
          {#if colors.length > 0}
            <div class="day-strips">
              {#each colors as color}
                <div class="day-strip" style="background: {color}"></div>
              {/each}
            </div>
          {/if}
          <span class="day-num">{day}</span>
          {#if emojis.length > 0}
            <div class="event-emojis">
              {#each emojis as emoji}
                <span class="event-emoji">{emoji}</span>
              {/each}
              {#if extra > 0}
                <span class="event-extra">+{extra}</span>
              {/if}
            </div>
          {/if}
        </button>
      {/if}
    {/each}
  </div>

  {#if selectedDay && selectedItems.length > 0}
    <div class="selected-entries">
      <h3 class="selected-date-label">{formatDate(selectedDay + 'T00:00:00')}</h3>
      {#each selectedItems as item (item.data.id)}
        {#if item.kind === 'entry'}
          <EntryCard entry={item.data} {onDelete} {onEdit} />
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
  .calendar {
    padding: var(--space-md);
  }

  .month-nav {
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

  .month-label {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-primary);
  }

  .day-names {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: var(--space-sm);
  }

  .day-name {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: var(--radius-sm);
  }

  .day-cell {
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font);
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
  }

  .day-strips {
    position: absolute;
    inset: 2px;
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .day-strip {
    flex: 1;
  }

  .day-num {
    position: relative;
    font-size: var(--text-sm);
    color: var(--text-primary);
    z-index: 1;
  }

  .day-cell.today .day-num {
    font-weight: 600;
    color: var(--accent);
  }

  .day-cell.selected {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .event-emojis {
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 1px;
    z-index: 1;
  }

  .event-emoji {
    font-size: 0.55rem;
    line-height: 1;
  }

  .event-extra {
    font-size: 0.5rem;
    color: var(--text-muted);
    line-height: 1;
  }

  .selected-entries {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border);
  }

  .selected-date-label {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-secondary);
  }
</style>
