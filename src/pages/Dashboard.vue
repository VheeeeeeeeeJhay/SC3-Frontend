<script setup>

import { ref, computed, onMounted, watch } from "vue";
import axiosClient from "../axios.js";
import PieChart from "../components/charts/PieChart.vue";
import LineChart from "../components/charts/LineChart.vue";
import BarChart from "../components/charts/BarChart.vue";
import IncidentGrowthRate from "../components/widgets/IncidentGrowthRate.vue";
import RecentIncident from "../components/widgets/RecentIncident.vue";
import TotalReportsReceived from "../components/widgets/TotalReportsReceived.vue";
import TopPerforming from "../components/widgets/TopPerforming.vue";

const incidents = ref([]);
const reports = ref([]);

const currentYear = new Date().getFullYear();
const currentMonthIndex = new Date().getMonth(); // 0-based index (January = 0)
const years = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2020 + i); // Ensure inclusion of the current year

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const selectedYear1 = ref(2025);
const selectedMonth1 = ref(months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1]); // Previous month
const selectedMonth2 = ref(months[currentMonthIndex]); // Current month

const filteredMonths2 = computed(() => {
  if (!selectedYear1.value || !selectedMonth1.value) return [];

  const selectedDateIndex = months.indexOf(selectedMonth1.value);

  // If the same year, filter to exclude previous months
  if (selectedYear1.value === currentYear) {
    return months.slice(selectedDateIndex + 1);
  }

  // Different year, allow all months
  return months;
});

// Reset months when year or month selection changes
watch(selectedYear1, () => {
  selectedMonth1.value = null;
  selectedMonth2.value = null;
});

watch(selectedMonth1, () => {
  selectedMonth2.value = null;
});

const errors = ref('');

const fetchData = async () => {
  try {
    const response = await axiosClient.get('/api/911/dashboard', {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY
      }
    })

  } catch (error) {
    console.error('Error fetching data:', error);
    errors.value = error.response.data.error;
  }
};

onMounted(() => {
  axiosClient.get('/api/911/dashboard', {
    headers: {
      'x-api-key': import.meta.env.VITE_API_KEY
    }
  })
    .then((res) => {
      setTimeout(() => {
        incidents.value = res.data;
        reports.value = res.data.report;
        console.log(reports.value, 'report data')
      }, 1500);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      // errorMessage.value = 'Failed to load incidents. Please try again later.';
    });
});

// Function to count reports for a given month
const getReportCountForMonth = (month) => {
  if (!month) return 0;

  const monthIndex = months.indexOf(month) + 1; // Convert to 1-based index (Jan = 1)
  return reports.value.filter(report => {
    const reportDate = new Date(report.date_received);
    return reportDate.getMonth() + 1 === monthIndex;
  }).length;
};

// Compute percentage change dynamically
const percentageChange = computed(() => {
  const count1 = getReportCountForMonth(selectedMonth1.value);
  const count2 = getReportCountForMonth(selectedMonth2.value);

  if (count1 === 0) return count2 > 0 ? 100 : 0; // Avoid division by zero

  return ((count2 - count1) / count1) * 100;
});



const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

// const currentDate = ref(new Date());
const selectedEndDate = ref(formatDate(new Date())); // Current day
const selectedStartDate = ref(formatDate(new Date(new Date().setDate(new Date().getDate() - 6)))); // 6 days ago
const selectedDateRange = ref({ start: selectedStartDate.value, end: selectedEndDate.value });


</script>

<template>
  <div class="min-h-screen">
    <!-- Titleee -->
    <div class="mt-6 px-2 flex justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Overview</h1>
    </div>

    <main class="mx-auto my-6 max-w-7xl px-4 sm:px-6 lg:px-8">

      <div class="grid grid-cols-3 gap-6">
        <div
          class="col-span-1 p-3 bg-gradient-to-b from-sky-50 dark:from-slate-800 to-transparent rounded-lg shadow-lg">
          <IncidentGrowthRate />
        </div>

        <div class="col-span-1 p-3 bg-gradient-to-b from-sky-50 dark:from-slate-800 to-transparent rounded-lg shadow-lg">
          <TotalReportsReceived />
        </div>


        <div class="col-span-1 p-3 bg-gradient-to-b from-sky-50 dark:from-slate-800 to-transparent rounded-lg shadow-lg">
          <TopPerforming />
        </div>
        <!-- <div class="col-span-1 p-3 rounded-lg shadow-md bg-sky-50 border border-gray-300 text-gray-800 dark:bg-slate-800 dark:border-gray-700 dark:text-white h-[260px] flex flex-col justify-between">
          
        </div> -->
      </div>

      <div class="mt-6 grid grid-cols-2 gap-6">
        <!-- linechart -->
        <div
          class="p-6 rounded-lg shadow  bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
          <LineChart />
        </div>

        <div
          class="p-6 rounded-lg shadow  bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
          <BarChart :dateRange="selectedDateRange" class="w-full" />
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-6">
        <!-- linechart -->
        <div
          class="p-6 rounded-lg shadow  bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
          <!-- <LineChart /> -->
           <PieChart />
        </div>

        <div
          class="p-6 rounded-lg shadow  bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
          <RecentIncident />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
#pie-chart {
  background-color: white !important;
}

.apexcharts-toolbar {
  background-color: black !important;
  /* Background color */
  color: white !important;
  /* Text color */
  border-radius: 5px;
  /* Rounded corners */
  padding: 5px;
}

.apexcharts-menu {
  background-color: black !important;
  /* Dropdown menu background */
  color: white !important;
  /* Dropdown text color */
}

.apexcharts-menu-item {
  color: white !important;
}

.apexcharts-menu-item:hover {
  background-color: gray !important;
}
</style>