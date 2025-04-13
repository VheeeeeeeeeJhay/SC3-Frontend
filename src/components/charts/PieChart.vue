<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import axiosClient from "../../axios.js";
import ApexCharts from 'apexcharts';




const data = ref({
  incidentType: '',
  incident: '',
});

const errorMessage = ref('');
// Store Fetch Data From Backend In An Array
const incidents = ref([]);
const assistance = ref([]);
const report = ref([]);

onMounted(() => {
  axiosClient.get('/api/911/dashboard', {
    headers: {
      'x-api-key': import.meta.env.VITE_API_KEY
    }
  })
    .then((res) => {
      console.log(res);
      incidents.value = res.data.incidents;
      assistance.value = res.data.assistance;
      report.value = res.data.report;

      // updateChart(); // Update the chart after fetching data
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      errorMessage.value = 'Failed to load data. Please try again later.';
    });
});

// Run updateChart whenever reports change
watch(
  () => [report.value, incidents.value, assistance.value],
  () => {
    updateChart();
    console.log("%cData updated, chart re-rendered.", "color: red; font-weight: bold;");
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
    animations: { enabled: false }
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
  dataLabels: { enabled: false },
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
  selectedYear: Number,
  selectedMonth: Number,
  startDate: String,  // Assuming format YYYY-MM-DD
  endDate: String
});

const pieChart = ref(null);
let chart = null;

const updateChart = () => {
  let filteredReports = [];

  if (props.startDate && props.endDate) {
    // 🎯 **Filter by Date Range**
    const startISO = new Date(props.startDate).toISOString().split("T")[0];
    const endISO = new Date(props.endDate).toISOString().split("T")[0];

    console.log("📅 Filtering reports from", startISO, "to", endISO);

    filteredReports = report.value.filter(reportItem => {
      if (!reportItem.date_received) return false;

      const reportDate = new Date(reportItem.date_received).toISOString().split("T")[0];
      return reportDate >= startISO && reportDate <= endISO;
    });

  } else if (props.selectedYear && props.selectedMonth) {
    // 🎯 **Filter by Year & Month**
    console.log("📆 Filtering reports for:", props.selectedYear, props.selectedMonth);

    filteredReports = report.value.filter(reportItem => {
      if (!reportItem.date_received) return false;

      const reportDate = new Date(reportItem.date_received);
      return (
        reportDate.getFullYear() === props.selectedYear &&
        reportDate.getMonth() + 1 === props.selectedMonth // Months are 0-based in JS
      );
    });
  }

  console.log("📊 Filtered Reports:", filteredReports);

  if (!data.value.incidentType) {
    // 🚀 No specific incident filter → Show all classifications
    const classificationCounts = filteredReports.reduce((acc, reportItem) => {
      const incident = incidents.value.find(i => i.id === reportItem.incident_id);
      if (!incident) return acc;

      acc[incident.assistance_id] = (acc[incident.assistance_id] || 0) + 1;
      return acc;
    }, {});

    console.log("📈 Classification Counts:", classificationCounts);

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
    console.log("📊 Final Chart Labels:", classificationLabels);
  } else {
    // 🚀 Filter incidents based on classification
    const selectedIncidents = incidents.value.filter(
      incident => incident.assistance_id === data.value.incidentType
    );

    console.log("📌 Filtered Incidents:", selectedIncidents);

    // ✅ Count reports only for selected incidents
    const incidentCounts = filteredReports.reduce((acc, reportItem) => {
      if (selectedIncidents.some(incident => incident.id === reportItem.incident_id)) {
        acc[reportItem.incident_id] = (acc[reportItem.incident_id] || 0) + 1;
      }
      return acc;
    }, {});

    console.log("📊 Filtered Incident Counts:", incidentCounts);

    const validIncidents = selectedIncidents.filter(incident => incidentCounts[incident.id]);
    const incidentCountsArray = validIncidents.map(incident => incidentCounts[incident.id] || 0);
    const incidentLabels = validIncidents.map(incident => incident.type);

    // ✅ Update chart data
    options.value.series = incidentCountsArray;
    options.value.labels = incidentLabels;
  }

  // ✅ Update the chart only if it's initialized
  if (chart) {
    chart.updateOptions(options.value);
  }
};

// 🔄 Watch for changes and update the chart accordingly
watch([() => props.startDate, () => props.endDate, () => props.selectedYear, () => props.selectedMonth], () => {
  console.log("🔄 Filters changed, updating chart...");
  updateChart();
});





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
  <div class="w-full p-4 text-gray-800 dark:text-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Number of Cases</h2>
      <select id="incidentType" v-model="data.incidentType"
        class="px-1 py-0.5 text-xxs bg-white text-gray-800 border border-gray-300 rounded hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32">
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
