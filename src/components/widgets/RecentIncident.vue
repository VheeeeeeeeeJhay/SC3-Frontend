<script setup>
import { onMounted, computed, onUnmounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useArrayStore } from '../../stores/arrayStore';

let refreshInterval = null;
const databaseStore = useDatabaseStore();

// onMounted(() => {
//     databaseStore.fetchData();
//     refreshInterval = setInterval(() => {
//         databaseStore.fetchData();
//     }, 50000);
// });

// onUnmounted(() => {
//   // Clear the interval when the component is unmounted or page is reloaded
//   if (refreshInterval) {
//     clearInterval(refreshInterval);
//   }
// });

const computedProperties = {
    recents: "recents",
};

const {
    recents,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

const store = useArrayStore();
const passingData = (recent) => {
    store.clearData();
    store.setData(recent);
}

// onUnmounted(() => {
//     store.clearData();
// })
</script>

<template>
    <div class="w-full h-full p-4 dark:text-white text-gray-800">
      <!-- Title -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Most Recent Reports</h2>
      </div>
  
      <div
        v-for="recent in recents"
        :key="recent.id"
        class="border-l-4 border-teal-500 mb-2 pl-2"
      >
        <RouterLink
          @click="passingData(recent)"
          :to="{ name: 'ReportViewDetails', params: { id: recent.id } }"
          class="group block transition-all duration-300"
        >
          <div
            class="relative p-3 
                    bg-white/5 dark:bg-white/5 
                    backdrop-blur-sm 
                    border border-white/10 
                    rounded-lg 
                    shadow-sm hover:shadow-md 
                    hover:ring-1 hover:ring-teal-500 
                    transition-all duration-300"
          >
            <!-- Animated line -->
            <span
              class="absolute bottom-1 left-3 h-0.5 bg-blue-500 w-0 
                     group-hover:w-[calc(100%-1.5rem)] 
                     transition-all duration-500 ease-out"
            ></span>
  
            <!-- Content -->
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ recent.incident.type }}
            </p>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ recent.assistance.assistance }} - {{ recent.actions.actions }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
              {{ recent.barangay.name }}
            </p>
          </div>
        </RouterLink>
      </div>
    </div>
  </template>
  

<style scoped></style>
