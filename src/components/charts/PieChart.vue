<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import axiosClient from "../../axios.js";
import ApexCharts from 'apexcharts';
import { useThemeStore } from '../../stores/themeStore';

const themeStore = useThemeStore();
const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-sky-900"
})
const props = defineProps({
    dateRange: Object // Expecting { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
});

const selectedCaseFilter = ref("");

const data = ref({
  incidentType: '',
  incident: '',
});
// Store Fetch Data From Backend In An Array
const incidents = ref([]);
const assistance = ref([]);

onMounted(() => {
  axiosClient.get('/api/911/report', {
      headers: {
          'x-api-key': '$m@rtC!ty'
      }
  })
  .then((res) => {
      console.log(res);
      incidents.value = res.data.incidents;
      assistance.value = res.data.assistance;
      updateChart();
  })
  .catch((error) => {
      console.error('Error fetching data:', error);
      errorMessage.value = 'Failed to load data. Please try again later.';
  });
});

// Filter The Incident/Case Base On The Assistance Type
const filteredIncidents = computed(() => {
  return data.value.incidentType
    ? incidents.value.filter(incident => incident.assistance_id === data.value.incidentType)
    : incidents.value;
});

const emit = defineEmits(['periodChange']);

// Reactive chart options
const options = ref({
  series: [],
  colors: ["#4A90E2", "#50E3C2", "#B8E986", "#E94E77", "#F7B801"],
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


// Function to update the chart with backend data
const updateChart = () => {
    if (data.value.incidentType) {
        const filteredData = filteredIncidents.value;

        // Assign a default count of 4 for now
        const incidentCounts = filteredData.map(() => 4);
        const incidentLabels = filteredData.map(incident => incident.type);

        // Update chart data
        options.value.series = incidentCounts;
        options.value.labels = incidentLabels;

        emit('periodChange', props.dateRange);

        if (chart) {
            chart.updateOptions(options.value);
        }
    }
};

watch(() => props.dateRange, updateChart, { deep: true });
watch(() => data.value.incidentType, updateChart);

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
      <select id="incidentType" v-model="data.incidentType" class="px-1 py-0.5 text-xxs bg-white text-gray-800 border border-gray-300 rounded hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32">
        <option disabled value="">Select classification</option>
        <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.id">{{ assistance.assistance }}</option>
      </select> 
    </div>
    
    <div ref="pieChart" class="h-32"></div>
  </div>
</template>