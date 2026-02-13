<script lang="ts">
  let {
    note = $bindable(''),
  }: {
    note: string;
  } = $props();
</script>

<div class="note-input">
  <p class="hint">Anything else on your mind? <span class="optional">(optional)</span></p>

  <textarea
    bind:value={note}
    placeholder="Write a few words..."
    rows="4"
    maxlength="500"
  ></textarea>

  {#if note.length > 0}
    <span class="char-count">{note.length}/500</span>
  {/if}
</div>

<style>
  .note-input {
    width: 100%;
    position: relative;
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
  }

  .optional {
    color: var(--text-muted);
  }

  textarea {
    width: 100%;
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: var(--text-base);
    line-height: 1.5;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s ease;
  }

  textarea:focus {
    outline: none;
    border-color: var(--accent);
  }

  textarea::placeholder {
    color: var(--text-muted);
  }

  .char-count {
    position: absolute;
    bottom: var(--space-sm);
    right: var(--space-md);
    font-size: 0.75rem;
    color: var(--text-muted);
  }
</style>
