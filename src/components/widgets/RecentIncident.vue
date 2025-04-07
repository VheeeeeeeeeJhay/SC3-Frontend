<script setup>
import { onMounted, computed, onUnmounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';

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
    recents: "recents",
};

const {
    recents,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);
</script>

<template>
    <!-- Title -->
    <h2 class="text-base font-medium dark:text-white">
        Top 5 Most Recent Reports <ToolTip Information="The top 5 most recent reports are the 5 most recent reports in the system."/>
    </h2>
    <div v-for="recent in recents" :key="recent.id" class="border-l-5 border-teal-500 mb-2">
        <div class="block p-2 bg-white border border-gray-200 rounded-tr-lg rounded-br-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
        <h5 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">{{ recent.incident.type }}</h5>
        <div class="grid grid-cols-2 grid-rows-1 gap-4">
            <div>
                <p class="font-normal text-gray-700 dark:text-gray-400 truncate">Barangay: </p>
                <span class="font-bold">{{ recent.barangay.name }}</span></div>
            <div>
                <p class="font-normal text-gray-700 dark:text-gray-400 truncate">Assistance: </p>
                <span class="font-bold">{{ recent.assistance.assistance }}</span>
            </div>
        </div>
        <RouterLink :to="{ name: 'ReportViewDetails', params: { id: recent.id } }"
            class="block  py-2 hover:italic dark:hover:text-blue-600">
            View Details
        </RouterLink>
        </div>
    </div>
</template>

<style scoped></style>
