<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useArrayStore } from '../../stores/arrayStore';

// Props
const props = defineProps({
  startDate: String,
  endDate: String
});

// Store setup
const databaseStore = useDatabaseStore();
let refreshInterval = null;

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

// Reactive reports list
const reports = computed(() => databaseStore.reports);

// 🧠 Top 3 Barangays
const topBarangays = computed(() => {
  let filteredReports = reports.value;

  // Apply date range
  if (props.startDate || props.endDate) {
    const start = props.startDate ? new Date(props.startDate) : null;
    const end = props.endDate ? new Date(props.endDate) : null;

    filteredReports = filteredReports.filter(rep => {
      const date = new Date(rep.date_received);
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });

    // console.log(`📆 Filtering by date range: ${props.startDate} to ${props.endDate}`);
    // console.log(`✅ Found ${filteredReports.length} reports in date range.`);
  } 

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

  // console.log('🏆 Sorted top barangays:', sorted);

  return sorted.slice(0, 3); // top 3 as array of objects
});

const store = useArrayStore();
const passingData = (barangay) => {
    store.clearBarangayData();

    store.setBarangayData(barangay);
    // console.log(store.getBarangayData());
}

</script>


<template>
  <!-- Title -->
  <h2 class="text-base font-medium dark:text-white text-gray-900">
    Barangay with the Most Cases
  </h2>

  <ul class="mt-2 text-sm space-y-2">
    <li v-for="(barangay, index) in topBarangays" :key="barangay.id">
      <RouterLink @click="passingData(barangay)"
        :to="`/barangay-informations/${barangay.id}`"
        class="flex items-center space-x-2 p-2 rounded-lg 
               hover:bg-gray-300 dark:hover:bg-teal-600 cursor-pointer">
        <span class="text-teal-400">#{{ index + 1 }}</span>
        <!-- Text color based on light/dark mode -->
        <span class="dark:text-white text-gray-900">{{ barangay.name }} ({{ barangay.count }})</span>
      </RouterLink>
    </li>
  </ul>
</template>



<style scoped></style>
