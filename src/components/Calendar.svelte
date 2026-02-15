<script lang="ts">
  import type { EmotionEntry } from '../lib/types';
  import { getDaysInMonth, getFirstDayOfMonth, formatMonthYear, dateKey } from '../lib/utils/dates';
  import EntryCard from './EntryCard.svelte';

  let { entries, onDelete }: { entries: EmotionEntry[]; onDelete: (id: string) => void } = $props();

  let year = $state(new Date().getFullYear());
  let month = $state(new Date().getMonth());
  let selectedDay: string | null = $state(null);

  let entriesByDate = $derived(() => {
    const map = new Map<string, EmotionEntry[]>();
    for (const entry of entries) {
      const d = new Date(entry.timestamp);
      const key = dateKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  });

  let daysInMonth = $derived(getDaysInMonth(year, month));
  let firstDay = $derived(getFirstDayOfMonth(year, month));
  let monthLabel = $derived(formatMonthYear(year, month));
  let dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let days = $derived(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= daysInMonth; i++) result.push(i);
    return result;
  });

  let selectedEntries = $derived(() => {
    if (!selectedDay) return [];
    return (entriesByDate().get(selectedDay) || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

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

  function getDayColor(day: number): string {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entriesByDate().get(key);
    if (!dayEntries || dayEntries.length === 0) return 'transparent';

    const avgMood = dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length;
    const t = (avgMood - 1) / 6; // 0 to 1
    // Warm (green-ish) for high mood, cool (blue-gray) for low mood
    const r = Math.round(107 + t * 105);
    const g = Math.round(129 + t * 40);
    const b = Math.round(154 - t * 82);
    const alpha = Math.min(0.8, 0.3 + dayEntries.length * 0.15);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getDayKey(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getEntryCount(day: number): number {
    return entriesByDate().get(getDayKey(day))?.length || 0;
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
    {#each days() as day}
      {#if day === null}
        <div class="cell empty-cell"></div>
      {:else}
        <button
          class="cell day-cell"
          class:today={isToday(day)}
          class:has-entries={getEntryCount(day) > 0}
          class:selected={selectedDay === getDayKey(day)}
          onclick={() => selectDay(day)}
        >
          <div class="day-bg" style="background: {getDayColor(day)}"></div>
          <span class="day-num">{day}</span>
          {#if getEntryCount(day) > 0}
            <span class="entry-dot"></span>
          {/if}
        </button>
      {/if}
    {/each}
  </div>

  {#if selectedDay && selectedEntries().length > 0}
    <div class="selected-entries">
      {#each selectedEntries() as entry (entry.id)}
        <EntryCard {entry} {onDelete} />
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

  .day-bg {
    position: absolute;
    inset: 2px;
    border-radius: var(--radius-sm);
    transition: background 0.2s ease;
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

  .entry-dot {
    position: relative;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--accent);
    z-index: 1;
    margin-top: 1px;
  }

  .selected-entries {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border);
  }
</style>
