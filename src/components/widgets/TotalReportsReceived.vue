<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useDatabaseStore } from '../../stores/databaseStore';

const props = defineProps({
  startDate: String,
  endDate: String
});

const databaseStore = useDatabaseStore();
const reports = computed(() => databaseStore.reportsList);

const filteredReports = computed(() => {
  if (!reports.value || reports.value.length === 0) return 0;

  return reports.value.filter(report => {
    if (!report.date_received) return false;

    const reportDate = report.date_received.split("T")[0];

    return props.startDate && props.endDate
      ? reportDate >= props.startDate && reportDate <= props.endDate
      : false;
  }).length;
});

// Handle automatic refresh
let refreshInterval = null;
onMounted(() => {
  databaseStore.fetchData();
  refreshInterval = setInterval(() => {
    databaseStore.fetchData();
  }, 50000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<template>
  <h2 class="text-base font-medium dark:text-white">
    Total Reports Received
    <p class="text-xs text-gray-500 dark:text-gray-400">
      Reports from {{ startDate }} to {{ endDate }}
    </p>
  </h2>

  <div class="flex justify-center items-center">
    <svg xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 0 24 24" width="100px" fill="#54808C">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
    </svg>
    <!-- <span class="text-5xl font-bold dark:text-white material-icons">report</span> -->
    <div class="flex justify-center items-center space-x-2">
      <div class="text-5xl font-bold dark:text-white">
        {{ filteredReports }}
      </div>
    </div>
  </div>
</template>