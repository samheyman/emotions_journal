<script lang="ts">
  import type { HomeTab } from '../lib/types';
  import { entries } from '../lib/stores/entries';
  import { events } from '../lib/stores/events';

  import Timeline from '../components/Timeline.svelte';
  import Calendar from '../components/Calendar.svelte';

  let { onStartCheckIn, onStartEvent, onEdit, onEditEvent }: {
    onStartCheckIn: () => void;
    onStartEvent: () => void;
    onEdit: (id: string) => void;
    onEditEvent: (id: string) => void;
  } = $props();

  let activeTab: HomeTab = $state('timeline');
  let fabOpen = $state(false);

  function toggleFab() {
    fabOpen = !fabOpen;
  }

  function handleCheckIn() {
    fabOpen = false;
    onStartCheckIn();
  }

  function handleEvent() {
    fabOpen = false;
    onStartEvent();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
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
      <Timeline entries={$entries} events={$events} onDelete={(id) => entries.remove(id)} onDeleteEvent={(id) => events.remove(id)} {onEdit} {onEditEvent} />
    {:else}
      <Calendar entries={$entries} events={$events} onDelete={(id) => entries.remove(id)} onDeleteEvent={(id) => events.remove(id)} {onEdit} {onEditEvent} />
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

    <button class="fab" class:open={fabOpen} onclick={toggleFab} title={fabOpen ? 'Close' : 'Add'}>
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

  .mini-fab-btn:active {
    background: var(--bg-subtle);
  }

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
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .fab:active {
    transform: scale(0.92);
  }

  .fab:hover {
    box-shadow: 0 6px 16px rgba(196, 132, 108, 0.4);
  }
</style>
