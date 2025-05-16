<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import axiosClient from "../../axios.js";
import ApexCharts from 'apexcharts';
import { useDatabaseStore } from "../../stores/databaseStore";

const data = ref({
  incidentType: '',
  incident: '',
});

const errorMessage = ref('');
// Store Fetch Data From Backend In An Array
// const incidents = ref([]);
// const assistance = ref([]);
// const report = ref([]);

const databaseStore = useDatabaseStore();

// let refreshInterval = null;

// onMounted(() => {
//     databaseStore.fetchData();

//     refreshInterval = setInterval(() => {
//         databaseStore.fetchData();
//     }, 50000);
// });

// onUnmounted(() => {
//     if (refreshInterval) {
//         clearInterval(refreshInterval);
//     }
// });

const computedProperties = {
    report: "reports",
    incidents: "incidents",
    assistance: "assistance",
};

const {
    report,
    incidents,
    assistance,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

// Run updateChart whenever reports change
watch(
  () => [report.value, incidents.value, assistance.value],
  () => {
    updateChart();
  }
);
// // Filter The Incident/Case Base On The Assistance Type
// const filteredIncidents = computed(() => {
//   return data.value.incidentType
//     ? incidents.value.filter(incident => incident.assistance_id === data.value.incidentType)
//     : incidents.value;
// });

const emit = defineEmits(['periodChange']);

// Reactive chart options
const options = ref({
  series: [],
  colors: ["#4A90E2", "#50E3C2", "#B8E986", "#E94E77", "#F7B801", "#7D3C98", "#2E86C1", "#28B463", "#F39C12"],
  chart: {
    height: 400, // Fixed height, prevents resizing
    width: 400,  // Fixed width, prevents resizing
    type: "pie",
    redrawOnParentResize: false, 
    parentHeightOffset: 0,
    animations: { enabled: true }
  },
  plotOptions: {
    pie: {
      size: "90%", // Ensures pie stays same size
      customScale: 1, // Prevent auto-scaling
      expandOnClick: false
    }
  },
  stroke: { colors: ["white"], width: 1 },
  labels: [],
  dataLabels: { enabled: true },
  legend: {
    position: "bottom",
    fontSize: "12px",
    floating: false,
    labels: {
        colors: "white", // Set legend text color to white
        useSeriesColors: false, // Ensure it does not override with series colors
    },
    itemMargin: { horizontal: 5, vertical: 5 },
    markers: { width: 10, height: 10 },
    maxHeight: 100, // Prevent legend from shrinking chart
    onItemClick: { toggleDataSeries: true }
  },
  tooltip: { enabled: true, theme: "dark" },
});



const props = defineProps({
  startDate: String,  // format YYYY-MM-DD
  endDate: String
});

const pieChart = ref(null);
let chart = null;

const updateChart = () => {
  let filteredReports = [];

  if (props.startDate && props.endDate) {
    // Filter by Date Range
    const startISO = new Date(props.startDate).toISOString().split("T")[0];
    const endISO = new Date(props.endDate).toISOString().split("T")[0];


    filteredReports = report.value.filter(reportItem => {
      if (!reportItem.date_received) return false;

      const reportDate = new Date(reportItem.date_received).toISOString().split("T")[0];
      return reportDate >= startISO && reportDate <= endISO;
    });

  } else {
    // No date range received
    // console.log("⚠️ No valid date range provided. Skipping chart update.");
    return;
  }

  // console.log("📊 Filtered Reports:", filteredReports);

  if (!data.value.incidentType) {
    // No specific incident filter → Show all classifications
    const classificationCounts = filteredReports.reduce((acc, reportItem) => {
      const incident = incidents.value.find(i => i.id === reportItem.incident_id);
      if (!incident) return acc;

      acc[incident.assistance_id] = (acc[incident.assistance_id] || 0) + 1;
      return acc;
    }, {});

    // console.log("📈 Classification Counts:", classificationCounts);

    const classificationLabels = Object.keys(classificationCounts)
      .map(id => {
        const assist = assistance.value.find(a => a.id === Number(id));
        return assist ? assist.assistance : undefined;
      })
      .filter(label => label !== undefined);

    const classificationData = Object.values(classificationCounts);

    // ✅ Update chart data
    options.value.series = classificationData;
    options.value.labels = classificationLabels;
    // console.log("📊 Final Chart Labels:", classificationLabels);
  } else {
    // 🚀 Filter incidents based on classification
    const selectedIncidents = incidents.value.filter(
      incident => incident.assistance_id === data.value.incidentType
    );

    // console.log("📌 Filtered Incidents:", selectedIncidents);

    // ✅ Count reports only for selected incidents
    const incidentCounts = filteredReports.reduce((acc, reportItem) => {
      if (selectedIncidents.some(incident => incident.id === reportItem.incident_id)) {
        acc[reportItem.incident_id] = (acc[reportItem.incident_id] || 0) + 1;
      }
      return acc;
    }, {});

    // console.log("📊 Filtered Incident Counts:", incidentCounts);

    const validIncidents = selectedIncidents.filter(incident => incidentCounts[incident.id]);
    const incidentCountsArray = validIncidents.map(incident => incidentCounts[incident.id] || 0);
    const incidentLabels = validIncidents.map(incident => incident.type);

    // ✅ Update chart data
    options.value.series = incidentCountsArray;
    options.value.labels = incidentLabels;
  }

  // Update the chart only if it's initialized
  if (!chart) {
    chart = new ApexCharts(pieChart.value, options.value);
    chart.render();
  } else if (chart) {
    chart.updateOptions(options.value);
  }
};

// Watch for changes and update the chart
watch([() => props.startDate, () => props.endDate], () => {
  // console.log("🔄 Date filters changed, updating chart...");
  updateChart();
});

watch(() => data.value.incidentType, updateChart);

onMounted(() => {
  // if (pieChart.value) {
  //   chart = new ApexCharts(pieChart.value, options.value);
  //   chart.render();
  // }
  updateChart();
});

onUnmounted(() => {
  if (chart) chart.destroy();
});
</script>

<template>
  <div class="w-full p-4 text-gray-800 dark:text-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Number of Cases</h2>
      <select id="incidentType" v-model="data.incidentType"
        class="px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded w-32">
        <option value="">All Categories</option>
        <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.id">{{ assistance.assistance }}
        </option>
      </select>
    </div>

    <div class="w-full flex flex-col items-center">
      <div class="chart-wrapper">
        <div ref="pieChart"></div>
      </div>
      <div class="legend-wrapper">
        <div class="legend-scrollable"></div>
      </div>
    </div>


  </div>
</template>

<style scoped>
/* .fixed-chart-container {
  width: 450px; 
  height: 450px; 
  display: flex;
  justify-content: center;
  align-items: center;
} */
.chart-wrapper {
  width: 400px; /* Lock width */
  height: 400px; /* Lock height */
  display: flex;
  justify-content: center;
  align-items: center;
}

.legend-wrapper {
  width: 100%;
  max-height: 100px; /* Prevents it from taking too much space */
  overflow-y: auto; /* Make it scroll if needed */
}

.legend-scrollable {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

</style>
