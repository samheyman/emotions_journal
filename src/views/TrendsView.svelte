<script lang="ts">
  import type { TrendRange } from '../lib/types';
  import { entries } from '../lib/stores/entries';
  import { events } from '../lib/stores/events';
  import { eventTypes } from '../lib/stores/eventTypes';
  import MoodChart from '../components/MoodChart.svelte';

  let range: TrendRange = $state('week');
  let trendsTab: 'mood' | 'events' = $state('mood');

  const ranges: { value: TrendRange; label: string }[] = [
    { value: 'week', label: '7 days' },
    { value: 'month', label: '30 days' },
    { value: '3month', label: '3 months' },
  ];

  let totalEntries = $derived($entries.length);
  let avgMood = $derived(() => {
    if ($entries.length === 0) return 0;
    return Math.round(($entries.reduce((s, e: any) => {
      if (typeof e.valence === 'number' && !isNaN(e.valence)) return s + e.valence;
      if (typeof e.mood === 'number' && !isNaN(e.mood)) return s + (e.mood - 4);
      return s;
    }, 0) / $entries.length) * 10) / 10;
  });

  interface EventStat {
    typeId: string;
    emoji: string;
    name: string;
    count: number;
    avgDaysBetween: number | null;
    lastOccurrence: string | null;
  }

  let eventStats = $derived((): EventStat[] => {
    const stats: EventStat[] = [];
    for (const type of $eventTypes) {
      const typeEvents = $events.filter(e => e.typeId === type.id);
      if (typeEvents.length === 0) continue;

      const sorted = [...typeEvents].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      let avgDaysBetween: number | null = null;
      if (sorted.length > 1) {
        let totalMs = 0;
        for (let i = 1; i < sorted.length; i++) {
          totalMs += new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime();
        }
        const avgMs = totalMs / (sorted.length - 1);
        avgDaysBetween = Math.round(avgMs / (1000 * 60 * 60 * 24));
      }

      const last = sorted[sorted.length - 1];
      const lastDate = new Date(last.timestamp).toLocaleDateString([], {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      stats.push({
        typeId: type.id,
        emoji: type.emoji,
        name: type.name,
        count: typeEvents.length,
        avgDaysBetween,
        lastOccurrence: lastDate,
      });
    }
    return stats.sort((a, b) => b.count - a.count);
  });
</script>

<div class="trends">
  <header class="trends-header">
    <h1 class="title">Trends</h1>
  </header>

  <div class="trends-tabs">
    <button
      class="trends-tab"
      class:active={trendsTab === 'mood'}
      onclick={() => trendsTab = 'mood'}
    >Mood</button>
    <button
      class="trends-tab"
      class:active={trendsTab === 'events'}
      onclick={() => trendsTab = 'events'}
    >Events</button>
  </div>

  {#if trendsTab === 'mood'}
    <div class="stats-row">
      <div class="stat">
        <span class="stat-value">{totalEntries}</span>
        <span class="stat-label">entries</span>
      </div>
      <div class="stat">
        <span class="stat-value" style="color: var(--accent)">{avgMood() > 0 ? '+' : ''}{avgMood()}</span>
        <span class="stat-label">avg mood</span>
      </div>
    </div>

    <div class="range-toggle">
      {#each ranges as r}
        <button
          class="range-btn"
          class:active={range === r.value}
          onclick={() => range = r.value}
        >
          {r.label}
        </button>
      {/each}
    </div>

    <div class="chart-section">
      {#if totalEntries === 0}
        <div class="empty">
          <p class="empty-text">No data yet</p>
          <p class="empty-hint">Complete some check-ins to see your trends</p>
        </div>
      {:else}
        <MoodChart entries={$entries} {range} />
      {/if}
    </div>
  {:else}
    <div class="events-section">
      {#if eventStats().length === 0}
        <div class="empty">
          <p class="empty-text">No events logged yet</p>
          <p class="empty-hint">Tap + to log your first event</p>
        </div>
      {:else}
        {#each eventStats() as stat (stat.typeId)}
          <div class="event-stat-card">
            <div class="event-stat-left">
              <span class="event-stat-emoji">{stat.emoji}</span>
              <div class="event-stat-info">
                <span class="event-stat-name">{stat.name}</span>
                <div class="event-stat-meta">
                  {#if stat.avgDaysBetween !== null}
                    <span class="event-stat-interval">every {stat.avgDaysBetween} days</span>
                    <span class="event-stat-sep">·</span>
                  {/if}
                  <span class="event-stat-last">last {stat.lastOccurrence}</span>
                </div>
              </div>
            </div>
            <span class="event-stat-count">{stat.count}</span>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .trends {
    padding: var(--space-md);
    padding-top: calc(var(--space-lg) + env(safe-area-inset-top));
  }

  .trends-header {
    margin-bottom: var(--space-lg);
  }

  .title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .trends-tabs {
    display: flex;
    background: var(--bg-subtle);
    border-radius: var(--radius-md);
    padding: 3px;
    margin-bottom: var(--space-lg);
  }

  .trends-tab {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border-radius: calc(var(--radius-md) - 2px);
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .trends-tab.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: var(--shadow);
  }

  .stats-row {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .stat {
    flex: 1;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .range-toggle {
    display: flex;
    background: var(--bg-subtle);
    border-radius: var(--radius-md);
    padding: 3px;
    margin-bottom: var(--space-lg);
  }

  .range-btn {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border-radius: calc(var(--radius-md) - 2px);
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .range-btn.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: var(--shadow);
  }

  .chart-section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .empty {
    padding: var(--space-2xl) var(--space-md);
    text-align: center;
  }

  .empty-text {
    color: var(--text-secondary);
    margin-bottom: var(--space-xs);
  }

  .empty-hint {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .events-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .event-stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
  }

  .event-stat-left {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
    min-width: 0;
  }

  .event-stat-emoji {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .event-stat-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .event-stat-name {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .event-stat-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .event-stat-interval {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .event-stat-sep {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .event-stat-last {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .event-stat-count {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--accent);
    flex-shrink: 0;
  }
</style>
