<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import ApexCharts from 'apexcharts';
import { useThemeStore } from '../../stores/themeStore';

const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-sky-900"
})
const props = defineProps({
    dateRange: Object // Expecting { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
});

const emit = defineEmits(['periodChange']);

// Reactive date range
const selectedDateFilter = ref("");
const dateFilters = ref([
  { name: "Last 7 Days", value: "7d" },
  { name: "Last 30 Days", value: "30d" },
  { name: "Last 90 Days", value: "90d" }
]);

const selectedCaseFilter = ref("");
const caseFilters = ref([
  { name: "Police Assistance", value: "police" },
  { name: "Fire Assistance", value: "fire" },
  { name: "Medical Assistance", value: "medical" },
  { name: "Search and Rescue Assistance", value: "rescue" },
  { name: "Medical Non-Emergency", value: "medNonEmer" },
  { name: "Other Non-Emergency", value: "otherNonEmer" },
]);

const generateSampleData = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = [];
    const data = {};
    caseFilters.value.forEach(filter => {
        data[filter.value] = [];
    });

    while (startDate <= endDate) {
        const formattedDate = startDate.toISOString().split('T')[0];
        days.push(formattedDate);

        caseFilters.value.forEach(filter => {
            data[filter.value].push(Math.floor(Math.random() * 100));
        });

        startDate.setDate(startDate.getDate() + 1);
    }

    return { data, categories: days };
};

const options = ref({
    colors: ["#bf1029", "#3f8f29", "#4A90E2", "#50E3C2", "#B8E986", "#F5A623"],
    series: caseFilters.value.map(filter => ({
        name: filter.name,
        data: [],
    })),
    chart: {
        type: "bar",
        height: "100%",
        fontFamily: "Inter, sans-serif",
        toolbar: {
            show: true,
            tools: {
                download: true,
            },
        },
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: "70%",
            borderRadiusApplication: "end",
            borderRadius: 8,
        },
    },
    tooltip: {
        shared: true,
        intersect: false,
        followCursor: true,
        style: {
            fontFamily: "Inter, sans-serif",
        },
    },
    stroke: {
        show: true,
        width: 0,
        colors: ["transparent"],
    },
    grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
            left: 2,
            right: 2,
            top: -14
        },
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: true,
    },
    xaxis: {
        floating: false,
        categories: [],
        labels: {
            show: true,
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
    fill: {
        opacity: 1,
    },
});

const barChart = ref(null);
let chart = null;

const updateChart = () => {
    if (props.dateRange?.start && props.dateRange?.end) {
        const chartData = generateSampleData(props.dateRange.start, props.dateRange.end);
        options.value.series = caseFilters.value.map(filter => ({
            name: filter.name,
            data: chartData.data[filter.value],
        }));
        options.value.xaxis.categories = chartData.categories;
        emit('periodChange', props.dateRange);
        if (chart) {
            chart.updateOptions(options.value);
        }
    }
};

const handleDateFilterChange = () => {
    const today = new Date();
    let start = new Date();
    if (selectedDateFilter.value === "7d") start.setDate(today.getDate() - 7);
    if (selectedDateFilter.value === "30d") start.setDate(today.getDate() - 30);
    if (selectedDateFilter.value === "90d") start.setDate(today.getDate() - 90);
    props.dateRange.start = start.toISOString().split("T")[0];
    props.dateRange.end = today.toISOString().split("T")[0];
    updateChart();
};

watch(() => props.dateRange, updateChart, { deep: true });
watch(selectedDateFilter, handleDateFilterChange);

onMounted(() => {
    if (barChart.value) {
        chart = new ApexCharts(barChart.value, options.value);
        chart.render();
        updateChart();
    }
});

onUnmounted(() => {
    if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full p-4" :class="themeClasses">   
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Case Statistics????</h2>
      <select v-model="selectedDateFilter" class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
        <option value="" disabled>Select Date Range</option>
        <option v-for="filter in dateFilters" :key="filter.value" :value="filter.value">
          {{ filter.name }}
        </option>
      </select>
    </div>
    <!-- BAR CHART -->
    <div ref="barChart"></div>
  </div>
</template>
