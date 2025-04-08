<script setup>
import { ref, onMounted, watch } from "vue";
import { computed } from "vue";
import { useDatabaseStore } from '../../stores/databaseStore';
// const totalReports = ref([]); // All reports from API
const reportCount = ref(0); // Total reports count based on date filter
// const currentYear = new Date().getFullYear();
// Props
const props = defineProps({
  selectedYear: Number,
  selectedMonth: Number,
  startDate: String,  // Assuming the date is a string (format YYYY-MM-DD)
  endDate: String
});

// const selectedYear1 = ref(props.selectedYear);
// const selectedMonth1 = ref(props.selectedMonth); // JS months are 0-based
// Watch for prop changes and recalculate reports

// Fetch Data
let refreshInterval = null;
const databaseStore = useDatabaseStore();

onMounted(() => {

    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);

});

const computedProperties = {
    reports: "reportsList",
};

const {
    reports,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

const totalReports = computed(() => reports.value);

// Function to count reports based on selected filter
const countReports = () => {
  if (!totalReports.value || totalReports.value.length === 0) {
    reportCount.value = 0;
    return;
  }

  let count = 0;

  totalReports.value.forEach((report) => {
    if (!report.date_received) return;

    const reportDate = report.date_received.split("T")[0]; // Extract YYYY-MM-DD
    const reportYear = new Date(reportDate).getFullYear();
    const reportMonth = new Date(reportDate).getMonth() + 1;

    const isWithinSelectedMonth = reportYear === props.selectedYear && reportMonth === props.selectedMonth;
    const isWithinDateRange = props.startDate && props.endDate 
      ? (reportDate >= props.startDate && reportDate <= props.endDate) 
      : false;

    // Use date range filter if it's selected, otherwise fallback to month-year filter
    if ((props.startDate && props.endDate && isWithinDateRange) ||
        (!props.startDate && !props.endDate && isWithinSelectedMonth)) {
      count++;
    }
  });

  reportCount.value = count;
  console.log(`🔄 Updated Report Count: ${reportCount.value} (Filter: ${props.startDate ? "Date Range" : "Month-Year"})`);
};

// Watch for changes in date range
watch(() => [props.startDate, props.endDate], () => {
  countReports();
});

// Watch for changes in month-year filter
watch(() => [props.selectedYear, props.selectedMonth], () => {
  if (!props.startDate && !props.endDate) { // Only switch if date range is not used
    countReports();
  }
});

</script>

<template>
  <!-- Title -->
  <h2 class="text-base font-medium dark:text-white">
    Total Reports Received
    <ToolTip
      Information="The total reports received is the total number of reports received in the system."
    />
    <!-- Show Month-Year when no date range is selected -->
  <p v-if="!startDate && !endDate" class="text-xs">
    Reports for {{ selectedMonth }}/{{ selectedYear }}
  </p>

  <!-- Show Date Range when a start and end date are selected -->
  <p v-else class="text-xs">
    Reports from {{ startDate }} to {{ endDate }}
  </p>
  </h2>

  <!-- Month Selection -->
  <!-- Selection Dropdown -->
  <div class="grid grid-cols-3 gap-3 items-center">
    <div>
      <!-- <select
        v-model="selectedOption"
        class="w-full px-2 py-1 text-sm font-medium bg-teal-500 text-white rounded-md shadow hover:bg-teal-600 transition duration-200 disabled:opacity-50"
      >
        <option value="all">All</option>
        <option value="day">Today</option>
        <option value="month">By Month</option>
        <option value="week">By Week//Custom</option>
      </select> -->
    </div>

    <!-- Date Range for 'This Week' -->
    <!-- <div class="col-span-2" v-if="selectedOption === 'week'">
      <DateRangePicker @dateRangeSelected="updateDateRange" />
    </div> -->

    <!-- Month & Year Selection for 'This Month' -->
    <!-- <div v-if="selectedOption === 'month'" class="flex col-span-2 gap-2 items-center">
      <monthYearPicker v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1"/>
    </div> -->
  </div>

  <!-- Total Reports Display -->
  <div class="flex justify-center items-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="100px"
      viewBox="0 0 24 24"
      width="100px"
      fill="#54808C"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
    </svg>

    <!-- Percentage Change Display -->
    <div class="flex justify-center items-center space-x-2">
      <div class="text-5xl font-bold dark:text-white">
        {{ reportCount }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>