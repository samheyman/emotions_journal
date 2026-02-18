<script lang="ts">
  import { entries } from '../lib/stores/entries';
  import { exportToJSON } from '../lib/utils/export';
  import { parseImportFile } from '../lib/utils/import';
  import type { EmotionEntry } from '../lib/types';

  type ImportState =
    | { step: 'idle' }
    | { step: 'confirming'; newEntries: EmotionEntry[]; duplicates: number; discarded: number }
    | { step: 'done'; added: number };

  let importState: ImportState = $state({ step: 'idle' });
  let fileInput: HTMLInputElement | undefined = $state();
  let errorMsg: string = $state('');

  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    errorMsg = '';

    try {
      const { valid, discarded } = await parseImportFile(file);

      if (valid.length === 0) {
        errorMsg = discarded > 0
          ? `No valid entries found (${discarded} discarded).`
          : 'The file contains no entries.';
        return;
      }

      const existingIds = new Set($entries.map((e) => e.id));
      const newEntries = valid.filter((e) => !existingIds.has(e.id));
      const duplicates = valid.length - newEntries.length;

      if (newEntries.length === 0) {
        errorMsg = `All ${valid.length} entries are duplicates. Nothing to import.`;
        return;
      }

      importState = { step: 'confirming', newEntries, duplicates, discarded };
    } catch {
      errorMsg = 'Could not read file. Make sure it is a valid JSON export.';
    } finally {
      // Reset input so the same file can be re-selected
      input.value = '';
    }
  }

  function confirmImport() {
    if (importState.step !== 'confirming') return;
    const count = importState.newEntries.length;
    entries.importEntries(importState.newEntries);
    importState = { step: 'done', added: count };
    setTimeout(() => {
      importState = { step: 'idle' };
    }, 2500);
  }

  function cancelImport() {
    importState = { step: 'idle' };
    errorMsg = '';
  }
</script>

<div class="settings">
  <header class="settings-header">
    <h1 class="title">Settings</h1>
  </header>

  <section class="section">
    <h2 class="section-title">Data</h2>

    <div class="action-row">
      <div class="action-info">
        <span class="action-label">Export data</span>
        <span class="action-desc">Download all entries as JSON</span>
      </div>
      <button class="btn btn-secondary" onclick={() => exportToJSON($entries)}>Export</button>
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

    <input
      bind:this={fileInput}
      type="file"
      accept=".json"
      class="hidden-input"
      onchange={handleFile}
    />

    {#if errorMsg}
      <div class="import-msg error">{errorMsg}</div>
    {/if}

    {#if importState.step === 'confirming'}
      <div class="confirm-box">
        <p class="confirm-text">
          <strong>{importState.newEntries.length}</strong> new {importState.newEntries.length === 1 ? 'entry' : 'entries'} will be added{#if importState.duplicates > 0} ({importState.duplicates} {importState.duplicates === 1 ? 'duplicate' : 'duplicates'} skipped){/if}{#if importState.discarded > 0}, {importState.discarded} discarded{/if}. Continue?
        </p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" onclick={cancelImport}>Cancel</button>
          <button class="btn btn-primary" onclick={confirmImport}>Import</button>
        </div>
      </div>
    {/if}

    {#if importState.step === 'done'}
      <div class="import-msg success">
        Successfully added {importState.added} {importState.added === 1 ? 'entry' : 'entries'}.
      </div>
    {/if}
  </section>
</div>

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

  .section {
    padding: 0 var(--space-md);
  }

  .section-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
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

  .btn-secondary:active {
    background: var(--border);
  }

  .btn-primary {
    background: var(--accent);
    color: white;
  }

  .btn-primary:active {
    opacity: 0.85;
  }

  .btn-ghost {
    background: none;
    color: var(--text-muted);
  }

  .hidden-input {
    display: none;
  }

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

  .import-msg.error {
    background: rgba(220, 80, 80, 0.1);
    color: #dc5050;
  }

  .import-msg.success {
    background: rgba(80, 180, 100, 0.1);
    color: #50b464;
  }
</style>
