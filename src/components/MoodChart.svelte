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

  let chartData = $derived((() => {
    const days: { key: string; label: string; valence: number | null; }[] = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const date = daysAgo(i);
      const key = dateKey(date);
      const dayEntries = entries.filter((e) => e.experiencedDate === key);

      let label: string;
      if (range === 'week') {
        label = date.toLocaleDateString([], { weekday: 'short' });
      } else if (range === 'month') {
        label = i % 5 === 0 ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
      } else {
        label = i % 14 === 0 ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
      }

      if (dayEntries.length > 0) {
        const avgValence = dayEntries.reduce((sum, e: any) => {
          // Support old entries with "mood" (1-7) and new entries with "valence" (-3 to +3)
          if (typeof e.mood === 'number' && !isNaN(e.mood)) {
            return sum + (e.mood - 4); // convert 1-7 to -3 to +3
          }
          if (typeof e.valence === 'number' && !isNaN(e.valence)) {
            return sum + e.valence;
          }
          return sum;
        }, 0) / dayEntries.length;
        days.push({ key, label, valence: Math.round(avgValence * 10) / 10 });
      } else {
        days.push({ key, label, valence: null});
      }
    }

    return days;
  })());

  function buildChart() {
    if (!canvasEl || !ChartClass) return;
    if (chart) chart.destroy();

    const data = chartData;

    chart = new ChartClass(canvasEl, {
      type: 'line',
      data: {
        labels: data.map((d)=> d.label),
        datasets: [
          {
            label: '',
            data: data.map((d) => d.valence),
            borderColor: '#55187e',
            backgroundColor: 'rgba(196, 132, 108, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: data.length <= 7 ? 4 : 2,
            pointBackgroundColor: '#55187e',
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
            min: -3,
            max: 3,
            ticks: {
              stepSize: 1,
              font: { family: "'Inter', system-ui, sans-serif", size: 11 },
              color: '#B5AFAA',
              callback: (value: string | number) => {
                const num = Number(value);
                if (num === 3) return '+3';
                if (num === 2) return '+2';
                if (num === 1) return '+1';
                if (num === 0) return '0';
                if (num === -1) return '-1';
                if (num === -2) return '-2';
                if (num === -3) return '-3';
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

  onMount( () => {
    let canceled = false;

    async function init() {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      ChartClass = Chart;
      loading = false;
      if (!canceled) buildChart();
    }

    init();

    return () => {
      canceled = true;
      chart?.destroy();
    };
  });

  // $effect(() => {
  //   const _data = chartData();
  //   const _range = range;
  //   if (ChartClass) buildChart();
  // });

  let lastChartKey = $state(''); // this holds the last snapshot

  $effect(() => {
    if (!ChartClass || !canvasEl) return;

    const data = chartData;   // reactive derived data
    const key = JSON.stringify(data) + range; // compute a key for the data

    if (key === lastChartKey) return; // no change → skip rebuild

    lastChartKey = key; // assign to $state top-level variable

    buildChart();
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
