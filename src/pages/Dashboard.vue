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
import DateRangePicker from "../components/DateRangePicker.vue";
import monthYearPicker from "../components/monthYearPicker.vue";

//import MonthPicker from "vue-month-picker";

// /👾👾👾👾👾👾👾👾/ //
// Fetch Data From Backend //

// const incidents = ref([]);
// const reports = ref([]);

// const currentYear = new Date().getFullYear();
// const currentMonthIndex = new Date().getMonth(); // 0-based index (January = 0)
// const years = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2020 + i); // Ensure inclusion of the current year

// const months = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December'
// ];

// const selectedYear1 = ref(2025);
// const selectedMonth1 = ref(months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1]); // Previous month
// const selectedMonth2 = ref(months[currentMonthIndex]); // Current month
// const monthPicker1 = ref("January");



// const filteredMonths2 = computed(() => {
//   if (!selectedYear1.value || !selectedMonth1.value) return [];

//   const selectedDateIndex = months.indexOf(selectedMonth1.value);

//   // If the same year, filter to exclude previous months
//   if (selectedYear1.value === currentYear) {
//     return months.slice(selectedDateIndex + 1);
//   }

//   // Different year, allow all months
//   return months;
// });

// // Reset months when year or month selection changes
// watch(selectedYear1, () => {
//   selectedMonth1.value = null;
//   selectedMonth2.value = null;
// });

// watch(selectedMonth1, () => {
//   selectedMonth2.value = null;
// });



// onMounted(() => {
//   axiosClient.get('/api/911/dashboard', {
//     headers: {
//       'x-api-key': import.meta.env.VITE_API_KEY
//     }
//   })
//     .then((res) => {
//       setTimeout(() => {
//         incidents.value = res.data;
//         reports.value = res.data.report;
//         console.log(reports.value, 'report data')
//       }, 1500);
//     })
//     .catch((error) => {
//       console.error('Error fetching data:', error);
//       // errorMessage.value = 'Failed to load incidents. Please try again later.';
//     });
// });

// // Function to count reports for a given month
// const getReportCountForMonth = (month) => {
//   if (!month) return 0;

//   const monthIndex = months.indexOf(month) + 1; // Convert to 1-based index (Jan = 1)
//   return reports.value.filter(report => {
//     const reportDate = new Date(report.date_received);
//     return reportDate.getMonth() + 1 === monthIndex;
//   }).length;
// };

// // Compute percentage change dynamically
// const percentageChange = computed(() => {
//   const count1 = getReportCountForMonth(selectedMonth1.value);
//   const count2 = getReportCountForMonth(selectedMonth2.value);

//   if (count1 === 0) return count2 > 0 ? 100 : 0; // Avoid division by zero

//   return ((count2 - count1) / count1) * 100;
// });

//for filters
const currentYear = new Date().getFullYear();
const selectedYear1 = ref(currentYear);
const selectedMonth1 = ref(new Date().getMonth() + 1); // JS months are 0-based
const startDate = ref(null);
const endDate = ref(null);

const updateDateRange = ({ start, end }) => {
  startDate.value = start;
  endDate.value = end;
  console.log("Date Range:", startDate.value, endDate.value);
};

// Fullscreen card logic
const fullscreenCard = ref(null);
const expandCard = (cardName) => {
  fullscreenCard.value = cardName;
};
const closeFullscreen = () => {
  fullscreenCard.value = null;
};

// Handle Escape key to exit fullscreen
const handleKeydown = (e) => {
  if (e.key === "Escape") {
    closeFullscreen();
  }
};
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

// Map string identifiers to components
const componentMap = {
  IncidentGrowthRate,
  TotalReportsReceived,
  TopPerforming,
  LineChart,
  BarChart,
  PieChart,
  RecentIncident,
};

const fullscreenCardComponent = computed(() => {
  return componentMap[fullscreenCard.value] || null;
});
</script>

<template>
  <div class="min-h-screen p-4">
    <!-- Title and Filters -->
    <div class="mt-6 px-2 flex items-center justify-between">
      <h1 class="text-2xl font-bold dark:text-white">Overview</h1>
      <div class="fixed top-4 right-17 z-[999] flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <monthYearPicker v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1" />
      <DateRangePicker class="max-w-sm min-w-[200px] flex-grow" @dateRangeSelected="updateDateRange" />
    </div>
    </div>

    <main class="mx-auto my-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- First Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="relative p-4 card">
          <button @click="expandCard('IncidentGrowthRate')" class="expand-btn">⛶</button>
          <IncidentGrowthRate :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" />
        </div>

        <div class="relative p-4 card">
          <button @click="expandCard('TotalReportsReceived')" class="expand-btn">⛶</button>
          <TotalReportsReceived :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" />
        </div>

        <div class="relative p-4 card">
          <button @click="expandCard('TopPerforming')" class="expand-btn">⛶</button>
          <TopPerforming />
        </div>
      </div>

      <!-- Second Row -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="relative p-4 card">
          <button @click="expandCard('LineChart')" class="expand-btn">⛶</button>
          <LineChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" />
        </div>

        <div class="relative p-4 card">
          <button @click="expandCard('BarChart')" class="expand-btn">⛶</button>
          <BarChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" class="w-full h-full" />
        </div>
      
        <div class="relative p-4 card text-gray-800 dark:text-white">
          <button @click="expandCard('RecentIncident')" class="expand-btn">⛶</button>
          <RecentIncident />
        </div>
      </div>

      <!-- Third Row -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-1 gap-6">
        <div class="relative p-4 card">
          <button @click="expandCard('PieChart')" class="expand-btn">⛶</button>
          <PieChart :selectedYear="selectedYear1" :selectedMonth="selectedMonth1" :startDate="startDate" :endDate="endDate" />
        </div>
      </div>
    </main>

    <!-- Fullscreen Modal -->
    <transition name="modal-fade">
      <div v-if="fullscreenCard" class="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            {{ fullscreenCard }}
          </h2>
          <button @click="closeFullscreen" class="text-2xl close-btn">✕</button>
        </div>

        <component
          :is="fullscreenCardComponent"
          :selectedYear="selectedYear1"
          :selectedMonth="selectedMonth1"
          :startDate="startDate"
          :endDate="endDate"
          class="w-full h-[80vh]"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.card {
  background-color: white;
  border-width: 4px;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 255, 135, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-color: rgba(59, 130, 246, 0.2);
}

.dark .card {
  background-color: black;
  border-color: #1e3a8a;
  box-shadow: inset 0 0 10px rgba(0, 255, 135, 0.3);
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.5);
}

.expand-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  font-size: 1rem;
  color: #a7a7a7;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.expand-btn:hover {
  color: #ffffff;
}

.close-btn {
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}

.close-btn:hover {
  color: red;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

</style>