<script lang="ts">
  import { eventTypes } from '../lib/stores/eventTypes';
  import { DEFAULT_EVENT_TYPES, ICON_OPTIONS } from '../lib/data/eventTypes';
  import EventIcon from '../components/EventIcon.svelte';

  let { onBack }: { onBack: () => void } = $props();

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
    const id = 'custom-' + Date.now();
    eventTypes.addEventType({ id, name, emoji, isCustom: true });
    newEmoji = '';
    newName = '';
  }
</script>

<div class="sub-page">
  <header class="sub-header">
    <button class="back-btn" onclick={onBack} aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <h1 class="title">Event types</h1>
  </header>

  <div class="content">
    <div class="event-type-list">
      {#each $eventTypes as type (type.id)}
        <div class="event-type-row">
          <button
            class="event-type-icon-btn"
            onclick={() => pickerOpenFor = pickerOpenFor === type.id ? null : type.id}
            aria-label="Change icon for {type.name}"
            title="Change icon"
          ><EventIcon name={type.emoji ?? 'Star'} size={18} /></button>
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
              ><EventIcon name={icon} size={16} /></button>
            {/each}
          </div>
        {/if}
      {/each}
    </div>

    <div class="add-type-form">
      <button
        class="event-type-icon-btn"
        onclick={() => pickerOpenFor = pickerOpenFor === 'new' ? null : 'new'}
        aria-label="Pick icon"
        title="Pick icon"
      >
        {#if newEmoji}
          <EventIcon name={newEmoji} size={18} />
        {:else}
          <span class="icon-placeholder">+</span>
        {/if}
      </button>
      <input
        type="text"
        class="name-input"
        placeholder="Event name"
        bind:value={newName}
        maxlength="40"
      />
      <button class="btn btn-secondary" onclick={addCustomType}>Add</button>
    </div>
    {#if pickerOpenFor === 'new'}
      <div class="icon-picker new-icon-picker">
        {#each ICON_OPTIONS as icon}
          <button
            class="icon-option"
            class:active={newEmoji === icon}
            onclick={() => { newEmoji = icon; pickerOpenFor = null; }}
          ><EventIcon name={icon} size={16} /></button>
        {/each}
      </div>
    {/if}
    {#if addError}
      <p class="add-error">{addError}</p>
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

  .back-btn:active { background: var(--bg-subtle); }

  .title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .content {
    padding: 0 var(--space-md);
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

  .event-type-icon-btn:active { background: var(--bg-subtle); }

  .icon-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: var(--space-sm) 0;
    padding-left: 36px;
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

  .icon-option:active { background: var(--border); }

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

  .toggle input:checked + .toggle-slider { background: var(--accent); }
  .toggle input:checked + .toggle-slider::before { transform: translateX(16px); }

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

  .remove-type-btn:active { color: #c44; }

  .add-type-form {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
  }

  .icon-placeholder {
    font-size: 1rem;
    color: var(--text-muted);
    line-height: 1;
  }

  .new-icon-picker { padding-left: 0; }

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

  .add-error {
    margin-top: var(--space-xs);
    font-size: 0.75rem;
    color: #dc5050;
  }
</style>
