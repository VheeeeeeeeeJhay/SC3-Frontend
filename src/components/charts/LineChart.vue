<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import axiosClient from "../../axios.js";
import ApexCharts from 'apexcharts';
import { debounce } from 'lodash';
import loader1 from "../loading/loader1.vue";

const source = ref([]);
const report = ref([]);
const isLoading = ref(true);


const lineChart = ref(null);
let chart = null;

const props = defineProps({
  selectedYear: Number,
  selectedMonth: Number,
  startDate: String,
  endDate: String
});

const options = ref({
  colors: ["#4A90E2", "#50C878", "#FF6B6B", "#FFD700"],
  series: [],
  chart: {
    type: "line",
    height: "100%",
    fontFamily: "Inter, sans-serif",
    toolbar: {
      show: true,
      tools: {
        download: true,
      },
    },
  },
  stroke: {
    curve: "smooth",
    width: 4,
  },
  tooltip: {
    shared: true,
    intersect: false,
    followCursor: true,
    theme: 'dark',
    style: {
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
    },
    y: {
      formatter: (value) => `${value} Reports`,
    },
  },
  grid: {
    show: true,
    strokeDashArray: 4,
    borderColor: '#e0e0e0',
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'center',
    labels: {
      useSeriesColors: true,
    },
  },
  xaxis: {
    categories: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    labels: {
      show: true,
      style: {
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 'bold',
        colors: '#ffffff',
      },
    },
    axisBorder: {
      show: true,
      color: '#e0e0e0',
    },
    axisTicks: {
      show: true,
      color: '#e0e0e0',
    },
  },
  yaxis: {
    title: {
      text: "Number of Reports",
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#ffffff',
      },
    },
    labels: {
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 'bold',
        colors: '#ffffff',
      },
    },
  },
  fill: {
    opacity: 0.5,
  },
  markers: {
    size: 6,
    colors: ['#4A90E2', '#50C878', '#FF6B6B', '#FFD700'],
    strokeColor: '#fff',
    strokeWidth: 2,
  },
});

const fetchChartData = async () => {
  try {
    const res = await axiosClient.get('/api/911/dashboard', {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    });
    source.value = res.data.source;
    report.value = res.data.report;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const renderChart = () => {
  if (lineChart.value) {
    chart = new ApexCharts(lineChart.value, options.value);
    chart.render();
  }
};

const updateChart = () => {
  if (!source.value.length || !report.value.length) {
    console.log("No data to update the chart.");
    return;
  }

  let filteredReports = report.value;

  if (props.startDate || props.endDate) {
    filteredReports = filteredReports.filter(rep => {
      const reportDate = new Date(rep.date_received);
      let isValid = true;
      if (props.startDate && reportDate < new Date(props.startDate)) isValid = false;
      if (props.endDate && reportDate > new Date(props.endDate)) isValid = false;
      return isValid;
    });
  } else {
    if (props.selectedYear) {
      filteredReports = filteredReports.filter(rep => {
        const year = new Date(rep.date_received).getFullYear();
        return year === props.selectedYear;
      });
    }
    if (props.selectedMonth) {
      filteredReports = filteredReports.filter(rep => {
        const month = new Date(rep.date_received).getMonth() + 1;
        return month === props.selectedMonth;
      });
    }
  }

  const counts = {};
filteredReports.forEach(rep => {
  counts[rep.source_id] = (counts[rep.source_id] || 0) + 1;
});

const reportCounts = source.value.map(src => counts[src.id] || 0);

  options.value.series = [{
    name: "Number of Reports",
    data: reportCounts
  }];

  options.value.xaxis.categories = source.value.map(src => src.sources);

  if (chart) {
    chart.updateOptions(options.value);
  } else {
    renderChart();
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await fetchChartData();
    renderChart();
    updateChart();
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (chart) chart.destroy();
});

const debouncedUpdateChart = debounce(updateChart, 300);
watch(() => [props.selectedYear, props.selectedMonth, props.startDate, props.endDate],
  debouncedUpdateChart,
  { immediate: true }
);
</script>
<template>

    <div class="w-full h-full p-4 dark:text-white text-gray-800">
      <!-- Title -->   
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Report Trend</h2>
      </div>
      <loader1 v-if="isLoading" class="bg-white/80 h-64" />
  
      <!-- LINE CHART -->
      <div class="dark:text-gray-800 h-64" ref="lineChart"></div>
    </div>
  </template>
  