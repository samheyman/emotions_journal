<script lang="ts">
  import SettingsDataView from './SettingsDataView.svelte';
  import SettingsMoodColorsView from './SettingsMoodColorsView.svelte';
  import SettingsEventTypesView from './SettingsEventTypesView.svelte';

  type SettingsPage = 'hub' | 'data' | 'moodColors' | 'eventTypes';
  let page = $state<SettingsPage>('hub');
</script>

{#if page === 'data'}
  <SettingsDataView onBack={() => page = 'hub'} />
{:else if page === 'moodColors'}
  <SettingsMoodColorsView onBack={() => page = 'hub'} />
{:else if page === 'eventTypes'}
  <SettingsEventTypesView onBack={() => page = 'hub'} />
{:else}
  <div class="settings">
    <header class="settings-header">
      <h1 class="title">Settings</h1>
    </header>

    <div class="menu">
      <button class="menu-item" onclick={() => page = 'moodColors'}>
        <div class="menu-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
          </svg>
        </div>
        <div class="menu-text">
          <span class="menu-label">Mood colors</span>
          <span class="menu-desc">Customise positive, neutral and negative colors</span>
        </div>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <button class="menu-item" onclick={() => page = 'eventTypes'}>
        <div class="menu-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
          </svg>
        </div>
        <div class="menu-text">
          <span class="menu-label">Event types</span>
          <span class="menu-desc">Manage and create custom event types</span>
        </div>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <button class="menu-item" onclick={() => page = 'data'}>
        <div class="menu-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div class="menu-text">
          <span class="menu-label">Data</span>
          <span class="menu-desc">Export and import your entries</span>
        </div>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  .settings {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .settings-header {
    padding: var(--space-lg) var(--space-md);
    padding-top: calc(var(--space-lg) + env(safe-area-inset-top));
  }

  .title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .menu {
    padding: 0 var(--space-md);
    display: flex;
    flex-direction: column;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border: none;
    background: none;
    cursor: pointer;
    font-family: var(--font);
    text-align: left;
    border-bottom: 1px solid var(--border);
    -webkit-tap-highlight-color: transparent;
    width: 100%;
  }

  .menu-item:active .menu-label {
    opacity: 0.6;
  }

  .menu-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--bg-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .menu-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .menu-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .menu-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .chevron {
    color: var(--text-muted);
    flex-shrink: 0;
  }
</style>
