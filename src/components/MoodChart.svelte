<script lang="ts">
  import { onMount } from 'svelte';
  import type { EmotionEntry, TrendRange } from '../lib/types';
  import { daysAgo, dateKey } from '../lib/utils/dates';

  let { entries, range = 'week' }: { entries: EmotionEntry[]; range: TrendRange } = $props();

  let canvasEl: HTMLCanvasElement | undefined = $state();
  let chart: any = $state();
  let ChartClass: any = $state();
  let loading = $state(true);

  let rangeDays = $derived(
    range === 'week' ? 7 :
    range === 'month' ? 30 :
    90
  );

  let chartData = $derived(() => {
    const days: { key: string; label: string; valence: number | null; energy: number | null }[] = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const date = daysAgo(i);
      const key = dateKey(date);
      const dayEntries = entries.filter((e) => {
        const d = new Date(e.timestamp);
        return dateKey(d) === key;
      });

      let label: string;
      if (range === 'week') {
        label = date.toLocaleDateString([], { weekday: 'short' });
      } else if (range === 'month') {
        label = i % 5 === 0 ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
      } else {
        label = i % 14 === 0 ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
      }

      if (dayEntries.length > 0) {
        const avgValence = dayEntries.reduce((sum, e) => sum + e.valence, 0) / dayEntries.length;
        const avgEnergy = dayEntries.reduce((sum, e) => sum + e.energy, 0) / dayEntries.length;
        days.push({ key, label, valence: Math.round(avgValence * 10) / 10, energy: Math.round(avgEnergy * 10) / 10 });
      } else {
        days.push({ key, label, valence: null, energy: null });
      }
    }

    return days;
  });

  function buildChart() {
    if (!canvasEl || !ChartClass) return;
    if (chart) chart.destroy();

    const data = chartData();

    chart = new ChartClass(canvasEl, {
      type: 'line',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'Valence',
            data: data.map((d) => d.valence),
            borderColor: '#C4846C',
            backgroundColor: 'rgba(196, 132, 108, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: data.length <= 7 ? 4 : 2,
            pointBackgroundColor: '#C4846C',
            spanGaps: true,
          },
          {
            label: 'Energy',
            data: data.map((d) => d.energy),
            borderColor: '#7CA5A0',
            backgroundColor: 'rgba(124, 165, 160, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: data.length <= 7 ? 4 : 2,
            pointBackgroundColor: '#7CA5A0',
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              font: { family: "'Inter', system-ui, sans-serif", size: 12 },
              color: '#8A8380',
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: '#2C2825',
            titleFont: { family: "'Inter', system-ui, sans-serif" },
            bodyFont: { family: "'Inter', system-ui, sans-serif" },
            cornerRadius: 8,
            padding: 12,
          },
        },
        scales: {
          y: {
            min: -5,
            max: 5,
            ticks: {
              stepSize: 2.5,
              font: { family: "'Inter', system-ui, sans-serif", size: 11 },
              color: '#B5AFAA',
              callback: (value: string | number) => {
                const num = Number(value);
                if (num === 5) return '+5';
                if (num === -5) return '-5';
                if (num === 0) return '0';
                return '';
              },
            },
            grid: {
              color: 'rgba(232, 228, 223, 0.5)',
            },
            border: { display: false },
          },
          x: {
            ticks: {
              font: { family: "'Inter', system-ui, sans-serif", size: 11 },
              color: '#B5AFAA',
              maxRotation: 0,
            },
            grid: { display: false },
            border: { display: false },
          },
        },
      },
    });
  }

  onMount(async () => {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);
    ChartClass = Chart;
    loading = false;
    buildChart();
    return () => chart?.destroy();
  });

  $effect(() => {
    const _data = chartData();
    const _range = range;
    if (ChartClass) buildChart();
  });
</script>

<div class="chart-container">
  {#if loading}
    <div class="loading">Loading chart...</div>
  {:else}
    <canvas bind:this={canvasEl}></canvas>
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
    height: 260px;
    position: relative;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
</style>
