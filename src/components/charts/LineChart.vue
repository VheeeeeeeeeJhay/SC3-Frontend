<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import ApexCharts from 'apexcharts';
import { useThemeStore } from '../../stores/themeStore';

const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-sky-900"
})
const selectedDateFilter = ref('');
const dateFilters = ref([
  { name: 'Last 7 Days', value: '7d' },
  { name: 'Last 30 Days', value: '30d' },
  { name: 'Last 6 Months', value: '6m' }
]);

const options = ref({
  chart: {
    height: 350,
    maxWidth: "100%",
    type: "line",
    fontFamily: "Inter, sans-serif",
    toolbar: {
      show: true,
      tools: {
        download: true,
      }
    },
  },
  tooltip: {
    enabled: true,
    x: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 4,
    curve: 'smooth'
  },
  grid: {
    show: true,
    strokeDashArray: 4,
  },
  series: [
    {
      name: "Clicks",
      data: [6500, 6418, 6456, 6526, 6356, 6456],
      color: "#1A56DB",
    },
    {
      name: "CPC",
      data: [6456, 6356, 6526, 6332, 6418, 6500],
      color: "#7E3AF2",
    },
  ],
  xaxis: {
    categories: ['01 Feb', '02 Feb', '03 Feb', '04 Feb', '05 Feb', '06 Feb'],
    labels: {
      style: {
        fontFamily: "Inter, sans-serif",
        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
});

const lineChart = ref(null);
let chart = null;

const updateChart = () => {
  if (chart) {
    chart.updateOptions(options.value);
  }
};

watch(selectedDateFilter, () => {
  // Simulate new data based on selected filter
  options.value.series[0].data = options.value.series[0].data.map(() => Math.floor(Math.random() * 7000));
  options.value.series[1].data = options.value.series[1].data.map(() => Math.floor(Math.random() * 7000));
  updateChart();
});

onMounted(() => {
  if (lineChart.value) {
    chart = new ApexCharts(lineChart.value, options.value);
    chart.render();
  }
});

onUnmounted(() => {
  if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full p-4" :class="themeClasses">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Crime Statistics</h2>
      <select v-model="selectedDateFilter" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
        <option value="" disabled>Select Date Range</option>
        <option v-for="filter in dateFilters" :key="filter.value" :value="filter.value">
          {{ filter.name }}
        </option>
      </select>
    </div>
    <div ref="lineChart" class="h-64"></div>
  </div>
</template>
