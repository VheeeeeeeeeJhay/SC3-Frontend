<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import ToolTip from '../../components/ToolTip.vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import monthYearPicker from '../MonthYearPicker.vue';


const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Defaults to current month/year
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1); // 1-based (Jan = 1)

// Derived previous month name and adjusted year
const previousMonthName = computed(() =>
  currentMonth.value === 1 ? months[11] : months[currentMonth.value - 2]
);

const previousYear = computed(() =>
  currentMonth.value === 1 ? currentYear.value - 1 : currentYear.value
);

// Get the month name of the current selection
const currentMonthName = computed(() => months[currentMonth.value - 1]);

let refreshInterval = null;
const databaseStore = useDatabaseStore();

onMounted(() => {
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});

onUnmounted(() => {
  // Clear the interval when the component is unmounted or page is reloaded
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

const computedProperties = {
    reports: "reportsList",
};

const {
    reports,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

// Function to count reports for a given month
const getReportCountForMonth = (monthName, year) => { 
    if (!monthName || !year) return 0; 
        const monthIndex = months.indexOf(monthName) + 1; // Convert to 1-based index (Jan = 1)
        const filteredReports = reports.value.filter(report => {
            const reportDate = new Date(report.date_received);
            const reportMonth = reportDate.getMonth() + 1;
            const reportYear = reportDate.getFullYear();
            return reportMonth === monthIndex && reportYear === year;
        });
    return filteredReports.length;
};


// Calculate % growth rate: ((current - previous) / previous) * 100
const percentageChange = computed(() => {
  const countPrevious = getReportCountForMonth(previousMonthName.value, previousYear.value);
  const countCurrent = getReportCountForMonth(currentMonthName.value, currentYear.value);

  if (countPrevious === 0) return countCurrent > 0 ? 100 : 0;
  return ((countCurrent - countPrevious) / countPrevious) * 100;
});
</script>

<template>
<div class="flex flex-col space-y-1">
  <!-- Title + Tooltip + Date Picker in the same row -->
  <div class="flex items-center justify-between">
    <!-- Left: Title + Tooltip -->
    <div class="flex items-center space-x-2">
      <h2 class="text-base font-medium dark:text-white">
        Growth Rate of Incidents
        <p class="text-xs text-gray-500 dark:text-gray-400">
    Compared to {{ previousMonthName }} {{ previousYear }}
  </p>
      </h2>
      <!-- <ToolTip
        Information="The growth rate of incidents is the percentage change in the number of incidents between two months." /> -->
    </div>

    <!-- Right: Date Picker aligned to far right -->
    <div class="flex-shrink-0">
      <monthYearPicker
        class="w-32"
        v-model:selectedMonth="currentMonth"
        v-model:selectedYear="currentYear"
      />
    </div>
  </div>

  
</div>


    <div class="flex justify-center items-center">
        <div class="flex justify-center items-center">
            <svg v-if="percentageChange < 0" xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24"
                width="100px" fill="#75FB4C">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z" />
            </svg>
            <svg v-if="percentageChange > 0" xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24"
                width="100px" fill="#EA3323">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
            </svg>
            <svg v-if="percentageChange == 0" xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24"
                width="100px" fill="#666666">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M22 12l-4-4v3H3v2h15v3l4-4z" />
            </svg>
        </div>

        <!-- Percentage Change Display -->
        <div class="flex justify-center items-center space-x-2">
            <div class="text-5xl font-bold"
                :class="percentageChange == 0 ? 'text-gray-500' : percentageChange >= 0 ? 'text-red-500' : 'text-green-500'">
                {{ percentageChange.toFixed(2) }}%
            </div>
        </div>
    </div>
</template>

<style scoped></style>
