<script lang="ts">
  import type { HomeTab } from '../lib/types';
  import { entries } from '../lib/stores/entries';

  import Timeline from '../components/Timeline.svelte';
  import Calendar from '../components/Calendar.svelte';

  let { onStartCheckIn }: { onStartCheckIn: () => void } = $props();

  let activeTab: HomeTab = $state('timeline');
</script>

<div class="home">
  <header class="home-header">
    <h1 class="title">Lumidian</h1>
  </header>

  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === 'timeline'}
      onclick={() => activeTab = 'timeline'}
    >
      Timeline
    </button>
    <button
      class="tab"
      class:active={activeTab === 'calendar'}
      onclick={() => activeTab = 'calendar'}
    >
      Calendar
    </button>
  </div>

  <div class="tab-content">
    {#if activeTab === 'timeline'}
      <Timeline entries={$entries} onDelete={(id) => entries.remove(id)} />
    {:else}
      <Calendar entries={$entries} onDelete={(id) => entries.remove(id)} />
    {/if}
  </div>

  <button class="fab" onclick={onStartCheckIn} title="New check-in">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </button>
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding-bottom: var(--space-2xl);
  }

  .home-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-md);
    padding-top: calc(var(--space-lg) + env(safe-area-inset-top));
  }

  .title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

.tabs {
    display: flex;
    padding: 0 var(--space-md);
    gap: var(--space-xs);
    background: var(--bg-subtle);
    margin: 0 var(--space-md);
    border-radius: var(--radius-md);
    padding: 3px;
  }

  .tab {
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

  .tab.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: var(--shadow);
  }

  .tab-content {
    flex: 1;
  }

  .fab {
    position: fixed;
    bottom: calc(80px + env(safe-area-inset-bottom));
    right: var(--space-lg);
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
    z-index: 5;
  }

  .fab:active {
    transform: scale(0.92);
  }

  .fab:hover {
    box-shadow: 0 6px 16px rgba(196, 132, 108, 0.4);
  }
</style>
