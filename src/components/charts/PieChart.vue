<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import axiosClient from "../../axios.js";
import ApexCharts from 'apexcharts';

const selectedCaseFilter = ref("");

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

      updateChart(); // Update the chart after fetching data
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
      show: false,
      tools: {
        download: true
      }
    }
  },
  stroke: {
    colors: ["white"],
    width: 1,
  },
  labels: [],
  dataLabels: {
    enabled: false,
  },
  legend: {
    position: "bottom",
    fontFamily: "Inter, sans-serif",
    labels: {
      colors: "text-gray-800 dark:text-white",
    }
  },
  tooltip: {
    enabled: true,
    theme: "dark",
  }
});

// Reference for the chart container
const pieChart = ref(null);
let chart = null;

// const updateChart = () => {
//   console.log(assistance.value);
//   console.log(incidents.value);

//   // Count occurrences of each incident_id in report
//   const incidentCounts = report.value.reduce((acc, reportItem) => {
//     const incidentId = reportItem.incident_id;
//     acc[incidentId] = (acc[incidentId] || 0) + 1;
//     return acc;
//   }, {});

//   console.log(incidentCounts, "Incident ID Counts in Reports");

//   // **Use filteredIncidents when filtering is applied, otherwise use all incidents**
//   const selectedIncidents = data.value.incidentType ? filteredIncidents.value : incidents.value;

//   // **Filter incidents that have a count of 1 or more**
//   const validIncidents = selectedIncidents.filter(incident => incidentCounts[incident.id] && incidentCounts[incident.id] > 0);

//   // Map valid incidents to their labels and counts
//   const incidentCountsArray = validIncidents.map(incident => incidentCounts[incident.id] || 0);
//   const incidentLabels = validIncidents.map(incident => incident.type);

//   // Update chart data
//   options.value.series = incidentCountsArray;
//   options.value.labels = incidentLabels;

//   if (chart) {
//     chart.updateOptions(options.value);
//   }
// };

// const updateChart = () => {
//   console.log("Assistance Data:", assistance.value);
//   console.log("Incidents Data:", incidents.value);
//   console.log("Report Data:", report.value);

//   if (!data.value.incidentType) {
//     // **Count all incidents under each assistance_id**
//     const assistanceCounts = assistance.value.map(a => {
//       // Get all incidents that belong to this assistance category
//       const relatedIncidents = incidents.value.filter(i => i.assistance_id === a.id);
      
//       // Sum total occurrences of incidents in this assistance category
//       const totalCount = relatedIncidents.reduce((sum, incident) => {
//         // Count how many times this incident appears in reports
//         const count = report.value.filter(r => r.incident_id === incident.id).length;
//         return sum + count; // Sum counts
//       }, 0);

//       return { id: a.id, label: a.assistance, count: totalCount };
//     }).filter(a => a.count > 0); // Remove empty categories

//     console.log("Grouped Assistance Counts:", assistanceCounts);

//     // Update chart with assistance-based data
//     options.value.series = assistanceCounts.map(a => a.count);
//     options.value.labels = assistanceCounts.map(a => a.label);
//   } else {
//     // **Original logic for filtering**
//     const incidentCounts = report.value.reduce((acc, reportItem) => {
//       const incidentId = reportItem.incident_id;
//       acc[incidentId] = (acc[incidentId] || 0) + 1;
//       return acc;
//     }, {});

//     // **Filter incidents within the selected assistance**
//     const filtered = filteredIncidents.value.filter(incident => incidentCounts[incident.id] > 0);

//     console.log("Filtered Incidents Count:", filtered);

//     // Map filtered incidents to chart labels and data
//     options.value.series = filtered.map(incident => incidentCounts[incident.id] || 0);
//     options.value.labels = filtered.map(incident => incident.type);
//   }

//   if (chart) {
//     chart.updateOptions(options.value);
//   }
// };

const updateChart = () => {
  console.log("Assistance Data:", assistance.value);
  console.log("Incidents Data:", incidents.value);
  console.log("Report Data:", report.value);

  if (!data.value.incidentType) {
    // **No filter selected - Group by assistance_id**
    const assistanceCounts = assistance.value.map(a => {
      // Count reports that belong to this assistance_id
      const totalCount = report.value.filter(r => r.assistance_id === a.id).length;

      return { id: a.id, label: a.assistance, count: totalCount };
    }).filter(a => a.count > 0); // Remove empty categories

    console.log("Grouped Assistance Counts (Corrected):", assistanceCounts);

    // Update chart with assistance-based counts
    options.value.series = assistanceCounts.map(a => a.count);
    options.value.labels = assistanceCounts.map(a => a.label);
  } else {
    // **Filter selected - Group by `sub_assistance_id` inside selected assistance**
    const filteredReports = report.value.filter(r => r.assistance_id === data.value.incidentType);

    const subAssistanceCounts = assistance.value.filter(a => a.id === data.value.incidentType).map(a => {
      // Group by sub_assistance_id within the filtered reports
      const subAssistanceCounts = a.sub_assistance.map(sub => {
        const count = filteredReports.filter(r => r.sub_assistance_id === sub.id).length;
        return { id: sub.id, label: sub.sub_assistance, count };
      }).filter(sub => sub.count > 0); // Remove empty sub-assistances

      return subAssistanceCounts;
    }).flat(); // Flatten the array of sub-assistance counts

    console.log("Filtered Sub-Assistances Counts (Corrected):", subAssistanceCounts);

    // Update chart with filtered sub-assistance data
    options.value.series = subAssistanceCounts.map(sub => sub.count);
    options.value.labels = subAssistanceCounts.map(sub => sub.label);
  }

  if (chart) {
    chart.updateOptions(options.value);
  }
};


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
  <div class="w-full p-4 bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Number of Cases</h2>
      <select id="incidentType" v-model="data.incidentType"
        class="px-1 py-0.5 text-xxs bg-white text-gray-800 border border-gray-300 rounded hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32">
        <option value="">Select classification</option>
        <option v-for="assistance in assistance" :key="assistance.id" :value="assistance.id">{{ assistance.assistance }}
        </option>
      </select>
    </div>

    <div class="h-32" ref="pieChart"></div>
  </div>
</template>

<style scoped>
.apexcharts-toolbar {
  background-color: black !important; /* Background color */
  color: white !important; /* Text color */
  border-radius: 5px; /* Rounded corners */
  padding: 5px;
}

.apexcharts-menu {
  background-color: black !important; /* Dropdown menu background */
  color: white !important; /* Dropdown text color */
}

.apexcharts-menu-item {
  color: white !important;
}

.apexcharts-menu-item:hover {
  background-color: gray !important;
}
</style>
