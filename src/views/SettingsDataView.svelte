<script lang="ts">
  import { entries } from '../lib/stores/entries';
  import { events } from '../lib/stores/events';
  import { exportToJSON } from '../lib/utils/export';
  import { parseImportFile } from '../lib/utils/import';
  import type { EmotionEntry, LoggedEvent, EventType } from '../lib/types';
  import { eventTypes } from '../lib/stores/eventTypes';

  let { onBack }: { onBack: () => void } = $props();

  type ImportState =
    | { step: 'idle' }
    | { step: 'confirming'; newEntries: EmotionEntry[]; newEvents: LoggedEvent[]; newEventTypes: EventType[]; dupEntries: number; dupEvents: number; discardedEntries: number; discardedEvents: number }
    | { step: 'done'; addedEntries: number; addedEvents: number; addedEventTypes: number };

  let importState: ImportState = $state({ step: 'idle' });
  let fileInput: HTMLInputElement | undefined = $state();
  let errorMsg: string = $state('');

  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    errorMsg = '';
    try {
      const { validEntries, validEvents, validEventTypes, discardedEntries, discardedEvents } = await parseImportFile(file);
      if (validEntries.length === 0 && validEvents.length === 0) {
        const totalDiscarded = discardedEntries + discardedEvents;
        errorMsg = totalDiscarded > 0
          ? `No valid records found (${totalDiscarded} discarded).`
          : 'The file contains no entries or events.';
        return;
      }
      const existingEntryIds = new Set($entries.map((e) => e.id));
      const newEntries = validEntries.filter((e) => !existingEntryIds.has(e.id));
      const dupEntries = validEntries.length - newEntries.length;
      const existingEventIds = new Set($events.map((e) => e.id));
      const newEvents = validEvents.filter((e) => !existingEventIds.has(e.id));
      const dupEvents = validEvents.length - newEvents.length;
      if (newEntries.length === 0 && newEvents.length === 0) {
        errorMsg = 'All records are duplicates. Nothing to import.';
        return;
      }
      const existingEventTypeIds = new Set($eventTypes.map((t) => t.id));
      const newEventTypes = validEventTypes.filter((t) => !existingEventTypeIds.has(t.id));
      importState = { step: 'confirming', newEntries, newEvents, newEventTypes, dupEntries, dupEvents, discardedEntries, discardedEvents };
    } catch {
      errorMsg = 'Could not read file. Make sure it is a valid JSON export.';
    } finally {
      input.value = '';
    }
  }

  function confirmImport() {
    if (importState.step !== 'confirming') return;
    const addedEntries = importState.newEntries.length;
    const addedEvents = importState.newEvents.length;
    const addedEventTypes = importState.newEventTypes.length;
    entries.importEntries(importState.newEntries);
    events.importEvents(importState.newEvents);
    eventTypes.importEventTypes(importState.newEventTypes);
    importState = { step: 'done', addedEntries, addedEvents, addedEventTypes };
    setTimeout(() => { importState = { step: 'idle' }; }, 2500);
  }

  function cancelImport() {
    importState = { step: 'idle' };
    errorMsg = '';
  }
</script>

<div class="sub-page">
  <header class="sub-header">
    <button class="back-btn" onclick={onBack} aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <h1 class="title">Data</h1>
  </header>

  <div class="content">
    <div class="action-row">
      <div class="action-info">
        <span class="action-label">Export data</span>
        <span class="action-desc">Download all entries as JSON</span>
      </div>
      <button class="btn btn-secondary" onclick={() => exportToJSON($entries, $events, $eventTypes.filter(t => t.isCustom))}>Export</button>
    </div>

    <div class="action-row">
      <div class="action-info">
        <span class="action-label">Import data</span>
        <span class="action-desc">Restore entries from a JSON export</span>
      </div>
      {#if importState.step === 'idle'}
        <button class="btn btn-secondary" onclick={() => fileInput?.click()}>Import</button>
      {/if}
    </div>

    <input bind:this={fileInput} type="file" accept=".json" class="hidden-input" onchange={handleFile} />

    {#if errorMsg}
      <div class="import-msg error">{errorMsg}</div>
    {/if}

    {#if importState.step === 'confirming'}
      <div class="confirm-box">
        <p class="confirm-text">
          {#if importState.newEntries.length > 0}<strong>{importState.newEntries.length}</strong> new {importState.newEntries.length === 1 ? 'entry' : 'entries'}{/if}{#if importState.newEntries.length > 0 && importState.newEvents.length > 0} and {/if}{#if importState.newEvents.length > 0}<strong>{importState.newEvents.length}</strong> new {importState.newEvents.length === 1 ? 'event' : 'events'}{/if} will be added.{#if importState.dupEntries + importState.dupEvents > 0} {importState.dupEntries + importState.dupEvents} {importState.dupEntries + importState.dupEvents === 1 ? 'duplicate' : 'duplicates'} skipped.{/if} Continue?
        </p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" onclick={cancelImport}>Cancel</button>
          <button class="btn btn-primary" onclick={confirmImport}>Import</button>
        </div>
      </div>
    {/if}

    {#if importState.step === 'done'}
      <div class="import-msg success">
        Successfully added {importState.addedEntries} {importState.addedEntries === 1 ? 'entry' : 'entries'}, {importState.addedEvents} {importState.addedEvents === 1 ? 'event' : 'events'}{importState.addedEventTypes > 0 ? `, and ${importState.addedEventTypes} custom event ${importState.addedEventTypes === 1 ? 'type' : 'types'}` : ''}.
      </div>
    {/if}
  </div>
</div>

<style>
  .sub-page {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .sub-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-md);
    padding-top: calc(var(--space-lg) + env(safe-area-inset-top));
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    margin-left: -4px;
  }

  .back-btn:active {
    background: var(--bg-subtle);
  }

  .title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .content {
    padding: 0 var(--space-md);
  }

  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--border);
  }

  .action-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .action-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .action-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .btn {
    border: none;
    cursor: pointer;
    font-family: var(--font);
    font-size: var(--text-sm);
    font-weight: 500;
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-md);
    -webkit-tap-highlight-color: transparent;
  }

  .btn-secondary {
    background: var(--bg-subtle);
    color: var(--text-primary);
  }

  .btn-secondary:active { background: var(--border); }

  .btn-primary {
    background: var(--accent);
    color: white;
  }

  .btn-primary:active { opacity: 0.85; }

  .btn-ghost {
    background: none;
    color: var(--text-muted);
  }

  .hidden-input { display: none; }

  .confirm-box {
    margin-top: var(--space-md);
    padding: var(--space-md);
    background: var(--bg-subtle);
    border-radius: var(--radius-md);
  }

  .confirm-text {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: var(--space-md);
    line-height: 1.5;
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }

  .import-msg {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
  }

  .import-msg.error { background: rgba(220, 80, 80, 0.1); color: #dc5050; }
  .import-msg.success { background: rgba(80, 180, 100, 0.1); color: #50b464; }
</style>
