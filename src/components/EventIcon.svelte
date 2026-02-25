<script lang="ts">
  import { ICON_MAP } from '../lib/data/icons';

  let { name, size = 18, strokeWidth = 1.75 }: {
    name: string;
    size?: number;
    strokeWidth?: number;
  } = $props();

  let IconComponent = $derived(ICON_MAP[name]);
</script>

{#if IconComponent}
  <svelte:component this={IconComponent} {size} {strokeWidth} />
{:else}
  <span style="font-size: {size * 0.8}px; line-height: 1">{name}</span>
{/if}
