<script lang="ts">
  import { entries } from '../lib/stores/entries';
  import { exportToJSON } from '../lib/utils/export';
  import { parseImportFile } from '../lib/utils/import';
  import type { EmotionEntry, EventType } from '../lib/types';
  import { eventTypes } from '../lib/stores/eventTypes';
  import { DEFAULT_EVENT_TYPES, ICON_OPTIONS } from '../lib/data/eventTypes';

  const defaultIds = new Set(DEFAULT_EVENT_TYPES.map(t => t.id));

  let newEmoji = $state('');
  let newName = $state('');
  let addError = $state('');
  let pickerOpenFor = $state<string | null>(null);

  function addCustomType() {
    addError = '';
    const emoji = newEmoji.trim();
    const name = newName.trim();
    if (!name) { addError = 'Name is required.'; return; }
    if (emoji && [...emoji].length > 2) { addError = 'Use 1–2 emoji characters.'; return; }
    const id = 'custom-' + Date.now();
    eventTypes.addEventType({ id, name, emoji, isCustom: true });
    newEmoji = '';
    newName = '';
  }

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

  <section class="section" style="margin-top: var(--space-xl)">
    <h2 class="section-title">Event types</h2>

    <div class="event-type-list">
      {#each $eventTypes as type (type.id)}
        <div class="event-type-row">
          <button
            class="event-type-icon-btn"
            onclick={() => pickerOpenFor = pickerOpenFor === type.id ? null : type.id}
            aria-label="Change icon for {type.name}"
            title="Change icon"
          >{type.emoji || '★'}</button>
          <span class="event-type-name">{type.name}</span>
          <label class="toggle" aria-label="Show {type.name}">
            <input
              type="checkbox"
              checked={type.visible !== false}
              onchange={(e) => eventTypes.setVisibility(type.id, e.currentTarget.checked)}
            />
            <span class="toggle-slider"></span>
          </label>
          {#if !defaultIds.has(type.id)}
            <button
              class="remove-type-btn"
              onclick={() => eventTypes.removeEventType(type.id)}
              aria-label="Remove {type.name}"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          {/if}
        </div>
        {#if pickerOpenFor === type.id}
          <div class="icon-picker">
            {#each ICON_OPTIONS as icon}
              <button
                class="icon-option"
                class:active={type.emoji === icon}
                onclick={() => { eventTypes.setEmoji(type.id, icon); pickerOpenFor = null; }}
              >{icon}</button>
            {/each}
          </div>
        {/if}
      {/each}
    </div>

    <div class="add-type-form">
      <input
        type="text"
        class="emoji-input"
        placeholder="★"
        bind:value={newEmoji}
        maxlength="4"
      />
      <input
        type="text"
        class="name-input"
        placeholder="Event name"
        bind:value={newName}
        maxlength="40"
      />
      <button class="btn btn-secondary" onclick={addCustomType}>Add</button>
    </div>
    <div class="icon-quick-pick">
      {#each ICON_OPTIONS.slice(0, 5) as icon}
        <button
          class="icon-option"
          class:active={newEmoji === icon}
          onclick={() => newEmoji = newEmoji === icon ? '' : icon}
        >{icon}</button>
      {/each}
    </div>
    {#if addError}
      <p class="add-error">{addError}</p>
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

  .event-type-list {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--space-md);
  }

  .event-type-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--border);
  }

  .event-type-icon-btn {
    font-size: 1.1rem;
    width: 28px;
    text-align: center;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    -webkit-tap-highlight-color: transparent;
    line-height: 1;
  }

  .event-type-icon-btn:active {
    background: var(--bg-subtle);
  }

  .icon-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: var(--space-sm) 0;
    padding-left: 36px;
  }

  .icon-quick-pick {
    display: flex;
    gap: 4px;
    margin-top: var(--space-xs);
  }

  .icon-option {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-subtle);
    border: 1.5px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 1rem;
    color: var(--text-primary);
    -webkit-tap-highlight-color: transparent;
  }

  .icon-option.active {
    border-color: var(--accent);
    background: rgba(196, 132, 108, 0.08);
  }

  .icon-option:active {
    background: var(--border);
  }

.toggle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .toggle-slider {
    position: absolute;
    inset: 0;
    background: var(--border);
    border-radius: 20px;
    transition: background 0.2s ease;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  .toggle input:checked + .toggle-slider {
    background: var(--accent);
  }

  .toggle input:checked + .toggle-slider::before {
    transform: translateX(16px);
  }

  .event-type-name {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .remove-type-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
  }

  .remove-type-btn:active {
    color: #c44;
  }

  .add-type-form {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
  }

  .emoji-input {
    width: 52px;
    padding: var(--space-sm);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: var(--text-base);
    text-align: center;
    flex-shrink: 0;
  }

  .emoji-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .name-input {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: var(--text-sm);
    min-width: 0;
  }

  .name-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .add-error {
    margin-top: var(--space-xs);
    font-size: 0.75rem;
    color: #dc5050;
  }
</style>
