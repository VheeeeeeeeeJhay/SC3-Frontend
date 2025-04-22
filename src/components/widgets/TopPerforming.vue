<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useArrayStore } from '../../stores/arrayStore';

// Props
const props = defineProps({
  selectedYear: Number,
  selectedMonth: Number,
  startDate: String,
  endDate: String
});

// Months list
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Month-Year state
const selectedMonth2 = ref(months[props.selectedMonth - 1]);
const selectedYear2 = ref(props.selectedYear);

// Watch for prop changes
watch(() => [props.selectedMonth, props.selectedYear], () => {
  selectedMonth2.value = months[props.selectedMonth - 1];
  selectedYear2.value = props.selectedYear;
});

// Store setup
const databaseStore = useDatabaseStore();
onMounted(() => {
  databaseStore.fetchData();
  setInterval(() => databaseStore.fetchData(), 50000);
});

// Reactive reports list
const reports = computed(() => databaseStore.reportsList);

// Helper: Get reports for specific month/year
const getReportsForMonth = (month, year) => {
  const monthIndex = months.indexOf(month) + 1;
  const filtered = reports.value.filter(report => {
    const date = new Date(report.date_received);
    const reportMonth = date.getMonth() + 1;
    const reportYear = date.getFullYear();

    return reportMonth === monthIndex && reportYear === year;
  });

  console.log(`📆 Filtering for: ${month} ${year} (Index: ${monthIndex})`);
  console.log(`✅ Found ${filtered.length} reports for ${month} ${year}`);
  return filtered;
};

// 🧠 Top 3 Barangays
const topBarangays = computed(() => {
  let filteredReports = reports.value;

  // 📅 Step 1: Apply date range if provided
  if (props.startDate || props.endDate) {
    const start = props.startDate ? new Date(props.startDate) : null;
    const end = props.endDate ? new Date(props.endDate) : null;

    filteredReports = filteredReports.filter(rep => {
      const date = new Date(rep.date_received);
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });

    console.log(`📆 Filtering by date range: ${props.startDate} to ${props.endDate}`);
    console.log(`✅ Found ${filteredReports.length} reports in date range.`);
  } 
  // 📆 Step 2: Otherwise filter by month & year
  else if (props.selectedMonth && props.selectedYear) {
    const monthIndex = props.selectedMonth; // 1-based
    const year = props.selectedYear;

    filteredReports = filteredReports.filter(rep => {
      const date = new Date(rep.date_received);
      const reportMonth = date.getMonth() + 1;
      const reportYear = date.getFullYear();

      return reportMonth === monthIndex && reportYear === year;
    });

    console.log(`📅 Filtering for: ${months[props.selectedMonth - 1]} ${year}`);
    console.log(`✅ Found ${filteredReports.length} reports for that month/year.`);
  }

  // 🧠 Count per barangay
  // 🧠 Count per barangay using ID
  const barangayMap = {};

  filteredReports.forEach(report => {
    const brgy = report.barangay;

    // skip if barangay is invalid
    if (!brgy || typeof brgy !== 'object' || !brgy.id) return;

    if (!barangayMap[brgy.id]) {
      barangayMap[brgy.id] = {
        id: brgy.id,
        name: brgy.name,
        longitude: brgy.longitude,
        latitude: brgy.latitude,
        count: 0
      };
    }

    barangayMap[brgy.id].count++;
  });

  const sorted = Object.values(barangayMap).sort((a, b) => b.count - a.count);

  console.log('🏆 Sorted top barangays:', sorted);

  return sorted.slice(0, 3); // top 3 as array of objects
});

const store = useArrayStore();
const passingData = (barangay) => {
    store.clearBarangayData();

    store.setBarangayData(barangay);
    console.log(store.getBarangayData());
}


</script>


<template>
    <!-- Title -->
    <h2 class="text-base font-medium dark:text-white">
        Barangay with the Most Cases <ToolTip Information="The barangay with the highest number of reports."/>
    </h2>

    <ul class="mt-2 text-white text-sm space-y-2">
      <li v-for="(barangay, index) in topBarangays" :key="barangay.id">
        <RouterLink @click="passingData(barangay)"
          :to="`/barangay-statistics/${barangay.id}`"
          class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
        >
          <span class="text-teal-400">#{{ index + 1 }}</span>
          <span>{{ barangay.name }} ({{ barangay.count }})</span>
        </RouterLink>
      </li>
    </ul>


</template>

<style scoped></style>
