<script lang="ts">
  import { moodOptions } from "../lib/data/emotions";

  export let mood: number | null = null;

//   const options = [
//     { value: 7, label: moodOptions.label },
//     { value: 6, label: moodOptions.label },
//     { value: 5, label: moodOptions.label},
//     { value: 4, label: moodOptions.label },
//     { value: 3, label: moodOptions.label },
//     { value: 2, label: moodOptions.label },
//     { value: 1, label: moodOptions.label }
//   ];

  function select(value: number) {
    mood = value;
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    /* max-width: 300px; */
  }

  .option {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    padding: 0.75rem 3rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: "background 0.15s ease, transform 0.05s ease";
  }

  .option:hover {
    background: #f5f5f5;
  }

  .option.selected {
    background: #333;
    color: white;
    border-color: #333;
  }

  .option:active {
    transform: scale(0.98);
  }
</style>

<div class="container">
  {#each moodOptions as option}
    <div
    style="background-color: {option.color ? option.color : "#ffffff"}"
      class="option {mood === option.value ? 'selected' : ''}"
      on:click={() => select(option.value)}
    >
      {option.label}
    </div>
  {/each}
</div>
