<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import ApexCharts from 'apexcharts';
import { useThemeStore } from '../../stores/themeStore';

const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-gray-800"
})
const props = defineProps({
    dateRange: Object // Expecting { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
});

const selectedCaseFilter = ref("");
const policeCase = ref([
  { name: "Police Assistance", value: "police" },
  { name: "Fire Assistance", value: "fire" },
  { name: "Medical Assistance", value: "medical" },
  { name: "Search and Rescue Assistance", value: "rescue" },
  { name: "Medical Non-Emergency", value: "medNonEmer" },
  { name: "Other Non-Emergency", value: "otherNonEmer" },
]);

const paCase = ref([
  { name: "Abandoned Child", value: "child" },
  { name: "Abortion", value: "abortion" },
  { name: "Anti-Fencing", value: "antiFencing" }
])

const faCase = ref([
  { name: "Burning Garbage", value: "bGarbage" },
  { name: "Chemical Fire", value: "chemFire" },
  { name: "Grass Fire", value: "grassFire" },
  { name: "Vessel Fire", value: "vesselFire" }
])

const emit = defineEmits(['periodChange']);

// Reactive chart options
const options = ref({
  series: [30, 40, 30],
  colors: ["#4A90E2", "#50E3C2", "#B8E986"],
  chart: {
    height: 350,
    width: "100%",
    type: "pie",
    toolbar: {
      show: true,
      tools: {
        download: true
      }
    }
  },
  stroke: {
    colors: ["white"],
    width: 1,
  },
  labels: ["Direct", "Organic", "Referrals"],
  dataLabels: {
    enabled: false,
  },
  legend: {
    position: "bottom",
    fontFamily: "Inter, sans-serif",
    labels: {
      colors: "#333",
    }
  },
  tooltip: {
    enabled: true,
    theme: "light",
  }
});

// Reference for the chart container
const pieChart = ref(null);
let chart = null;

// Function to generate sample data based on date range
const generateSampleData = () => {
    return [
        Math.floor(Math.random() * 50) + 10,
        Math.floor(Math.random() * 50) + 10,
        Math.floor(Math.random() * 50) + 10
    ];
};

// Update chart based on date range
const updateChart = () => {
    if (props.dateRange?.start && props.dateRange?.end) {
        options.value.series = generateSampleData();
        emit('periodChange', props.dateRange);

        if (chart) {
            chart.updateOptions(options.value);
        }
    }
};

watch(() => props.dateRange, updateChart, { deep: true });

onMounted(() => {
    if (pieChart.value) {
        chart = new ApexCharts(pieChart.value, options.value);
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
      <h2 class="text-xl font-semibold">Number of Cases</h2>
      <select v-model="selectedCaseFilter" class="px-1 py-0.5 text-xxs bg-white text-gray-800 border border-gray-300 rounded hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32">
        <option value="" disabled>Select Type</option>
        <option v-for="filter in policeCase" :key="filter.value" :value="filter.value">
          {{ filter.name }}
        </option>
      </select>
    </div>

    <div ref="pieChart" class="h-32"></div>
  </div>
</template>
