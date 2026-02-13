<script lang="ts">
  import type { TrendRange } from '../lib/types';
  import { entries } from '../lib/stores/entries';
  import MoodChart from '../components/MoodChart.svelte';

  let range: TrendRange = $state('week');

  const ranges: { value: TrendRange; label: string }[] = [
    { value: 'week', label: '7 days' },
    { value: 'month', label: '30 days' },
    { value: '3month', label: '3 months' },
  ];

  let totalEntries = $derived($entries.length);
  let avgMood = $derived(() => {
    if ($entries.length === 0) return 0;
    return Math.round(($entries.reduce((s, e) => s + e.mood, 0) / $entries.length) * 10) / 10;
  });
  // let avgValence = $derived(() => {
  //   if ($entries.length === 0) return 0;
  //   return Math.round(($entries.reduce((s, e) => s + e.valence, 0) / $entries.length) * 10) / 10;
  // });
  // let avgEnergy = $derived(() => {
  //   if ($entries.length === 0) return 0;
  //   return Math.round(($entries.reduce((s, e) => s + e.energy, 0) / $entries.length) * 10) / 10;
  // });
</script>

<div class="trends">
  <header class="trends-header">
    <h1 class="title">Trends</h1>
  </header>

  <div class="stats-row">
    <div class="stat">
      <span class="stat-value">{totalEntries}</span>
      <span class="stat-label">entries</span>
    </div>
    <div class="stat">
      <span class="stat-value" style="color: var(--accent)">{avgMood() > 0 ? '+' : ''}{avgMood()}</span>
      <span class="stat-label">avg mood</span>
    </div>
    <!-- <div class="stat">
      <span class="stat-value" style="color: var(--accent)">{avgValence() > 0 ? '+' : ''}{avgValence()}</span>
      <span class="stat-label">avg valence</span>
    </div>
    <div class="stat">
      <span class="stat-value" style="color: var(--accent-alt)">{avgEnergy() > 0 ? '+' : ''}{avgEnergy()}</span>
      <span class="stat-label">avg energy</span>
    </div> -->
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
</style>
