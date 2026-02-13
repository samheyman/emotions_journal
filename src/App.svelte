<script lang="ts">
  import type { View } from './lib/types';
  import HomeView from './views/HomeView.svelte';
  import CheckInView from './views/CheckInView.svelte';
  import TrendsView from './views/TrendsView.svelte';

  let currentView: View = $state('home');

  function navigate(view: View) {
    currentView = view;
  }
</script>

<div class="app-shell">
  <main class="main-content">
    {#if currentView === 'home'}
      <HomeView onStartCheckIn={() => navigate('checkin')} />
    {:else if currentView === 'checkin'}
      <CheckInView onComplete={() => navigate('home')} onCancel={() => navigate('home')} />
    {:else if currentView === 'trends'}
      <TrendsView />
    {/if}
  </main>
</div>

{#if currentView !== 'checkin'}
  <nav class="navbar">
    <button
      class="nav-item"
      class:active={currentView === 'home'}
      onclick={() => navigate('home')}
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
