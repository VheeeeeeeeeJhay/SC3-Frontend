<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import axiosClient from "../../axios.js";
import DateRangePicker from "../DateRangePicker.vue";
import monthYearPicker from "../monthYearPicker.vue";
import { useDateStore } from '../../stores/useDateStore';

const dateStore = useDateStore();
const totalReports = ref([]); // All reports from API
const reportCount = ref(0); // Total reports count based on date filter
const selectedOption = ref("day");
const currentYear = new Date().getFullYear();
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const selectedYear1 = ref(currentYear);
const selectedMonth1 = ref(new Date().getMonth() + 1); // JS months are 0-based


// Fetch Data
const fetchData = async () => {
  try {
    const response = await axiosClient.get("/api/911/report-display", {
      headers: { "x-api-key": import.meta.env.VITE_API_KEY },
    });
    totalReports.value = response.data[0]; // Store all reports
    console.log(totalReports.value.length, "✅ Total Reports Loaded");
    countReports(); // Count reports after fetching
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// // date range picker
// const selectedStartDate = ref(null);
// const selectedEndDate = ref(null);

// const updateDateRange = (dateRange) => {
//   selectedStartDate.value = dateRange.start;
//   selectedEndDate.value = dateRange.end;
//   console.log("Updated Start Date:", selectedStartDate.value);
//   console.log("Updated End Date:", selectedEndDate.value);
//   countReports(); // Refresh the report count when date range changes
// };

const convertToISODate = (dateString) => {
  const [month, day, year] = dateString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Function to count reports based on selected filter
const countReports = () => {
  let count = 0;
  const { start, end } = dateStore.dateRange;

  totalReports.value.forEach((report) => {
    const reportDate = report.date_received.split("T")[0]; // Extract date part
    const reportYear = new Date(reportDate).getFullYear();
    const reportMonth = new Date(reportDate).getMonth() + 1;

    if (
      selectedOption.value === "day" &&
      reportDate === formatDate(new Date())
    ) {
      count++;
    } else if (
       selectedOption.value === "week" &&
       start && end
    ) {
      const startDate = convertToISODate(start);
      const endDate = convertToISODate(end);

      if (reportDate >= startDate && reportDate <= endDate) {
        count++;
      }
    } else if (
      selectedOption.value === "month" &&
      reportYear === selectedYear1.value &&
      reportMonth === selectedMonth1.value
    ) {
      count++; // Only count reports from the selected month and year
    }
  });

  reportCount.value = count; // Update total count
};

// Watch for filter changes
watch([selectedOption, selectedMonth1, selectedYear1], countReports);
// watch([selectedStartDate, selectedEndDate, selectedOption], () => {
//   countReports();
// });
watch(() => dateStore.dateRange, countReports, { deep: true });

//date range picker
onMounted(() => {
  fetchData();
  setInterval(fetchData, 60000); // Refresh every 60s
});

const formatDate = (date) => date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

const currentDate = ref(new Date());

onMounted(() => {
  if (dateStore.dateRange.start && dateStore.dateRange.end) {
    updateDateRange({
      start: dateStore.dateRange.start,
      end: dateStore.dateRange.end,
    });
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
    <div class="col-span-2" v-if="selectedOption === 'week'">
      <DateRangePicker @dateRangeSelected="updateDateRange" />
    </div>

    <!-- Month & Year Selection for 'This Month' -->
    <div v-if="selectedOption === 'month'" class="flex col-span-2 gap-2 items-center">
      <monthYearPicker v-model:selectedMonth="selectedMonth1" v-model:selectedYear="selectedYear1"/>
    </div>
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