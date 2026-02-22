<script lang="ts">
  import { onMount } from 'svelte';
  import type { View, EmotionEntry, LoggedEvent } from './lib/types';
  import { entries } from './lib/stores/entries';
  import { events } from './lib/stores/events';
  import HomeView from './views/HomeView.svelte';
  import CheckInView from './views/CheckInView.svelte';
  import AddEventView from './views/AddEventView.svelte';
  import TrendsView from './views/TrendsView.svelte';
  import SettingsView from './views/SettingsView.svelte';

  let currentView: View = $state('home');
  let editingEntry: EmotionEntry | undefined = $state(undefined);
  let editingEvent: LoggedEvent | undefined = $state(undefined);

  onMount(() => {
    history.pushState(null, '');

    function handlePopState() {
      history.pushState(null, ''); // re-push so back never closes the app
      if (currentView !== 'home') {
        editingEntry = undefined;
        editingEvent = undefined;
        currentView = 'home';
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  });

  function navigate(view: View) {
    currentView = view;
  }

  function startEdit(id: string) {
    editingEntry = $entries.find(e => e.id === id);
    if (editingEntry) navigate('checkin');
  }

  function finishCheckIn() {
    editingEntry = undefined;
    navigate('home');
  }

  function startEditEvent(id: string) {
    editingEvent = $events.find(e => e.id === id);
    if (editingEvent) navigate('addevent');
  }

  function finishEvent() {
    editingEvent = undefined;
    navigate('home');
  }

</script>

<div class="app-shell">
  <main class="main-content">
    {#if currentView === 'home'}
      <HomeView onStartCheckIn={() => navigate('checkin')} onStartEvent={() => navigate('addevent')} onEdit={startEdit} onEditEvent={startEditEvent} />
    {:else if currentView === 'checkin'}
      <CheckInView onComplete={finishCheckIn} onCancel={finishCheckIn} editingEntry={editingEntry} />
    {:else if currentView === 'addevent'}
      <AddEventView onComplete={finishEvent} onCancel={finishEvent} editingEvent={editingEvent} />
    {:else if currentView === 'trends'}
      <TrendsView />
    {:else if currentView === 'settings'}
      <SettingsView />
    {/if}
  </main>
</div>

  {#if currentView !== 'checkin' && currentView !== 'addevent'}
    <nav class="navbar">
      <button
        class="nav-item"
        class:active={currentView === 'home'}
        onclick={()=> navigate('home')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19V9l8-6 8 6v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>
          <path d="M9 19v-6h6v6"/>
        </svg>
        <span>Journal</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'trends'}
        onclick={() => navigate('trends')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span>Trends</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'settings'}
        onclick={() => navigate('settings')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Settings</span>
      </button>
    </nav>
  {/if}

<style>
  .app-shell {
    max-width: 428px;
    margin: 0 auto;
    width: 100%;
    min-height: 100dvh;
  }

  .main-content {
    padding-bottom: 72px;
  }

  .navbar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    padding: var(--space-sm) 0;
    padding-bottom: calc(var(--space-sm) + env(safe-area-inset-bottom));
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 428px;
    margin: 0 auto;
    z-index: 100;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-family: var(--font);
    font-size: 0.75rem;
    cursor: pointer;
    padding: var(--space-xs) var(--space-lg);
    border-radius: var(--radius-sm);
    transition: color 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item.active {
    color: var(--accent);
  }

  .nav-item:active {
    transform: scale(0.95);
  }
</style>
