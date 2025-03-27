<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import axiosClient from '../../axios.js';
import ApexCharts from 'apexcharts';


const source = ref([]);
const report = ref([]);

onMounted(() => {
  axiosClient.get('/api/911/dashboard', {
    headers: {
      'x-api-key': import.meta.env.VITE_API_KEY
    }
  })
    .then((res) => {
      console.log(res, 'bar chart');
      source.value = res.data.source;
      report.value = res.data.report;
      console.log(source.value, 'sources data')

      // updateChart(); // Update the chart after fetching data
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    //   errorMessage.value = 'Failed to load data. Please try again later.';
    });
});
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
      name: "911",
      data: [6234, 5987, 6789, 6123, 6543, 5876],
      color: "#2563EB",
    },
    {
      name: "CDRRMO",
      data: [5876, 6432, 5998, 6654, 6234, 6123],
      color: "#DC2626",
    },
    {
      name: "Icom Radio",
      data: [6543, 5987, 6234, 6789, 5876, 6432],
      color: "#16A34A",
    },
    {
      name: "EMS Hotline",
      data: [6123, 6789, 5876, 6234, 6543, 5987],
      color: "#9333EA",
    },
  ],
  xaxis: {
    categories: ['January', 'February', 'March', 'April', 'May', 'June'],
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
  <div class="w-full p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Crime Statistics</h2>
      <!-- <select v-model="selectedDateFilter" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
        <option value="" disabled>Select Date Range</option>
        <option v-for="filter in dateFilters" :key="filter.value" :value="filter.value">
          {{ filter.name }}
        </option>
      </select> -->
    </div>
    <div ref="lineChart" class="h-64 dark:text-gray-800"></div>
  </div>
</template>
