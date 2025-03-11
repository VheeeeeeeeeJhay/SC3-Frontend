<script setup>

import { ref, computed, onMounted } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import PieChart from "../components/charts/PieChart.vue";
import LineChart from "../components/charts/LineChart.vue";
import BarChart from "../components/charts/BarChart.vue";


// /👾👾👾👾👾👾👾👾/ //
// Fetch Data From Backend //

const incidents = ref([]);
const reports = ref([]);
const percentage = ref(0);
const selectedMonth1 = ref('');
const selectedMonth2 = ref('');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Compute available months for selectedMonth2
const filteredMonths2 = computed(() => {
  if (!selectedMonth1.value) return months; // If Month 1 is not selected, show all
  const startIndex = months.indexOf(selectedMonth1.value);
  return months.slice(startIndex + 1); // Exclude the current and previous months
});

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

const currentDate = ref(new Date());
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

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      <div class="grid grid-cols-3 gap-6">
        <div
          class="col-span-1 p-6 rounded-lg shadow bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
          <PieChart />
        </div>

        <div
          class="col-span-1 p-6 rounded-lg shadow  bg-sky-50 border-gray-200 text-gray-800 dark:bg-slate-800 dark:border-black dark:text-white">
          <h2 class="text-xl font-semibold mb-4">Recent Activities</h2>


        </div>
        <div
          class="col-span-1 p-4 rounded-xl shadow-lg bg-sky-50 border border-gray-300 text-gray-800 dark:bg-slate-800 dark:border-gray-700 dark:text-white h-[220px] flex flex-col justify-between">

          <!-- Title -->
          <h2 class="text-lg font-semibold text-center">
            Growth Rate of Incidents <span class="text-sm text-gray-500">// Month over Month</span>
          </h2>

          <!-- Month Selection -->
          <div class="flex justify-center space-x-4">
            <select v-model="selectedMonth1"
              class="text-sm bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition duration-300">
              <option value="" disabled>Month 1</option>
              <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
            </select>

            <select v-model="selectedMonth2"
              class="text-sm bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition duration-300">
              <option value="" disabled>Month 2</option>
              <option v-for="month in filteredMonths2" :key="month" :value="month">{{ month }}</option>
            </select>
          </div>

          <svg v-if="percentageChange > 0" xmlns="http://www.w3.org/2000/svg" height="220px" viewBox="0 -960 960 960" width="220px" fill="#78A75A"><path d="m123-240-43-43 292-291 167 167 241-241H653v-60h227v227h-59v-123L538-321 371-488 123-240Z"/></svg>
          <svg v-if="percentageChange < 0" xmlns="http://www.w3.org/2000/svg" height="220px" viewBox="0 0 24 24" width="220px" fill="#EA3323"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>
          <svg v-if="percentageChange == 0" xmlns="http://www.w3.org/2000/svg" height="220px" viewBox="0 0 24 24" width="220px" fill="#666666"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M22 12l-4-4v3H3v2h15v3l4-4z"/></svg>

          <!-- Percentage Change Display -->
          <div class="flex justify-center items-center space-x-2">
            <div class="text-5xl font-bold" :class="percentageChange >= 0 ? 'text-green-500' : 'text-red-500'">
              {{ percentageChange.toFixed(2) }}%
            </div>
            <svg class="w-7 h-7" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="percentageChange >= 0 ? 'M5 13V1m0 0L1 5m4-4 4 4' : 'M5 1v12m0 0l4-4m-4 4L1 9'" />
            </svg>
          </div>
        </div>
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
    </main>
  </div>
</template>

<style scoped>
#pie-chart {
  background-color: white !important;
}
</style>