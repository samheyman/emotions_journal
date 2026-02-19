<script lang="ts">
  import TagPicker from '../components/TagPicker.svelte';
  import EntryCard from '../components/EntryCard.svelte';
  import { entries } from '../lib/stores/entries';
  import type { EmotionEntry, TimeOfDay } from '../lib/types';
  import ValenceSelect from '../components/ValenceSelect.svelte';
  import EnergySelect from '../components/EnergySelect.svelte';
  import { extractEmotions, extractEmotionsSemantic, getAllEmotionWords } from '../lib/data/emotions';
  import { EMOTIONS } from '../lib/data/emotionsWithValenceAndEnergy';
  import { warmup, isReady, onReady } from '../lib/services/embeddingService';

  const emotionTypeMap = new Map(EMOTIONS.map(e => [e.name, e.type]));
  function isPrimary(name: string): boolean {
    return emotionTypeMap.get(name) === 'primary';
  }

  let { onComplete, onCancel, editingEntry = undefined }: {
    onComplete: () => void;
    onCancel: () => void;
    editingEntry?: EmotionEntry;
  } = $props();

  let isEditing = editingEntry !== undefined;

  let step = $state(1);
  let valence = $state(editingEntry?.valence ?? 0);
  let valenceManuallySet = $state(isEditing);
  let energy = $state(editingEntry?.energy ?? 0);
  let energyManuallySet = $state(isEditing);
  let selectedTags: string[] = $state(editingEntry?.tags ?? []);
  let note = $state(editingEntry?.note ?? '');
  let selectedDate = $state(editingEntry ? new Date(editingEntry.timestamp) : new Date());
  let dateInputEl: HTMLInputElement | undefined = $state();
  let timeOfDay: TimeOfDay = $state(editingEntry?.timeOfDay ?? 'allday');
  let timeDropdownOpen = $state(false);

  const timeOptions: { value: TimeOfDay; label: string }[] = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' },
    { value: 'allday', label: 'All day' },
  ];

  let timeLabel = $derived(timeOptions.find(o => o.value === timeOfDay)!.label);

  let todayStr = new Date().toISOString().slice(0, 10);

  let isToday = $derived(
    selectedDate.toISOString().slice(0, 10) === todayStr
  );

  let dateLabel = $derived(
    isToday ? 'Today' : selectedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  );

  function openDatePicker() {
    dateInputEl?.showPicker();
  }

  function onDateChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (val) {
      const [y, m, d] = val.split('-').map(Number);
      selectedDate = new Date(y, m - 1, d, new Date().getHours(), new Date().getMinutes());
    }
  }

  const totalSteps = 4;

  let canProceed = $derived(true);

  function next() {
    if (step < totalSteps) {
      step++;
    } else {
      save();
    }
  }

  function back() {
    if (step > 1) {
      step--;
    } else {
      onCancel();
    }
  }

  function skip() {
    if (step < totalSteps) {
      step++;
    } else {
      save();
    }
  }

  function generateId(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  function save() {
    if (isEditing && editingEntry) {
      const updated: EmotionEntry = {
        ...editingEntry,
        valence,
        energy,
        emotions: allEmotions,
        tags: selectedTags,
        note,
        timeOfDay,
        timestamp: isToday ? editingEntry.timestamp : selectedDate.toISOString(),
      };
      entries.updateEntry(updated);
    } else {
      const timestamp = isToday ? new Date().toISOString() : selectedDate.toISOString();
      const entry: EmotionEntry = {
        id: generateId(),
        timestamp,
        valence,
        energy,
        emotions: allEmotions,
        tags: selectedTags,
        note,
        timeOfDay,
      };
      entries.add(entry);
    }
    onComplete();
  }

  let stepTitle = $derived(
    step === 1 ? (isEditing ? "Edit entry" : (isToday ? "How are you?" : "What was on your mind?")) :
    step === 2 ? 'Emotional landscape' :
    step === 3 ? 'Triggers / Context' :
    'Preview'
  );

  // Start loading embedding model in background
  warmup();
  let embeddingReady = $state(isReady());
  onReady(() => embeddingReady = true);

  let extractResult = $derived(extractEmotions(note, valence, energy));
  let rawInferredEmotions = $derived(extractResult.results);
  let textMatchedSet = $derived(new Set(extractResult.textMatched));
  let semanticEmotions: string[] = $state([]);
  let semanticMatchedSet: Set<string> = $state(new Set());

  // Run semantic extraction when model is ready or inputs change
  $effect(() => {
    if (!embeddingReady || note.trim().length < 3) {
      semanticEmotions = [];
      semanticMatchedSet = new Set();
      return;
    }
    // Read reactive deps
    const currentNote = note;
    const currentValence = valence;
    const currentEnergy = energy;
    extractEmotionsSemantic(currentNote, currentValence, currentEnergy).then(({ results, semanticMatched }) => {
      semanticEmotions = results;
      semanticMatchedSet = new Set(semanticMatched);
    });
  });
  let dismissedEmotions: string[] = $state([]);
  let manualEmotions: string[] = $state(editingEntry?.emotions ?? []);
  let emotionInput = $state('');
  let showSuggestions = $state(false);

  let mergedInferred = $derived(() => {
    const merged = [...rawInferredEmotions];
    for (const e of semanticEmotions) {
      if (!merged.includes(e)) merged.push(e);
    }
    return merged.slice(0, 7);
  });

  let inferredEmotions = $derived(
    mergedInferred().filter(e => !dismissedEmotions.includes(e))
  );

  let allEmotions = $derived(
    [...new Set([...inferredEmotions, ...manualEmotions])]
  );

  type EmotionSource = 'manual' | 'keyword' | 'semantic' | 'proximity';

  function getEmotionSource(emotion: string): EmotionSource {
    if (manualEmotions.includes(emotion)) return 'manual';
    if (textMatchedSet.has(emotion)) return 'keyword';
    if (semanticMatchedSet.has(emotion)) return 'semantic';
    return 'proximity';
  }

  let primaryEmotions = $derived(allEmotions.filter(e => isPrimary(e)));
  let secondaryEmotions = $derived(allEmotions.filter(e => !isPrimary(e)));

  let previewEntry = $derived<EmotionEntry>({
    id: 'preview',
    timestamp: isToday ? new Date().toISOString() : selectedDate.toISOString(),
    valence,
    energy,
    emotions: allEmotions,
    tags: selectedTags,
    note,
    timeOfDay,
  });

  // Auto-adjust valence if user hasn't manually set sliders, based on text matches
  $effect(() => {
    const currentNote = note;
    if (valenceManuallySet || currentNote.trim().length === 0) return;

    // Only auto-adjust based on keyword/synonym matches, not proximity fills
    const { textMatched } = extractEmotions(currentNote, 0, 0);
    if (textMatched.length === 0) return;

    // Snap valence to the average valence of matched emotions
    const matched = textMatched
      .map(name => EMOTIONS.find(e => e.name === name))
      .filter((e): e is NonNullable<typeof e> => e != null);
    if (matched.length === 0) return;

    const avg = matched.reduce((s, e) => s + e.valence, 0) / matched.length;
    valence = Math.round(avg);
  });





  let suggestions = $derived(() => {
    if (emotionInput.trim().length === 0) return [];
    const q = emotionInput.toLowerCase();
    return getAllEmotionWords()
      .filter(e => e.toLowerCase().startsWith(q) && !allEmotions.includes(e))
      .slice(0, 5);
  });

  function addEmotion(emotion: string) {
    const trimmed = emotion.trim();
    if (trimmed && !allEmotions.includes(trimmed)) {
      manualEmotions = [...manualEmotions, trimmed];
    }
    emotionInput = '';
    showSuggestions = false;
  }

  function removeEmotion(emotion: string) {
    manualEmotions = manualEmotions.filter(e => e !== emotion);
    if (!dismissedEmotions.includes(emotion)) {
      dismissedEmotions = [...dismissedEmotions, emotion];
    }
  }

  function onEmotionKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const suggs = suggestions();
      if (suggs.length > 0) {
        addEmotion(suggs[0]);
      } else if (emotionInput.trim()) {
        addEmotion(emotionInput);
      }
    }
  }

  let isOptionalStep = $derived(false);
</script>

<div class="checkin">
  <header class="checkin-header">
    <button class="back-btn" onclick={back}>
      {#if step === 1}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      {:else}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      {/if}
    </button>
    <div class="progress">
      {#each Array(totalSteps) as _, i}
        <div class="dot" class:active={i < step} class:current={i === step - 1}></div>
      {/each}
    </div>
    <div class="header-spacer"></div>
  </header>

  <div class="step-content">
    <div class="date-row">
      <button class="date-chip" class:past={!isToday} onclick={openDatePicker}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {dateLabel}
      </button>
      <input
        bind:this={dateInputEl}
        type="date"
        class="date-input-hidden"
        max={todayStr}
        value={selectedDate.toISOString().slice(0, 10)}
        onchange={onDateChange}
      />
      <div class="time-dropdown-wrapper">
        <button class="time-chip" onclick={() => timeDropdownOpen = !timeDropdownOpen}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {timeLabel}
          <svg class="chevron" class:open={timeDropdownOpen} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {#if timeDropdownOpen}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="time-dropdown" onclick={(e) => e.stopPropagation()}>
            {#each timeOptions as option}
              <button
                class="time-option"
                class:selected={timeOfDay === option.value}
                onclick={() => { timeOfDay = option.value; timeDropdownOpen = false; }}
              >
                {option.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <h2 class="step-title">{stepTitle}</h2>

    <div class="step-body">
      {#if step === 1}
        <div class="discharge-step">
<div class="intensity-section">
            <p class="intensity-label">How activated or calm do you feel?</p>
            <EnergySelect bind:energy onuserinput={() => energyManuallySet = true} />
          </div>
<div class="intensity-section">
            <p class="intensity-label">What's your mood?</p>
            <ValenceSelect bind:valence onuserinput={() => valenceManuallySet = true} />
          </div>
<p class="intensity-label">What's on your mind?</p>
          <textarea
            bind:value={note}
            placeholder="I am tired and am snapping at everyone..."
            rows="3"
            maxlength="500"
          ></textarea>
          <span class="char-count" class:visible={note.length > 0}>{note.length}/500</span>

          
          

        </div>
      {:else if step === 2}
        <div class="emotions-section">
          <p class="intensity-label">Primary emotions</p>
          {#if primaryEmotions.length > 0}
            <div class="emotion-tags">
              {#each primaryEmotions as emotion}
                {@const source = getEmotionSource(emotion)}
                <button class="emotion-tag primary" class:manual={source === 'manual'} class:keyword={source === 'keyword'} class:semantic={source === 'semantic'} class:proximity={source === 'proximity'} onclick={() => removeEmotion(emotion)}>
                  {emotion}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              {/each}
            </div>
          {:else}
            <span class="empty-emotions">No primary emotions</span>
          {/if}
          <p class="intensity-label" style="margin-top: var(--space-md)">Secondary emotions</p>
          {#if secondaryEmotions.length > 0}
            <div class="emotion-tags">
              {#each secondaryEmotions as emotion}
                {@const source = getEmotionSource(emotion)}
                <button class="emotion-tag" class:manual={source === 'manual'} class:keyword={source === 'keyword'} class:semantic={source === 'semantic'} class:proximity={source === 'proximity'} onclick={() => removeEmotion(emotion)}>
                  {emotion}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              {/each}
            </div>
          {:else}
            <span class="empty-emotions">No secondary emotions</span>
          {/if}
          <div class="emotion-input-wrapper">
            {#if showSuggestions && suggestions().length > 0}
              <div class="suggestions">
                {#each suggestions() as suggestion}
                  <button class="suggestion" onmousedown={() => addEmotion(suggestion)}>
                    {suggestion}
                  </button>
                {/each}
              </div>
            {/if}
            <input
              type="text"
              class="emotion-input"
              placeholder="+ add emotion"
              bind:value={emotionInput}
              onfocus={() => showSuggestions = true}
              onblur={() => setTimeout(() => showSuggestions = false, 150)}
              onkeydown={onEmotionKeydown}
            />
          </div>
        </div>
      {:else if step === 3}
        <TagPicker bind:selected={selectedTags} />
      {:else}
        <div class="preview">
          <EntryCard entry={previewEntry} onDelete={() => {}} />
        </div>
      {/if}
    </div>
  </div>

  <footer class="checkin-footer">
    <button
      class="btn btn-primary full-width"
      onclick={next}
    >
      {step === totalSteps ? (isEditing ? 'Update entry' : 'Save entry') : 'Next'}
    </button>
  </footer>
</div>

<style>
  .checkin {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    padding: var(--space-md);
    padding-top: calc(var(--space-md) + env(safe-area-inset-top));
    overflow-y: auto;
  }

  .checkin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-btn:active {
    background: var(--bg-subtle);
  }

  .header-spacer {
    width: 40px;
  }

  .progress {
    display: flex;
    gap: var(--space-sm);
  }

  .progress .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: all 0.2s ease;
  }

  .progress .dot.active {
    background: var(--accent-soft);
  }

  .progress .dot.current {
    background: var(--accent);
    width: 24px;
    border-radius: 4px;
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .date-row {
    position: relative;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .date-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
  }

  .date-chip:active {
    background: var(--bg-subtle);
  }

  .date-chip.past {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(196, 132, 108, 0.08);
  }

  .date-input-hidden {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .time-dropdown-wrapper {
    position: relative;
  }

  .time-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
  }

  .time-chip:active {
    background: var(--bg-subtle);
  }

  .chevron {
    transition: transform 0.2s ease;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .time-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 10;
    overflow: hidden;
    min-width: 140px;
  }

  .time-option {
    display: block;
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: none;
    background: none;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s ease;
  }

  .time-option:active {
    background: var(--bg-subtle);
  }

  .time-option.selected {
    color: var(--accent);
    font-weight: 500;
  }

  .step-title {
    font-size: var(--text-xl);
    font-weight: 600;
    margin-top: var(--space-lg);
    margin-bottom: var(--space-lg);
    color: var(--text-primary);
  }

  .step-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .discharge-step {
    width: 100%;
    position: relative;
  }

  .discharge-step textarea {
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
    min-height: 80px;
    transition: border-color 0.2s ease;
  }

  .discharge-step textarea:focus {
    outline: none;
    border-color: var(--accent);
  }

  .discharge-step textarea::placeholder {
    color: var(--text-muted);
  }

  .char-count {
    display: block;
    text-align: right;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
    visibility: hidden;
  }

  .char-count.visible {
    visibility: visible;
  }

  .intensity-section {
    margin-top: var(--space-xl);
    margin-bottom: var(--space-xl);
  }

  .intensity-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: var(--space-md);
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .intensity-value {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
  }

  .emotions-section {
    margin-top: var(--space-sm);
  }

  .empty-emotions {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .emotion-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-bottom: var(--space-sm);
  }

  .emotion-tag {
    font-size: var(--text-sm);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    background: var(--bg-card);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-family: var(--font);
    -webkit-tap-highlight-color: transparent;
  }

  .emotion-tag:active {
    opacity: 0.7;
  }

  /* .emotion-tag.primary {
    border-color: var(--text-secondary);
    color: var(--text-primary);
    font-weight: 500;
  } */

  .emotion-tag.manual {
    border-color: var(--text-secondary);
    color: var(--text-primary);
    font-weight: 500;
  }

  .emotion-tag.manual.primary {
    border-width: 2px;
  }

  .emotion-tag.semantic {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .emotion-tag.proximity {
    background: rgba(173, 85, 85, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
  }

  .emotion-input-wrapper {
    margin-top: var(--space-xl);
    position: relative;
  }

  .emotion-input {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: var(--text-sm);
    transition: border-color 0.2s ease;
  }

  .emotion-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .emotion-input::placeholder {
    color: var(--text-muted);
  }

  .suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 10;
    overflow: hidden;
  }

  .suggestion {
    display: block;
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: none;
    background: none;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: var(--text-sm);
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .suggestion:active {
    background: var(--bg-subtle);
  }

  .preview {
    width: 100%;
  }

  .checkin-footer {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    background: var(--bg-primary);
  }

  .btn {
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    font-family: var(--font);
    font-size: var(--text-base);
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .btn-primary {
    background: var(--accent);
    color: white;
    flex: 1;
  }

  .btn-primary:hover {
    background: #b8785f;
  }

  .btn-secondary {
    background: var(--bg-subtle);
    color: var(--text-secondary);
    flex: 0;
    white-space: nowrap;
  }

  .btn.full-width {
    width: 100%;
  }
</style>
