<script lang="ts">
  import TagPicker from '../components/TagPicker.svelte';
  import { entries } from '../lib/stores/entries';
  import type { EmotionEntry, TimeOfDay } from '../lib/types';
  import MoodSelect from '../components/MoodSelect.svelte';
  import { extractEmotions, getMoodColor, getAllEmotionWords } from '../lib/data/emotions';

  let { onComplete, onCancel }: { onComplete: () => void; onCancel: () => void } = $props();

  let step = $state(1);
  let mood = $state(4);
  let selectedTags: string[] = $state([]);
  let note = $state('');
  let selectedDate = $state(new Date());
  let dateInputEl: HTMLInputElement | undefined = $state();
  let timeOfDay: TimeOfDay = $state('allday');
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

  const totalSteps = 3;

  let canProceed = $derived(
    step === 1 ? note.trim().length > 0 :
    true
  );

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
    const timestamp = isToday ? new Date().toISOString() : selectedDate.toISOString();
    const entry: EmotionEntry = {
      id: generateId(),
      timestamp,
      mood,
      emotions: allEmotions,
      tags: selectedTags,
      note,
      timeOfDay,
    };
    entries.add(entry);
    onComplete();
  }

  let stepTitle = $derived(
    step === 1 ? (isToday ? "What's present right now?" : "What was present?") :
    step === 2 ? 'Behaviour / Context' :
    ''
  );

  let rawInferredEmotions = $derived(extractEmotions(note, mood));
  let dismissedEmotions: string[] = $state([]);
  let manualEmotions: string[] = $state([]);
  let emotionInput = $state('');
  let showSuggestions = $state(false);

  let inferredEmotions = $derived(
    rawInferredEmotions.filter(e => !dismissedEmotions.includes(e))
  );

  let allEmotions = $derived(
    [...new Set([...inferredEmotions, ...manualEmotions])]
  );

  let suggestions = $derived(() => {
    if (emotionInput.trim().length === 0) return [];
    const q = emotionInput.toLowerCase();
    return getAllEmotionWords()
      .filter(e => e.startsWith(q) && !allEmotions.includes(e))
      .slice(0, 5);
  });

  function addEmotion(emotion: string) {
    const trimmed = emotion.trim().toLowerCase();
    if (trimmed && !allEmotions.includes(trimmed)) {
      manualEmotions = [...manualEmotions, trimmed];
    }
    emotionInput = '';
    showSuggestions = false;
  }

  function removeEmotion(emotion: string) {
    manualEmotions = manualEmotions.filter(e => e !== emotion);
    if (rawInferredEmotions.includes(emotion)) {
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

  let isOptionalStep = $derived(step === 2);
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
          <textarea
            bind:value={note}
            placeholder="I am tired and am snapping at everyone..."
            rows="3"
            maxlength="500"
          ></textarea>
          {#if note.length > 0}
            <span class="char-count">{note.length}/500</span>
          {/if}

          <div class="intensity-section">
            <p class="intensity-label">Intensity</p>
            <MoodSelect bind:mood />
          </div>

          <div class="emotions-section">
            <p class="intensity-label">Emotions</p>
            {#if allEmotions.length > 0}
              <div class="emotion-tags">
                {#each inferredEmotions as emotion}
                  <button class="emotion-tag manual" style="border-color: var(--border)" onclick={() => removeEmotion(emotion)}>
                    {emotion}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                {/each}
                {#each manualEmotions as emotion}
                  <button class="emotion-tag manual" style="border-color: var(--border)" onclick={() => removeEmotion(emotion)}>
                    {emotion}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                {/each}
              </div>

            {:else}
              <span class="empty-emotions">No emotions detected</span>
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
        </div>
      {:else if step === 2}
        <TagPicker bind:selected={selectedTags} />
      {:else}
        <div class="summary">
          <p class="summary-text">Ready to save</p>
        </div>
      {/if}
    </div>
  </div>

  <footer class="checkin-footer">
    {#if isOptionalStep}
      <button class="btn btn-secondary" onclick={skip}>Skip</button>
    {/if}
    <button
      class="btn btn-primary"
      class:full-width={!isOptionalStep}
      disabled={!canProceed}
      onclick={next}
    >
      {step === totalSteps ? 'Save' : 'Next'}
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
  }

  .intensity-section {
    margin-top: var(--space-xl);
    margin-bottom: var(--space-xl);
  }

  .intensity-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
  }

  .emotions-section {
    margin-top: var(--space-lg);
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
    border: 1px solid;
    color: var(--text-secondary);
    background: var(--bg-card);
  }

  .emotion-tag.manual {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-family: var(--font);
    -webkit-tap-highlight-color: transparent;
  }

  .emotion-tag.manual:active {
    opacity: 0.7;
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

  .summary {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .summary-text {
    color: var(--text-muted);
    font-size: var(--text-base);
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
